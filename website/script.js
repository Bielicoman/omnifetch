/* OmniFetch — Interactions & Terminal Animation v3 */
(() => {
  'use strict';
  const motionOk = !matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Smooth scroll ──
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const el = id && document.getElementById(id);
      if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      document.getElementById('navLinks')?.classList.remove('open');
    });
  });

  // ── Mobile nav ──
  document.getElementById('navToggle')?.addEventListener('click', () => {
    document.getElementById('navLinks')?.classList.toggle('open');
  });

  // ── Navbar scroll ──
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ── Scroll Reveal ──
  if (motionOk) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal-item').forEach(el => obs.observe(el));
  } else {
    document.querySelectorAll('.reveal-item').forEach(el => el.classList.add('visible'));
  }

  // ════════════════════════════════════════════
  // TERMINAL ANIMATION
  // ════════════════════════════════════════════
  const termLines = document.getElementById('termLines');
  const termReplay = document.getElementById('termReplay');
  const termWindow = document.getElementById('terminalWindow');
  const termSteps = document.getElementById('termSteps');

  function setStep(n) {
    if (!termSteps) return;
    termSteps.querySelectorAll('.term-step-pill').forEach(p => {
      const s = +p.dataset.step;
      p.classList.toggle('active', s === n);
      p.classList.toggle('done', s < n);
    });
  }

  // Brand art — compact, always readable
  const LOGO = [
    ' ██████  ███    ███ ███    ██ ██ ███████ ███████ ████████  ██████  ██   ██ ',
    '██    ██ ████  ████ ████   ██ ██ ██      ██         ██    ██    ██ ██   ██ ',
    '██    ██ ██ ████ ██ ██ ██  ██ ██ █████   █████      ██    ██    ██ ███████ ',
    '██    ██ ██  ██  ██ ██  ██ ██ ██ ██      ██         ██    ██    ██ ██   ██ ',
    ' ██████  ██      ██ ██   ████ ██ ██      ███████    ██     ██████  ██   ██ ',
  ];

  function brandLines() {
    return [
      { type: 'output', text: '' },
      ...LOGO.map(l => ({ type: 'output', text: l, cls: 'term-brand' })),
      { type: 'output', text: '' },
    ];
  }

  function sep() { return { type: 'sep' }; }

  const SCRIPT = [
    // ═══ STEP 1 — INSTALAÇÃO ═══
    { type: 'step', num: 1 },
    { type: 'prompt', text: '> ', delay: 500 },
    { type: 'cmd', text: 'OMNIFETCH.vbs', typeSpeed: 50 },
    { type: 'pause', delay: 600 },
    ...brandLines(),
    { type: 'output', text: '  OMNIFETCH — primeira execucao', cls: 'term-highlight term-bold' },
    sep(),
    { type: 'pause', delay: 400 },
    { type: 'output', text: '' },
    { type: 'output', text: '  Baixando os motores (uma vez so):', cls: 'term-cmd' },
    { type: 'output', text: '    yt-dlp    downloader universal', cls: 'term-success' },
    { type: 'output', text: '    FFmpeg    merge audio/video', cls: 'term-success' },
    { type: 'output', text: '' },
    { type: 'pause', delay: 600 },
    sep(),
    { type: 'output', text: '  [1/2] yt-dlp', cls: 'term-info' },
    { type: 'output', text: '  baixando: yt-dlp.exe', cls: 'term-dim' },
    { type: 'pause', delay: 700 },
    { type: 'output', text: '  [ok] yt-dlp.exe', cls: 'term-success term-bold' },
    { type: 'pause', delay: 300 },
    { type: 'output', text: '  [2/2] FFmpeg', cls: 'term-info' },
    { type: 'output', text: '  baixando: ffmpeg-release-essentials.zip', cls: 'term-dim' },
    { type: 'pause', delay: 800 },
    { type: 'output', text: '  [ok] ffmpeg.exe', cls: 'term-success term-bold' },
    { type: 'pause', delay: 400 },
    { type: 'output', text: '' },
    { type: 'output', text: '  Setup finalizado. Iniciando o OMNIFETCH...', cls: 'term-success term-bold' },
    { type: 'pause', delay: 1800 },

    // ═══ STEP 2 — SERVIDOR + INTERFACE WEB ═══
    { type: 'clear' },
    { type: 'step', num: 2 },
    { type: 'prompt', text: '> ', delay: 500 },
    { type: 'cmd', text: 'node server/dist/index.js', typeSpeed: 35 },
    { type: 'pause', delay: 600 },
    ...brandLines(),
    { type: 'output', text: '  OMNIFETCH rodando localmente', cls: 'term-output' },
    sep(),
    { type: 'pause', delay: 400 },
    { type: 'output', text: '' },
    { type: 'output', text: '  Interface: http://127.0.0.1:4777', cls: 'term-highlight term-bold' },
    { type: 'output', text: '' },
    { type: 'output', text: '  yt-dlp: ok   ffmpeg: ok', cls: 'term-success' },
    { type: 'output', text: '  modo: 100% local · sem telemetria', cls: 'term-info' },
    sep(),
    { type: 'output', text: '' },
    { type: 'output', text: '  Abrindo o navegador...', cls: 'term-dim' },
    { type: 'output', text: '  Cole o link na interface e escolha o formato:', cls: 'term-cmd' },
    { type: 'output', text: '    MP4 melhor qualidade · 1080p · 720p · MP3 320', cls: 'term-info' },
    { type: 'output', text: '' },
    { type: 'pause', delay: 1400 },

    // ═══ STEP 3 — DOWNLOAD ═══
    { type: 'clear' },
    { type: 'step', num: 3 },
    { type: 'output', text: '' },
    { type: 'output', text: '  FILA DE DOWNLOADS', cls: 'term-output' },
    sep(),
    { type: 'output', text: '' },
    { type: 'output', text: '  Link recebido da interface:', cls: 'term-dim' },
    { type: 'output', text: '' },
    { type: 'pause', delay: 600 },
    { type: 'prompt', text: '  > ', delay: 300 },
    { type: 'cmd', text: 'https://youtube.com/watch?v=dQw4w9WgXcQ', typeSpeed: 22 },
    { type: 'pause', delay: 700 },

    // Quality
    { type: 'clear' },
    { type: 'output', text: '' },
    { type: 'output', text: '  Analisando midia — YouTube', cls: 'term-output' },
    sep(),
    { type: 'output', text: '' },
    { type: 'output', text: '  Preset: MP4 H.264 — melhor qualidade', cls: 'term-highlight term-bold' },
    { type: 'output', text: '  thumbnail ok · 1080p disponivel · ~48 MiB', cls: 'term-cmd' },
    { type: 'output', text: '' },
    { type: 'pause', delay: 1000 },
    { type: 'prompt', text: '  > ', delay: 200 },
    { type: 'pause', delay: 500 },

    // Downloading
    { type: 'clear' },
    { type: 'output', text: '' },
    { type: 'output', text: '  Baixando...', cls: 'term-output' },
    sep(),
    { type: 'output', text: '  Rick Astley - Never Gonna Give You Up', cls: 'term-cmd term-bold' },
    { type: 'output', text: '  1920x1080 · mp4 · 48.2 MiB', cls: 'term-info' },
    { type: 'output', text: '' },
    { type: 'pause', delay: 400 },

    { type: 'progress', steps: 15, size: '48.2 MiB', speed: '14.3 MiB/s', delay: 130 },

    { type: 'output', text: '' },
    { type: 'output', text: '  [Merger] Merging formats...', cls: 'term-dim' },
    { type: 'pause', delay: 400 },
    { type: 'output', text: '  [Metadata] Adding metadata...', cls: 'term-dim' },
    { type: 'pause', delay: 400 },
    { type: 'output', text: '' },
    sep(),
    { type: 'output', text: '  Concluido!', cls: 'term-success term-bold' },
    { type: 'output', text: '  Rick Astley - Never Gonna Give You Up.mp4', cls: 'term-cmd' },
    sep(),
    { type: 'output', text: '' },
    { type: 'prompt', text: '  > ', delay: 300 },
    { type: 'pause', delay: 3000 },
  ];

  let animTimeout = null;
  let animTimeouts = [];
  let termRunning = false;

  function clearTerm() {
    if (termLines) termLines.innerHTML = '';
    animTimeouts.forEach(t => clearTimeout(t));
    animTimeouts = [];
  }

  async function sleep(ms) {
    return new Promise(r => {
      animTimeout = setTimeout(r, ms);
      animTimeouts.push(animTimeout);
    });
  }

  async function typeText(el, text, speed, cls) {
    for (let i = 0; i < text.length; i++) {
      if (!termRunning) return;
      const s = document.createElement('span');
      s.className = cls || '';
      s.textContent = text[i];
      el.appendChild(s);
      if (speed > 0) await sleep(speed);
    }
  }

  async function renderProgress(steps, size, speed, d) {
    const line = document.createElement('div');
    line.className = 'term-line term-progress-line';
    termLines.appendChild(line);
    for (let i = 1; i <= steps; i++) {
      if (!termRunning) return;
      const pct = Math.round((i / steps) * 100);
      const filled = '█'.repeat(i);
      const empty = '░'.repeat(steps - i);
      line.innerHTML = `<span class="term-highlight">  <span class="term-bar-text">${filled}${empty}</span>${pct}%</span><span class="term-dim"> ${size} @ ${speed}</span>`;
      scroll();
      await sleep(d);
    }
  }

  function scroll() {
    const b = document.getElementById('terminalBody');
    if (b) b.scrollTop = b.scrollHeight;
  }

  async function run() {
    clearTerm();
    if (!termLines) return;
    termRunning = true;
    setStep(0);

    for (const s of SCRIPT) {
      if (!termRunning) return;

      if (s.type === 'step') { setStep(s.num); continue; }
      if (s.type === 'pause') { await sleep(s.delay); continue; }
      if (s.type === 'clear') { termLines.innerHTML = ''; continue; }
      if (s.type === 'progress') { await renderProgress(s.steps, s.size, s.speed, s.delay); continue; }

      if (s.type === 'sep') {
        const l = document.createElement('div');
        l.className = 'term-line';
        const sp = document.createElement('span');
        sp.className = 'term-separator';
        l.appendChild(sp);
        termLines.appendChild(l);
        scroll();
        continue;
      }

      if (s.type === 'prompt') {
        await sleep(s.delay || 100);
        const l = document.createElement('div');
        l.className = 'term-line';
        const sp = document.createElement('span');
        sp.className = 'term-prompt';
        sp.textContent = s.text;
        l.appendChild(sp);
        termLines.appendChild(l);
        scroll();
        continue;
      }

      if (s.type === 'cmd') {
        const last = termLines.lastElementChild;
        if (last) { await typeText(last, s.text, s.typeSpeed, 'term-cmd'); scroll(); await sleep(300); }
        continue;
      }

      if (s.type === 'output') {
        await sleep(50);
        const l = document.createElement('div');
        l.className = 'term-line';
        const sp = document.createElement('span');
        sp.className = s.cls || 'term-output';
        sp.textContent = s.text;
        l.appendChild(sp);
        termLines.appendChild(l);
        scroll();
      }
    }

    // ── LOOP: restart after pause ──
    if (termRunning) {
      await sleep(2000);
      run();
    }
  }

  // Start on scroll into view
  if (termWindow && motionOk) {
    const tObs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !termRunning) {
        run();
        tObs.unobserve(termWindow);
      }
    }, { threshold: 0.25 });
    tObs.observe(termWindow);
  }

  // Replay button
  termReplay?.addEventListener('click', () => {
    termRunning = false;
    setTimeout(() => run(), 150);
  });

  // ── Magnetic hero button ──
  if (motionOk) {
    const heroBtn = document.getElementById('heroBtn');
    if (heroBtn) {
      document.addEventListener('mousemove', e => {
        const r = heroBtn.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
        heroBtn.style.transform = dist < 140
          ? `translate3d(${(e.clientX - cx) * .12}px,${(e.clientY - cy) * .12}px,0) scale(1.04)`
          : '';
      });
    }
  }

  // ── Copy Code ──
  window.copyCode = (btn) => {
    const code = btn.previousElementSibling.innerText;
    navigator.clipboard.writeText(code).then(() => {
      const original = btn.innerHTML;
      btn.innerHTML = '<i data-lucide="check"></i>';
      if (window.lucide) lucide.createIcons();
      setTimeout(() => {
        btn.innerHTML = original;
        if (window.lucide) lucide.createIcons();
      }, 2000);
    });
  };

  if (window.lucide) lucide.createIcons();
})();
