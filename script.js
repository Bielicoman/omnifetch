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
        document.addEventListener('mousemove', e => {
            const x = e.clientX;
            const y = e.clientY;
            
            // The dot follows instantly
            dot.style.left = `${x}px`;
            dot.style.top = `${y}px`;
            
            // The ring follows with a slight delay (via CSS transition or manual lerp)
            // Here we use CSS transition for simplicity but could use requestAnimationFrame for "stickier" feel
            cursor.style.left = `${x}px`;
            cursor.style.top = `${y}px`;
        });

        document.addEventListener('mousedown', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(0.8)';
            cursor.style.borderColor = '#0088ff';
        });

        document.addEventListener('mouseup', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            cursor.style.borderColor = 'var(--cursor-color)';
        });

        // Hover effect on links and buttons
        const hoverables = 'a, button, .chip, .tool-card, .path-card, .dz-file, .qi-btn';
        document.addEventListener('mouseover', e => {
            if (e.target.closest(hoverables)) {
                cursor.style.transform = 'translate(-50%, -50%) scale(1.8)';
                cursor.style.background = 'rgba(0, 255, 136, 0.1)';
                cursor.style.borderWidth = '1px';
            }
        });

        document.addEventListener('mouseout', e => {
            if (e.target.closest(hoverables)) {
                cursor.style.transform = 'translate(-50%, -50%) scale(1)';
                cursor.style.background = 'transparent';
                cursor.style.borderWidth = '2px';
            }
        });
    }

    // Auto-update copyright year if present
    document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
})();
