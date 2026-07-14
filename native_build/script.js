document.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Core DOM links
    const themeToggle = document.getElementById('theme-toggle');
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const palette = document.getElementById('command-palette');
    const commandInput = document.getElementById('command-input');
    const commandList = document.getElementById('command-list');
    const toast = document.getElementById('toast');

    // Render Lucide vectors
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    (() => {
        const savedTheme = localStorage.getItem('jvis-theme');
        const preferredTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
        document.documentElement.dataset.theme = savedTheme || preferredTheme;
    })();

    // Theme controller logic
    const setTheme = (theme) => {
        root.dataset.theme = theme;
        localStorage.setItem('jvis-theme', theme);
        themeToggle?.setAttribute('aria-checked', String(theme === 'light'));
    };

    setTheme(root.dataset.theme || 'dark');
    themeToggle?.addEventListener('click', () => {
        setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
    });

    // Status message toaster
    const showToast = (message) => {
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('is-visible');
        window.clearTimeout(showToast.timeout);
        showToast.timeout = window.setTimeout(() => toast.classList.remove('is-visible'), 2500);
    };

    // Mobile menu behavior
    const closeMobileMenu = () => {
        if (!menuToggle || !mobileMenu) return;
        mobileMenu.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.innerHTML = '<i data-lucide="menu" aria-hidden="true"></i>';
        if (typeof lucide !== 'undefined') lucide.createIcons();
    };

    menuToggle?.addEventListener('click', () => {
        const isOpen = mobileMenu?.classList.toggle('is-open');
        menuToggle.setAttribute('aria-expanded', String(isOpen));
        menuToggle.innerHTML = isOpen ? '<i data-lucide="x" aria-hidden="true"></i>' : '<i data-lucide="menu" aria-hidden="true"></i>';
        if (typeof lucide !== 'undefined') lucide.createIcons();
    });
    mobileMenu?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMobileMenu));

    // Keyboard navigation CLI Command list operations
    const allCommands = () => [...commandList?.querySelectorAll('[role="option"]') || []];
    let commandIndex = 0;

    const visibleCommands = () => allCommands().filter(command => !command.hidden);

    const updateCommandFocus = () => {
        const commands = visibleCommands();
        if (!commands.length) return;
        commandIndex = Math.max(0, Math.min(commandIndex, commands.length - 1));
        commands.forEach((command, index) => {
            command.classList.toggle('is-command-active', index === commandIndex);
        });
        commands[commandIndex].scrollIntoView({ block: 'nearest' });
    };

    const closePalette = () => {
        if (palette?.open) palette.close();
    };

    const executeCommand = (command) => {
        if (!command) return;
        const action = command.dataset.command;
        if (action === 'section') {
            document.querySelector(command.dataset.target)?.scrollIntoView({
                behavior: reduceMotion ? 'auto' : 'smooth',
                block: 'start'
            });
            closePalette();
        } else if (action === 'theme') {
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

    document.querySelectorAll('.command-trigger').forEach(trigger => trigger.addEventListener('click', openPalette));

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
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            commandIndex -= 1;
            updateCommandFocus();
        } else if (event.key === 'Enter' && document.activeElement === commandInput) {
            event.preventDefault();
            executeCommand(visibleCommands()[commandIndex]);
        }
    });

    palette?.addEventListener('click', (event) => {
        if (event.target === palette) closePalette();
    });

    commandInput?.addEventListener('input', () => {
        const query = commandInput.value.trim().toLowerCase();
        allCommands().forEach(command => {
            command.hidden = !command.textContent.toLowerCase().includes(query);
        });
        commandIndex = 0;
        updateCommandFocus();
    });

    commandList?.addEventListener('click', (event) => {
        const command = event.target.closest('[role="option"]');
        if (command?.tagName === 'BUTTON') executeCommand(command);
    });

    // Simplified Interactive Pipeline descriptions
    const architectureDetails = {
        browser: 'Starts action flows on the client side, sending telemetry data or API inputs when actions occur.',
        react: 'Component view state triggers server updates, handling structural render states and layouts dynamically.',
        api: 'Standardized communication endpoint gateway checks validation parameters, JWT authentication structures, and permissions.',
        service: 'Django orchestrates the application business logic, processes model parameters, and interacts with persistent stores or caching layers.',
        cache: 'Redis caches frequently queried parameters or session records to minimize resource expenditure on the PostgreSQL database.',
        data: 'The persistent PostgreSQL database engine ensures structural relational integrity under key restrictions.'
    };

    const architecture = document.querySelector('[data-architecture]');
    const detailText = architecture?.querySelector('.architecture-detail p');
    const detailLabel = architecture?.querySelector('.detail-label');

    const activateNode = (node) => {
        if (!architecture || !node) return;
        const key = node.dataset.node;

        // Highlight nodes
        architecture.querySelectorAll('.architecture-node').forEach(item => {
            const isActive = item === node;
            item.classList.toggle('is-active', isActive);
            item.setAttribute('aria-pressed', String(isActive));
        });

        // Highlight adjacent layout connection lines
        architecture.querySelectorAll('[data-link]').forEach(link => {
            const linkedNodes = link.dataset.link.split(' ');
            link.classList.toggle('is-active', linkedNodes.includes(key));
        });

        if (detailText) detailText.textContent = architectureDetails[key];
        if (detailLabel) detailLabel.textContent = key.toUpperCase();
    };

    architecture?.querySelectorAll('.architecture-node').forEach(node => {
        node.addEventListener('click', () => activateNode(node));
        node.addEventListener('focus', () => activateNode(node));
        node.addEventListener('mouseenter', () => activateNode(node));
    });
    // Skills matrix explorer engine
    const inspector = document.querySelector('.skill-inspector');
    document.querySelectorAll('.skill-chip').forEach(chip => {
        const updateInspector = () => {
            document.querySelectorAll('.skill-chip').forEach(item => item.classList.toggle('is-selected', item === chip));
            if (!inspector) return;

            // SAFE CHECKS ADDED HERE:
            const inspectorTitle = inspector.querySelector('h3');
            const inspectorDesc = inspector.querySelector('p:not(.related-skills)');
            const inspectorRelated = inspector.querySelector('.related-skills');

            if (inspectorTitle) inspectorTitle.textContent = chip.dataset.skill;
            if (inspectorDesc) inspectorDesc.textContent = chip.dataset.description;
            if (inspectorRelated) inspectorRelated.textContent = chip.dataset.related;
        };
        chip.addEventListener('click', updateInspector);
        chip.addEventListener('mouseenter', updateInspector);
    });

    // Safe copy commands
    document.querySelectorAll('.copy-email').forEach(button => {
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

    // On-scroll observer emergence controller
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));

    // Layered pointer physics & soft magnetic spotlight
    if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
        const cursorGlow = document.querySelector('.cursor-glow');
        let pointerX = window.innerWidth / 2;
        let pointerY = window.innerHeight / 2;
        let currentX = pointerX;
        let currentY = pointerY;

        document.body.classList.add('has-pointer');
        document.addEventListener('pointermove', (event) => {
            pointerX = event.clientX;
            pointerY = event.clientY;
        }, { passive: true });

        const updateCursor = () => {
            currentX += (pointerX - currentX) * 0.12;
            currentY += (pointerY - currentY) * 0.12;
            if (cursorGlow) {
                cursorGlow.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
            }
            requestAnimationFrame(updateCursor);
        };
        updateCursor();

        // Interactive cards tilt physics
        document.querySelectorAll('.case-study, .roadmap-grid article, .system-console, .skill-inspector').forEach(card => {
            let tiltFrame;
            card.addEventListener('pointermove', (event) => {
                const box = card.getBoundingClientRect();
                const x = event.clientX - box.left;
                const y = event.clientY - box.top;

                card.style.setProperty('--x', `${x}px`);
                card.style.setProperty('--y', `${y}px`);

                const rotateY = ((x / box.width) - 0.5) * 3;
                const rotateX = ((y / box.height) - 0.5) * -3;

                cancelAnimationFrame(tiltFrame);
                tiltFrame = requestAnimationFrame(() => {
                    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
                });
            }, { passive: true });

            card.addEventListener('pointerleave', () => {
                cancelAnimationFrame(tiltFrame);
                card.style.transform = '';
            });
        });
    }
});