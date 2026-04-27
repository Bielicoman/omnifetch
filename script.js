/* OmniFetch landing — micro-interactions */
(() => {
    // Smooth scroll for hash links
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const id = a.getAttribute('href').slice(1);
            const el = id && document.getElementById(id);
            if (el) {
                e.preventDefault();
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Ambient background light. It reacts slowly, without turning into a cursor spotlight.
    const motionOk = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (motionOk) {
        let targetX = 52;
        let targetY = 34;
        let currentX = targetX;
        let currentY = targetY;
        let raf = null;

        const animateAmbient = () => {
            currentX += (targetX - currentX) * 0.045;
            currentY += (targetY - currentY) * 0.045;
            document.documentElement.style.setProperty('--mx', `${currentX.toFixed(2)}%`);
            document.documentElement.style.setProperty('--my', `${currentY.toFixed(2)}%`);
            raf = Math.abs(targetX - currentX) > 0.02 || Math.abs(targetY - currentY) > 0.02
                ? requestAnimationFrame(animateAmbient)
                : null;
        };

        document.addEventListener('mousemove', e => {
            targetX = 48 + ((e.clientX / window.innerWidth) - 0.5) * 8;
            targetY = 32 + ((e.clientY / window.innerHeight) - 0.5) * 7;
            if (!raf) raf = requestAnimationFrame(animateAmbient);
        });
    }

    // Custom Cursor logic
    const cursor = document.getElementById('cursor');
    const dot = document.getElementById('cursorDot');
    if (cursor && dot) {
        document.body.classList.add('custom-cursor-active');

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let cursorX = mouseX, cursorY = mouseY;
        let dotX = mouseX, dotY = mouseY;

        document.addEventListener('mousemove', e => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        const render = () => {
            cursorX += (mouseX - cursorX) * 0.15;
            cursorY += (mouseY - cursorY) * 0.15;
            dotX += (mouseX - dotX) * 0.45;
            dotY += (mouseY - dotY) * 0.45;

            cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
            dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
            requestAnimationFrame(render);
        };
        requestAnimationFrame(render);

        document.addEventListener('mousedown', () => cursor.classList.add('clicking'));
        document.addEventListener('mouseup', () => cursor.classList.remove('clicking'));

        const hoverables = 'a, button, .chip, .tool-card, .path-card, .dz-file, .qi-btn';
        document.addEventListener('mouseover', e => {
            if (e.target.closest(hoverables)) cursor.classList.add('hovering');
        });

        document.addEventListener('mouseout', e => {
            if (e.target.closest(hoverables)) cursor.classList.remove('hovering');
        });
    }

    // Auto-update copyright year if present
    document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
})();
