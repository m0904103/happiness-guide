document.addEventListener('DOMContentLoaded', () => {
    /* ─── Elements ─── */
    const themeBtn     = document.getElementById('theme-btn');
    const menuBtn      = document.getElementById('menu-btn');
    const topBtn       = document.getElementById('top-btn');
    const sidebar      = document.getElementById('sidebar');
    const overlay      = document.getElementById('sidebar-overlay');
    const navItems     = document.querySelectorAll('.nav-item');
    const progressBar  = document.getElementById('progress-bar');
    const cards        = document.querySelectorAll('.chapter-card');

    /* ─── Theme ─── */
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    themeBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        applyTheme(current === 'dark' ? 'light' : 'dark');
    });

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        const icon  = themeBtn.querySelector('.theme-icon');
        const label = themeBtn.querySelector('.theme-label');
        if (theme === 'dark') {
            icon.textContent  = '☀️';
            label.textContent = '淺色模式';
        } else {
            icon.textContent  = '🌙';
            label.textContent = '深色模式';
        }
    }

    /* ─── Mobile sidebar ─── */
    function openSidebar()  { sidebar.classList.add('open');  overlay.classList.add('active'); }
    function closeSidebar() { sidebar.classList.remove('open'); overlay.classList.remove('active'); }

    menuBtn.addEventListener('click', (e) => { e.stopPropagation(); sidebar.classList.contains('open') ? closeSidebar() : openSidebar(); });
    overlay.addEventListener('click', closeSidebar);

    /* ─── Nav smooth scroll ─── */
    navItems.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const id = link.getAttribute('href').slice(1);
            const target = document.getElementById(id);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
});
