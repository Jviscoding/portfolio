document.addEventListener('DOMContentLoaded', () => {

    // 1. Initialize Vector/Lucide Icons Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 2. Mobile Responsive Menu Controller
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mouseTracker = document.querySelector(".mouse-tracker")

    let isMenuOpen = false;

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            isMenuOpen = !isMenuOpen;
            if (isMenuOpen) {
                mobileMenu.classList.add('open');
                menuBtn.innerHTML = `<i data-lucide="x"></i>`;
            } else {
                mobileMenu.classList.remove('open');
                menuBtn.innerHTML = `<i data-lucide="menu"></i>`;
            }
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });

        // Auto collapse mobile drawer items when an item links down
        const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
        mobileNavItems.forEach(item => {
            item.addEventListener('click', () => {
                mobileMenu.classList.remove('open');
                isMenuOpen = false;
                menuBtn.innerHTML = `<i data-lucide="menu"></i>`;
                if (typeof lucide !== 'undefined') lucide.createIcons();
            });
        });
    }

    // 3. Native High Performance Scrollspy Layout Engine
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.nav-item');

    function parseScrollspy() {
        let activeSectionId = '';
        const scrollOffsetPosition = window.scrollY + 100; // Offset depth calculation for sticky header boundary

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollOffsetPosition >= sectionTop && scrollOffsetPosition < sectionTop + sectionHeight) {
                activeSectionId = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('nav-active');
            if (item.getAttribute('href') === `#${activeSectionId}`) {
                item.classList.add('nav-active');
            }
        });
    }

    window.addEventListener('scroll', parseScrollspy);
    window.addEventListener('load', parseScrollspy);

    // 4. Modern Intersection Observer Scroll Reveal System (Buttery Fluid Inputs)
    const revealConfiguration = {
        threshold: 0.1, // Element activates once 10% enters standard screen box
        rootMargin: '0px 0px -40px 0px' // Compensates edge buffer zones smoothly
    };

    const sectionRevealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target); // Ensures animation processes exactly once
            }
        });
    }, revealConfiguration);

    // Target elements across page nodes
    const animatedElements = document.querySelectorAll('.reveal, .reveal-scale, .reveal-left');
    animatedElements.forEach(element => {
        sectionRevealObserver.observe(element);
    });



    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;

    let currentX = targetX;
    let currentY = targetY;

    document.addEventListener('mousemove', (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
    });

    function animate() {

        // Lerp
        currentX += (targetX - currentX) * 1;
        currentY += (targetY - currentY) * 1;

        mouseTracker.style.left = `${currentX}px`;
        mouseTracker.style.top = `${currentY}px`;

        requestAnimationFrame(animate);
    }

    animate();
});