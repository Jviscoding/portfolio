document.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const themeToggle = document.getElementById('theme-toggle');
    const themeColor = document.querySelector('meta[name="theme-color"]');
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const palette = document.getElementById('command-palette');
    const commandInput = document.getElementById('command-input');
    const commandList = document.getElementById('command-list');
    const toast = document.getElementById('toast');

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    const setTheme = (theme) => {
        root.dataset.theme = theme;
        localStorage.setItem('jvis-theme', theme);
        themeToggle?.setAttribute('aria-checked', String(theme === 'light'));
        themeColor?.setAttribute('content', theme === 'light' ? '#f7f8fb' : '#0b0e14');
    };

    setTheme(root.dataset.theme || 'dark');
    themeToggle?.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));

    const showToast = (message) => {
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('is-visible');
        window.clearTimeout(showToast.timeout);
        showToast.timeout = window.setTimeout(() => toast.classList.remove('is-visible'), 2600);
    };

    const closeMobileMenu = () => {
        if (!menuToggle || !mobileMenu) return;
        mobileMenu.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Open navigation');
        menuToggle.innerHTML = '<i data-lucide="menu" aria-hidden="true"></i>';
        if (typeof lucide !== 'undefined') lucide.createIcons();
    };

    menuToggle?.addEventListener('click', () => {
        const isOpen = mobileMenu?.classList.toggle('is-open');
        menuToggle.setAttribute('aria-expanded', String(isOpen));
        menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
        menuToggle.innerHTML = isOpen ? '<i data-lucide="x" aria-hidden="true"></i>' : '<i data-lucide="menu" aria-hidden="true"></i>';
        if (typeof lucide !== 'undefined') lucide.createIcons();
    });
    mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMobileMenu));

    const allCommands = () => [...commandList?.querySelectorAll('[role="option"]') || []];
    let commandIndex = 0;

    const visibleCommands = () => allCommands().filter((command) => !command.hidden);
    const updateCommandFocus = () => {
        const commands = visibleCommands();
        if (!commands.length) return;
        commandIndex = Math.max(0, Math.min(commandIndex, commands.length - 1));
        commands.forEach((command, index) => command.classList.toggle('is-command-active', index === commandIndex));
        commands[commandIndex].scrollIntoView({ block: 'nearest' });
    };

    const closePalette = () => {
        if (palette?.open) palette.close();
    };

    const executeCommand = (command) => {
        if (!command) return;
        const action = command.dataset.command;
        if (action === 'section') {
            document.querySelector(command.dataset.target)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
            closePalette();
        }
        if (action === 'theme') {
            setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
            showToast(`Switched to ${root.dataset.theme} theme`);
            closePalette();
        }
    };

    const openPalette = () => {
        if (!palette || palette.open) return;
        palette.showModal();
        commandInput?.focus();
        commandIndex = 0;
        updateCommandFocus();
    };

    document.querySelectorAll('.command-trigger').forEach((trigger) => trigger.addEventListener('click', openPalette));
    document.addEventListener('keydown', (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
            event.preventDefault();
            openPalette();
        }
        if (!palette?.open) return;
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            commandIndex += 1;
            updateCommandFocus();
        }
        if (event.key === 'ArrowUp') {
            event.preventDefault();
            commandIndex -= 1;
            updateCommandFocus();
        }
        if (event.key === 'Enter' && document.activeElement === commandInput) {
            event.preventDefault();
            executeCommand(visibleCommands()[commandIndex]);
        }
    });
    palette?.addEventListener('click', (event) => {
        if (event.target === palette) closePalette();
    });
    commandInput?.addEventListener('input', () => {
        const term = commandInput.value.trim().toLowerCase();
        allCommands().forEach((command) => {
            command.hidden = !command.textContent.toLowerCase().includes(term);
        });
        commandIndex = 0;
        updateCommandFocus();
    });
    commandList?.addEventListener('click', (event) => {
        const command = event.target.closest('[role="option"]');
        if (command?.tagName === 'BUTTON') executeCommand(command);
    });

    const architectureDetails = {
        browser: 'The browser is where a user action starts. Clear feedback and accessible interaction keep the system understandable at the edge.',
        react: 'React turns product workflows into focused client features. The client should request data through an intentional API contract rather than reaching into storage.',
        api: 'A REST API names the boundary between interface and application logic. It is where inputs are validated, errors are shaped, and access is checked.',
        service: 'A backend service coordinates business rules, permissions, and the work that should not live inside the client.',
        data: 'PostgreSQL holds durable application state. Good models, constraints, and queries make the source of truth easier to trust.',
        cache: 'Redis is a learning area for me: useful for cache behavior, queues, and work that should happen outside a request-response path.',
        cloud: 'A deployment environment is part of the system design. It brings practical questions about configuration, observability, and reliable delivery.'
    };
    const architecture = document.querySelector('[data-architecture]');
    const detailText = architecture?.querySelector('.architecture-detail p');
    const detailLabel = architecture?.querySelector('.detail-label');
    const activateNode = (node) => {
        if (!architecture || !node) return;
        const key = node.dataset.node;
        architecture.querySelectorAll('.architecture-node').forEach((item) => {
            const isActive = item === node;
            item.classList.toggle('is-active', isActive);
            item.setAttribute('aria-pressed', String(isActive));
        });
        architecture.querySelectorAll('[data-link]').forEach((link) => {
            link.classList.toggle('is-active', link.dataset.link.split(' ').includes(key));
        });
        if (detailText) detailText.textContent = architectureDetails[key];
        if (detailLabel) detailLabel.textContent = key.toUpperCase();
    };
    architecture?.querySelectorAll('.architecture-node').forEach((node) => {
        node.addEventListener('click', () => activateNode(node));
        node.addEventListener('focus', () => activateNode(node));
    });

    const inspector = document.querySelector('.skill-inspector');
    document.querySelectorAll('.skill-chip').forEach((chip) => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.skill-chip').forEach((item) => item.classList.toggle('is-selected', item === chip));
            if (!inspector) return;
            inspector.querySelector('h3').textContent = chip.dataset.skill;
            inspector.querySelector('p:not(.related-skills)').textContent = chip.dataset.description;
            inspector.querySelector('.related-skills').textContent = chip.dataset.related;
        });
    });

    document.querySelectorAll('.copy-email').forEach((button) => {
        button.addEventListener('click', async () => {
            const email = button.dataset.email;
            try {
                await navigator.clipboard.writeText(email);
                showToast('Email copied to clipboard');
            } catch {
                window.location.href = `mailto:${email}`;
            }
        });
    });

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
    document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

    if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
        const cursorGlow = document.querySelector('.cursor-glow');
        let pointerX = window.innerWidth / 2;
        let pointerY = window.innerHeight / 2;
        let currentX = pointerX;
        let currentY = pointerY;
        let cursorFrame;
        document.body.classList.add('has-pointer');
        document.addEventListener('pointermove', (event) => {
            pointerX = event.clientX;
            pointerY = event.clientY;
        }, { passive: true });
        const updateCursor = () => {
            currentX += (pointerX - currentX) * 0.13;
            currentY += (pointerY - currentY) * 0.13;
            if (cursorGlow) cursorGlow.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
            cursorFrame = requestAnimationFrame(updateCursor);
        };
        updateCursor();

        document.querySelectorAll('.case-study, .roadmap-grid article, .system-console').forEach((card) => {
            let cardFrame;
            card.addEventListener('pointermove', (event) => {
                const box = card.getBoundingClientRect();
                const rotateY = ((event.clientX - box.left) / box.width - 0.5) * 2.2;
                const rotateX = ((event.clientY - box.top) / box.height - 0.5) * -2.2;
                cancelAnimationFrame(cardFrame);
                cardFrame = requestAnimationFrame(() => {
                    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
                });
            }, { passive: true });
            card.addEventListener('pointerleave', () => {
                cancelAnimationFrame(cardFrame);
                card.style.transform = '';
            });
        });
    }
});
