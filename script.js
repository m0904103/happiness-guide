document.addEventListener('DOMContentLoaded', () => {
    /* ─── Elements ─── */

    const menuBtn      = document.getElementById('menu-btn');
    const topBtn       = document.getElementById('top-btn');
    const sidebar      = document.getElementById('sidebar');
    const overlay      = document.getElementById('sidebar-overlay');
    const navItems     = document.querySelectorAll('.nav-item');
    const progressBar  = document.getElementById('progress-bar');
    const cards        = document.querySelectorAll('.chapter-card');



    /* ─── Mobile sidebar ─── */
    function openSidebar()  { sidebar.classList.add('open');  overlay.classList.add('active'); }
    function closeSidebar() { sidebar.classList.remove('open'); overlay.classList.remove('active'); }

    menuBtn.addEventListener('click', (e) => { e.stopPropagation(); sidebar.classList.contains('open') ? closeSidebar() : openSidebar(); });
    overlay.addEventListener('click', closeSidebar);

    /* ─── Nav smooth scroll ─── */
    navItems.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const id = href.slice(1);
                const target = document.getElementById(id);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
            if (window.innerWidth <= 900) closeSidebar();
        });
    });

    /* ─── Reading progress bar ─── */
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const total    = document.documentElement.scrollHeight - window.innerHeight;
        progressBar.style.width = `${Math.min(100, (scrolled / total) * 100)}%`;

        // Back-to-top button visibility
        if (scrolled > 400) {
            topBtn.classList.add('visible');
        } else {
            topBtn.classList.remove('visible');
        }
    }, { passive: true });

    /* ─── Back to top ─── */
    topBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    /* ─── Active nav link on scroll (IntersectionObserver) ─── */
    const observerOptions = {
        root: null,
        rootMargin: '-15% 0px -80% 0px',
        threshold: 0
    };

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navItems.forEach(link => {
                    const href = link.getAttribute('href').slice(1);
                    link.classList.toggle('active', href === id);
                });
            }
        });
    }, observerOptions);

    // Observe hero and all chapters
    const heroSection = document.getElementById('hero');
    if (heroSection) navObserver.observe(heroSection);
    cards.forEach(card => navObserver.observe(card));

    /* ─── Card entrance animation on scroll ─── */
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                cardObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.06 });

    cards.forEach(card => cardObserver.observe(card));

    /* ─── Hero particles ─── */
    const particleContainer = document.getElementById('particles');
    const COLORS = ['#f5a623', '#e84118', '#a29bfe', '#55efc4', '#fdcb6e', '#fd79a8'];
    const COUNT  = 30;

    for (let i = 0; i < COUNT; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = Math.random() * 12 + 4;
        p.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${Math.random() * 100}%;
            background: ${COLORS[Math.floor(Math.random() * COLORS.length)]};
            animation-duration: ${Math.random() * 18 + 12}s;
            animation-delay: ${Math.random() * -20}s;
        `;
        particleContainer.appendChild(p);
    }




    /* ─── Chapter-based Text-to-Speech (TTS) ─── */
    // Inject TTS buttons into each chapter
    document.querySelectorAll('.chapter-eyebrow').forEach(eyebrow => {
        const btn = document.createElement('button');
        btn.className = 'chapter-tts-btn';
        btn.innerHTML = '<span class="icon">🔊</span> 聽本章';
        btn.title = '朗讀本章';
        eyebrow.appendChild(btn);
    });

    let currentUtterance = null;
    let playingBtn = null;

    // Helper to build a queue of DOM nodes and their text for synchronized reading
    function buildTTSQueue(node, queue = []) {
        if (node.nodeType === Node.ELEMENT_NODE) {
            const tag = node.tagName.toLowerCase();
            // Skip visually hidden items or non-content
            if (node.classList.contains('chapter-tts-btn') || tag === 'script' || tag === 'style') return queue;

            const isBlock = ['p', 'li', 'h1', 'h2', 'h3', 'h4', 'th', 'td', 'div'].includes(tag);
            const hasBlockChildren = Array.from(node.children).some(child => 
                ['p', 'li', 'h1', 'h2', 'h3', 'h4', 'th', 'td', 'div', 'ul', 'ol', 'table', 'tbody', 'tr'].includes(child.tagName.toLowerCase())
            );

            if (isBlock && !hasBlockChildren) {
                let text = node.textContent;
                
                // Add prefixes
                if (node.classList.contains('trap-wrong')) text = '考題陷阱是：' + text;
                if (node.classList.contains('trap-right')) text = '正確解答是：' + text;

                // Filter out emojis and symbols
                const symbolsToRemove = [
                    '❌', '✅', '💡', '⚠️', '🥇', '🥈', '🥉', '🇹🇼', '🎯', '🔄', '🌀', '🎵', '🏛️', '👨‍🏫', '👉', '📖', '🎧', '☰', '↑', '↓', '➔', '→',
                    '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨',
                    '＋', '📊', '📉', '📈', '🌍', '🎉', '🔺', '🇵🇹', '🇯🇵', '⚠', '🇼', '🇯', '🌙', '—', '×', '⬜', '️', '·', '🔊', '🗺️', '⏹️', '🔍'
                ];
                symbolsToRemove.forEach(sym => {
                    text = text.split(sym).join('');
                });

                // Fix polyphone pronunciation (破音字修正)
                const pronunciationDict = {
                    '重塑': '蟲塑',
                    '重來': '蟲來',
                    '重建': '蟲建',
                    '重拾': '蟲拾',
                    '重新': '蟲新',
                    '解方': '姐方',
                    '少子高齡化': '勺紫高齡化',
                    '少子化': '勺紫化'
                };
                for (const [wrong, right] of Object.entries(pronunciationDict)) {
                    text = text.split(wrong).join(right);
                }

                if (text.trim().length > 0) {
                    queue.push({ text: text.trim(), node: node });
                }
            } else {
                node.childNodes.forEach(child => buildTTSQueue(child, queue));
            }
        }
        return queue;
    }

    let currentHighlightedNode = null;

    document.querySelectorAll('.chapter-tts-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const synth = window.speechSynthesis;
            const card = btn.closest('.chapter-card');
            
            // Cleanup function for highlighting
            const clearHighlight = () => {
                if (currentHighlightedNode) {
                    currentHighlightedNode.classList.remove('tts-highlight');
                    currentHighlightedNode = null;
                }
            };

            // If already playing this chapter, stop it
            if (playingBtn === btn) {
                synth.cancel();
                clearHighlight();
                playingBtn.classList.remove('active');
                playingBtn.innerHTML = '<span class="icon">🔊</span> 聽本章';
                playingBtn = null;
                return;
            }

            // Stop any ongoing speech from other buttons
            synth.cancel();
            clearHighlight();
            if (playingBtn) {
                playingBtn.classList.remove('active');
                playingBtn.innerHTML = '<span class="icon">🔊</span> 聽本章';
            }

            const queue = buildTTSQueue(card);
            if (queue.length === 0) return;

            playingBtn = btn;
            playingBtn.classList.add('active');
            playingBtn.innerHTML = '<span class="icon">⏹️</span> 停止';

            let currentIndex = 0;
            
            function speakNext() {
                if (currentIndex >= queue.length || playingBtn !== btn) {
                    if (playingBtn === btn) {
                        clearHighlight();
                        playingBtn.classList.remove('active');
                        playingBtn.innerHTML = '<span class="icon">🔊</span> 聽本章';
                        playingBtn = null;
                    }
                    return;
                }
                
                const currentItem = queue[currentIndex];
                window._currentUtterance = new SpeechSynthesisUtterance(currentItem.text);
                window._currentUtterance.lang = 'zh-TW';
                window._currentUtterance.rate = 1.0;
                
                window._currentUtterance.onstart = () => {
                    clearHighlight();
                    currentHighlightedNode = currentItem.node;
                    currentHighlightedNode.classList.add('tts-highlight');
                    
                    // Smoothly scroll the highlighted node into view if it's not fully visible
                    const rect = currentHighlightedNode.getBoundingClientRect();
                    const isVisible = (
                        rect.top >= 0 &&
                        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
                    );
                    if (!isVisible) {
                        currentHighlightedNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                };

                window._currentUtterance.onend = () => {
                    currentIndex++;
                    speakNext();
                };
                window._currentUtterance.onerror = () => {
                    currentIndex++;
                    speakNext();
                };

                synth.speak(window._currentUtterance);
            }

            // Wait a brief moment for the browser to fully flush the previous speech queue (Mobile bug fix)
            setTimeout(() => {
                speakNext();
            }, 250);
        });
    });

    window.addEventListener('beforeunload', () => {
        window.speechSynthesis.cancel();
    });
});
