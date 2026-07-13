document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons.
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mouseTracker = document.querySelector('.mouse-tracker');
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('section[id]');
    const animatedElements = document.querySelectorAll('.reveal, .reveal-scale, .reveal-left');

    let isMenuOpen = false;

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            isMenuOpen = !isMenuOpen;
            mobileMenu.classList.toggle('open', isMenuOpen);
            menuBtn.setAttribute('aria-expanded', String(isMenuOpen));
            menuBtn.setAttribute('aria-label', isMenuOpen ? 'Close navigation menu' : 'Open navigation menu');
            menuBtn.innerHTML = isMenuOpen ? '<i data-lucide="x"></i>' : '<i data-lucide="menu"></i>';
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        });

        document.querySelectorAll('.mobile-nav-item').forEach(item => {
            item.addEventListener('click', () => {
                isMenuOpen = false;
                mobileMenu.classList.remove('open');
                menuBtn.setAttribute('aria-expanded', 'false');
                menuBtn.setAttribute('aria-label', 'Open navigation menu');
                menuBtn.innerHTML = '<i data-lucide="menu"></i>';
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            });
        });
    }

    function parseScrollspy() {
        let activeSectionId = '';
        const scrollOffsetPosition = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollOffsetPosition >= sectionTop && scrollOffsetPosition < sectionTop + sectionHeight) {
                activeSectionId = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            const isActive = item.getAttribute('href') === `#${activeSectionId}`;
            item.classList.toggle('nav-active', isActive);
            if (isActive) {
                item.setAttribute('aria-current', 'page');
            } else {
                item.removeAttribute('aria-current');
            }
        });
    }

    window.addEventListener('scroll', parseScrollspy, { passive: true });
    window.addEventListener('load', parseScrollspy);

    const revealConfiguration = {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    };

    const sectionRevealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, revealConfiguration);

    animatedElements.forEach(element => {
        sectionRevealObserver.observe(element);
    });

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (mouseTracker && !reduceMotion) {
        let targetX = window.innerWidth / 2;
        let targetY = window.innerHeight / 2;
        let currentX = targetX;
        let currentY = targetY;

        document.addEventListener('pointermove', (e) => {
            targetX = e.clientX;
            targetY = e.clientY;
        }, { passive: true });

        function animate() {
            currentX += (targetX - currentX) * 0.12;
            currentY += (targetY - currentY) * 0.12;

            mouseTracker.style.left = `${currentX}px`;
            mouseTracker.style.top = `${currentY}px`;

            requestAnimationFrame(animate);
        }

        animate();
    }
});
