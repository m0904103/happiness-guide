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
            if (node.classList.contains('chapter-tts-btn') || node.classList.contains('trap-header') || tag === 'script' || tag === 'style') return queue;

            const isBlock = ['p', 'li', 'h1', 'h2', 'h3', 'h4', 'th', 'td', 'div'].includes(tag);
            const hasBlockChildren = Array.from(node.children).some(child => 
                ['p', 'li', 'h1', 'h2', 'h3', 'h4', 'th', 'td', 'div', 'ul', 'ol', 'table', 'tbody', 'tr'].includes(child.tagName.toLowerCase())
            );

            if (isBlock && !hasBlockChildren) {
                // Manually extract text to properly skip ignored child nodes (like the TTS button itself)
                let text = '';
                function extractClean(n) {
                    if (n.nodeType === Node.TEXT_NODE) {
                        text += n.nodeValue;
                    } else if (n.nodeType === Node.ELEMENT_NODE) {
                        if (n.classList.contains('chapter-tts-btn') || n.classList.contains('trap-header') || n.tagName.toLowerCase() === 'script' || n.tagName.toLowerCase() === 'style') return;
                        n.childNodes.forEach(extractClean);
                    }
                }
                extractClean(node);
                
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

                // Smooth out UI instructions
                text = text.replace(/「\s*聽本章\s*」/g, '朗讀');
                text = text.replace(/「\s*選單\s*」/g, '選單');

                // Convert 4-digit years to be read digit-by-digit (e.g., 1869年 -> 一八六九年)
                text = text.replace(/(\d{4})\s*年/g, (match, year) => {
                    const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
                    return year.split('').map(d => digits[parseInt(d)]).join('') + '年';
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

      // ==========================================
    // TTS Player State Management
    // ==========================================
    const TTSPlayer = {
        queue: [],
        currentIndex: 0,
        synth: window.speechSynthesis,
        activeButton: null,
        highlightedNode: null,
        isPaused: false,
        wakeLockObj: null,
        
        ui: {
            player: document.getElementById('tts-player'),
            title: document.getElementById('tts-player-title'),
            btnPrev: document.getElementById('tts-prev'),
            btnPlayPause: document.getElementById('tts-playpause'),
            btnNext: document.getElementById('tts-next'),
            btnStop: document.getElementById('tts-stop')
        },

        init() {
            if (!this.ui.player) return;
            this.ui.btnStop.addEventListener('click', () => this.stop());
            this.ui.btnPlayPause.addEventListener('click', () => this.togglePlayPause());
            this.ui.btnNext.addEventListener('click', () => this.next());
            this.ui.btnPrev.addEventListener('click', () => this.prev());
        },

        clearHighlight() {
            if (this.highlightedNode) {
                this.highlightedNode.classList.remove('tts-highlight');
                this.highlightedNode = null;
            }
        },

        resetActiveButton() {
            if (this.activeButton) {
                this.activeButton.classList.remove('active');
                if (this.activeButton.id === 'play-all-tts-btn') {
                    this.activeButton.innerHTML = '<span style="font-size: 1.4rem;">▶️</span> 全部連續朗讀 (Podcast 模式)';
                } else {
                    this.activeButton.innerHTML = '<span class="icon">🔊</span> 聽本章';
                }
                this.activeButton = null;
            }
        },

        start(btn, queue, chapterTitle) {
            this.stop(); // Stop any current playback completely
            this.requestWakeLock(); // Prevent screen sleep
            this.queue = queue;
            this.currentIndex = 0;
            this.activeButton = btn;
            this.isPaused = false;
            
            // Update UI
            this.activeButton.classList.add('active');
            if (this.activeButton.id === 'play-all-tts-btn') {
                this.activeButton.innerHTML = '<span style="font-size: 1.4rem;">🔊</span> 播客模式朗讀中...';
            } else {
                this.activeButton.innerHTML = '<span class="icon">🔊</span> 朗讀中...';
            }
            this.ui.title.textContent = '正在朗讀：' + chapterTitle;
            this.ui.player.classList.remove('hidden');
            this.ui.btnPlayPause.textContent = '⏸️';

            // Wait a brief moment to flush mobile TTS queues
            setTimeout(() => this.speakNext(), 100);
        },

        stop() {
            this.synth.cancel();
            this.clearHighlight();
            this.resetActiveButton();
            this.releaseWakeLock(); // Allow screen sleep
            if (this.ui.player) this.ui.player.classList.add('hidden');
            this.queue = [];
            this.isPaused = false;
        },

        togglePlayPause() {
            if (this.synth.paused) {
                this.synth.resume();
                this.isPaused = false;
                this.ui.btnPlayPause.textContent = '⏸️';
            } else if (this.synth.speaking) {
                this.synth.pause();
                this.isPaused = true;
                this.ui.btnPlayPause.textContent = '▶️';
            }
        },

        next() {
            if (this.currentIndex < this.queue.length - 1) {
                this.synth.cancel(); // triggers onend/onerror which normally increments, so we manually do it
                // Wait for the cancel event to clear before restarting
                setTimeout(() => {
                    this.currentIndex++;
                    this.speakNext();
                }, 10);
            } else {
                this.stop();
            }
        },

        prev() {
            this.synth.cancel();
            setTimeout(() => {
                if (this.currentIndex > 0) {
                    this.currentIndex--;
                }
                this.speakNext(); // replay current or previous block
            }, 10);
        },

        speakNext() {
            if (this.currentIndex >= this.queue.length || this.currentIndex < 0) {
                this.stop();
                return;
            }

            this.ui.btnPlayPause.textContent = '⏸️';
            this.isPaused = false;

            const currentItem = this.queue[this.currentIndex];
            window._currentUtterance = new SpeechSynthesisUtterance(currentItem.text);
            window._currentUtterance.lang = 'zh-TW';
            window._currentUtterance.rate = 1.0;

            window._currentUtterance.onstart = () => {
                this.clearHighlight();
                this.highlightedNode = currentItem.node;
                this.highlightedNode.classList.add('tts-highlight');

                const rect = this.highlightedNode.getBoundingClientRect();
                const isVisible = (rect.top >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight));
                if (!isVisible) {
                    this.highlightedNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            };

            window._currentUtterance.onend = (e) => {
                // If it was canceled manually by next()/prev()/stop(), skip auto-increment
                if (this.queue.length === 0) return;
                
                this.currentIndex++;
                this.speakNext();
            };

            window._currentUtterance.onerror = (e) => {
                if (e.error === 'canceled' || e.error === 'interrupted') return;
                if (this.queue.length === 0) return;
                this.currentIndex++;
                this.speakNext();
            };

            this.synth.speak(window._currentUtterance);
        },

        async requestWakeLock() {
            if ('wakeLock' in navigator) {
                try {
                    this.wakeLockObj = await navigator.wakeLock.request('screen');
                    this.wakeLockObj.addEventListener('release', () => {
                        console.log('Screen Wake Lock released');
                    });
                    console.log('Screen Wake Lock acquired');
                } catch (err) {
                    console.error(`Wake Lock error: ${err.name}, ${err.message}`);
                }
            }
        },

        releaseWakeLock() {
            if (this.wakeLockObj !== null) {
                this.wakeLockObj.release()
                    .then(() => {
                        this.wakeLockObj = null;
                    });
            }
        }
    };

    // Re-acquire wake lock if page becomes visible again while playing
    document.addEventListener('visibilitychange', async () => {
        if (TTSPlayer.wakeLockObj !== null && document.visibilityState === 'visible' && !TTSPlayer.isPaused && TTSPlayer.queue.length > 0) {
            await TTSPlayer.requestWakeLock();
        }
    });

    // Initialize the player UI
    TTSPlayer.init();

    const playAllBtn = document.getElementById('play-all-tts-btn');
    if (playAllBtn) {
        playAllBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            if (TTSPlayer.activeButton === playAllBtn) {
                TTSPlayer.togglePlayPause();
                return;
            }

            let fullQueue = [];
            document.querySelectorAll('.chapter-card').forEach(card => {
                // If it's a card with a button, extract text
                if (card.querySelector('.chapter-tts-btn') || card.id === 'exam-prep' || card.id === 'concepts') {
                    const queue = buildTTSQueue(card);
                    fullQueue = fullQueue.concat(queue);
                }
            });

            if (fullQueue.length === 0) return;

            TTSPlayer.start(playAllBtn, fullQueue, '全書總複習 (Podcast 模式)');
        });
    }

    document.querySelectorAll('.chapter-tts-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.chapter-card');
            
            if (TTSPlayer.activeButton === btn) {
                TTSPlayer.togglePlayPause();
                return;
            }

            const queue = buildTTSQueue(card);
            if (queue.length === 0) return;

            const titleEl = card.querySelector('.chapter-title') || card.querySelector('.chapter-num-label');
            const chapterTitle = titleEl ? titleEl.textContent.trim() : '章節內容';

            TTSPlayer.start(btn, queue, chapterTitle);
        });
    });

    window.addEventListener('beforeunload', () => {
        window.speechSynthesis.cancel();
    });
});
