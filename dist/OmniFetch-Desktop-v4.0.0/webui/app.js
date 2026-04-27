/* =====================================================================
  OmniFetch Desktop Web UI
  - Talks to local PowerShell server at /api/* (no Cobalt, no WASM)
  - Same look & feel as the Vercel web app
  ===================================================================== */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const state = {
  mode: 'video',
  videoQuality: 'best',
  audioFormat: 'mp3',
  queue: [],     // [{ id (jobId), type, title, status, progress, outFile, error }]
  poll: null,
};

const API_BASE = location.protocol === 'file:' ? 'http://127.0.0.1:7777' : '';
const apiUrl = path => `${API_BASE}${path}`;

async function apiFetch(path, options) {
  try {
    return await fetch(apiUrl(path), options);
  } catch (err) {
    if (location.protocol === 'file:') {
      throw new Error('Desktop Agent offline. Abra pelo 0_OMNIFETCH.bat ou inicie o servidor local.');
    }
    throw err;
  }
}

/* ---------- Tabs ---------- */
$$('.app-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.panel;
    $$('.app-tab').forEach(t => t.classList.toggle('active', t === tab));
    $$('.app-panel').forEach(p => p.classList.toggle('active', p.id === `panel-${target}`));
    if (target === 'system') loadDiagnostics();
  });
});

/* ---------- Toast ---------- */
const toastIcons = {
  info:  '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  success: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  warn:  '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  error:  '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
};

function toast(message, type = 'info', duration = 4000) {
  const stack = $('#toastStack');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `${toastIcons[type] || toastIcons.info}<span>${message}</span>`;
  stack.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity .25s, transform .25s';
    el.style.opacity = '0';
    el.style.transform = 'translateX(20px)';
    setTimeout(() => el.remove(), 280);
  }, duration);
}

/* ---------- API ping ---------- */
async function pingEngine() {
  const pill = $('#enginePill');
  const label = $('#engineLabel');
  const alert = $('#agentAlert');
  pill.dataset.status = 'checking';
  label.textContent = 'Verificando';
  try {
    const r = await apiFetch('/api/info');
    if (!r.ok) throw new Error('http ' + r.status);
    const info = await r.json();
    pill.dataset.status = 'online';
    const parts = [];
    if (info.ytdlp) parts.push('yt-dlp');
    if (info.ffmpeg) parts.push('ffmpeg');
    if (info.aria2c) parts.push('aria2');
    label.textContent = parts.length ? parts.join(' ') : 'motores ausentes';
    if (alert) alert.hidden = true;
    if (!info.ytdlp || !info.ffmpeg) {
      toast('Alguns motores estao faltando. Rode o 1_SETUP.bat.', 'warn', 6000);
    }
  } catch {
    pill.dataset.status = 'offline';
    label.textContent = location.protocol === 'file:' ? 'agent offline' : 'servidor offline';
    if (alert) alert.hidden = false;
    if (location.protocol === 'file:') {
      toast('Abra pelo 0_OMNIFETCH.bat para iniciar o servidor local e baixar pelo WebUI.', 'warn', 7000);
    }
  }
}

async function loadDiagnostics() {
  const grid = $('#diagnosticGrid');
  if (!grid) return;
  grid.innerHTML = `<div class="empty-state"><i data-lucide="loader"></i><div>Carregando diagnostico...</div></div>`;
  lucide.createIcons();
  try {
    const r = await apiFetch('/api/diagnostics');
    if (!r.ok) throw new Error('HTTP ' + r.status);
    renderDiagnostics(await r.json());
  } catch (err) {
    grid.innerHTML = `<div class="diag-card danger"><strong>Servidor</strong><span>Falha ao carregar diagnostico: ${escapeHtml(err.message || err)}</span></div>`;
  }
}

function diagCard(title, value, status = 'ok', meta = '') {
  const icon = status === 'ok' ? 'check-circle' : status === 'warn' ? 'alert-triangle' : 'x-circle';
  return `
    <div class="diag-card ${status}">
      <div class="diag-head"><i data-lucide="${icon}"></i><strong>${escapeHtml(title)}</strong></div>
      <span>${escapeHtml(value || 'indisponivel')}</span>
      ${meta ? `<small>${escapeHtml(meta)}</small>` : ''}
    </div>
  `;
}

function renderDiagnostics(data) {
  const grid = $('#diagnosticGrid');
  if (!grid) return;
  const engines = data.engines || {};
  const downloads = data.downloads || {};
  const jobs = data.jobs || {};
  grid.innerHTML = [
    diagCard('yt-dlp', engines.ytdlp, engines.ytdlp ? 'ok' : 'danger', 'Motor principal de download'),
    diagCard('FFmpeg', engines.ffmpeg, engines.ffmpeg ? 'ok' : 'danger', 'Conversao e merge de audio/video'),
    diagCard('aria2', engines.aria2c || 'opcional', engines.aria2c ? 'ok' : 'warn', 'Aceleracao de fragmentos'),
    diagCard('Downloads', downloads.path, downloads.writable ? 'ok' : 'danger', downloads.freeGB != null ? `${downloads.freeGB} GB livres` : ''),
    diagCard('Jobs ativos', String(jobs.running || 0), (jobs.running || 0) > 0 ? 'warn' : 'ok', `${jobs.total || 0} nesta sessao`),
    diagCard('Servidor', `localhost:${data.server?.port || 7777}`, data.ok ? 'ok' : 'warn', data.server?.version ? `v${data.server.version}` : ''),
  ].join('');
  lucide.createIcons();
}

/* ---------- Chips ---------- */
$('#modeChips').addEventListener('click', e => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  state.mode = chip.dataset.mode;
  $$('#modeChips .chip').forEach(c => c.classList.toggle('active', c === chip));
  $('#videoQualityRow').style.display = state.mode === 'audio' ? 'none' : 'grid';
  $('#audioFormatRow').style.display = state.mode === 'audio' ? 'grid' : 'none';
});
$('#videoChips').addEventListener('click', e => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  state.videoQuality = chip.dataset.vq;
  $$('#videoChips .chip').forEach(c => c.classList.toggle('active', c === chip));
});
$('#audioChips').addEventListener('click', e => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  state.audioFormat = chip.dataset.af;
  $$('#audioChips .chip').forEach(c => c.classList.toggle('active', c === chip));
});

/* ---------- Paste helpers ---------- */
async function pasteInto(inputId) {
  try {
    const txt = await navigator.clipboard.readText();
    $(`#${inputId}`).value = txt.trim();
    toast('Colado!', 'success', 1500);
  } catch {
    toast('Use Ctrl+V no campo (browser bloqueou clipboard).', 'warn');
  }
}
$('#pasteBtn').addEventListener('click', () => pasteInto('urlInput'));
$('#pastePathBtn').addEventListener('click', () => pasteInto('filePathInput'));

/* ---------- Open Downloads ---------- */
$('#openDownloadsBtn').addEventListener('click', () => apiFetch('/api/open').catch(err => toast(err.message || err, 'error', 7000)));

/* ---------- Download flow ---------- */
$('#downloadBtn').addEventListener('click', async () => {
  const url = $('#urlInput').value.trim();
  if (!url) { toast('Cole um link primeiro.', 'warn'); return; }
  if (!/^https?:\/\//i.test(url)) { toast('URL precisa comecar com http:// ou https://', 'error'); return; }

  const dest = $('#destInput').value.trim();
  const body = { url, mode: state.mode };
  if (state.mode === 'audio') body.audioFormat = state.audioFormat;
  else body.quality = state.videoQuality;
  if (dest) body.dest = dest;

  const btn = $('#downloadBtn');
  btn.disabled = true;
  try {
    const res = await apiFetch('/api/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    addJobToQueue(data.jobId, 'download', url);
    toast('Iniciado! Acompanhe na aba Fila.', 'success');
  } catch (err) {
    toast('Falha ao iniciar download: ' + (err.message || err), 'error', 7000);
  } finally {
    btn.disabled = false;
  }
});

/* ---------- Convert flow ---------- */
$('#convertBtn').addEventListener('click', async () => {
  const filePath = $('#filePathInput').value.trim().replace(/^"+|"+$/g, '');
  const target = $('#formatSelect').value;
  const dest = $('#convertDest').value.trim();
  if (!filePath) { toast('Informe o caminho do arquivo.', 'warn'); return; }

  const body = { filePath, target };
  if (dest) body.dest = dest;

  const btn = $('#convertBtn');
  btn.disabled = true;
  try {
    const res = await apiFetch('/api/convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    addJobToQueue(data.jobId, 'convert', filePath.split(/[\\/]/).pop());
    toast('Conversao iniciada!', 'success');
  } catch (err) {
    toast('Falha ao iniciar conversao: ' + (err.message || err), 'error', 7000);
  } finally {
    btn.disabled = false;
  }
});

/* ---------- Queue & polling ---------- */
function addJobToQueue(jobId, type, title) {
  state.queue.unshift({ id: jobId, type, title, status: 'queued', progress: 0 });
  renderQueue();
  if (!state.poll) state.poll = setInterval(pollJobs, 1200);
}

async function pollJobs() {
  const active = state.queue.filter(j => j.status === 'queued' || j.status === 'running');
  if (active.length === 0) {
    clearInterval(state.poll);
    state.poll = null;
    return;
  }
  for (const job of active) {
    try {
      const r = await apiFetch(`/api/jobs/${job.id}`);
      if (!r.ok) continue;
      const data = await r.json();
      const wasActive = job.status === 'queued' || job.status === 'running';
      Object.assign(job, {
        status: data.status,
        progress: data.progress,
        outFile: data.outFile,
        error: data.error,
        log: data.log || [],
      });
      if (wasActive && (data.status === 'done' || data.status === 'error' || data.status === 'cancelled')) {
        if (data.status === 'done') toast(`Pronto: ${job.title}`, 'success');
        else if (data.status === 'cancelled') toast(`Cancelado: ${job.title}`, 'warn', 4000);
        else toast(`Falhou: ${data.error || job.title}`, 'error', 6000);
      }
    } catch {}
  }
  renderQueue();
}

$('#queueList').addEventListener('click', async e => {
  const btn = e.target.closest('button[data-cancel]');
  if (!btn) return;
  const id = btn.dataset.cancel;
  btn.disabled = true;
  try {
    const r = await apiFetch(`/api/jobs/${id}/cancel`, { method: 'POST' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const job = state.queue.find(j => j.id === id);
    if (job) {
      job.status = 'cancelled';
      job.error = 'cancelado pelo usuario';
    }
    renderQueue();
    toast('Tarefa cancelada.', 'warn', 3000);
  } catch (err) {
    toast('Nao consegui cancelar: ' + (err.message || err), 'error', 5000);
    btn.disabled = false;
  }
});

const iconMap = {
  download: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
  convert: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
};

function renderQueue() {
  const list = $('#queueList');
  if (state.queue.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <i data-lucide="inbox"></i>
        <div>Nada por aqui ainda. Comece pela aba <b>Baixar</b> ou <b>Converter</b>.</div>
      </div>`;
    lucide.createIcons();
    return;
  }
  list.innerHTML = state.queue.map(item => {
    const cls = item.status === 'done' ? 'success'
          : item.status === 'error' ? 'error'
          : item.status === 'cancelled' ? 'warn'
          : 'processing';
    const indet = (item.status === 'running' && (!item.progress || item.progress < 1)) ? 'indeterminate' : '';
    const sub = item.status === 'done'
      ? (item.outFile ? `Salvo - ${item.outFile}` : 'Concluido')
      : item.status === 'cancelled' ? 'Cancelado pelo usuario'
      : item.status === 'error' ? `Erro: ${item.error || 'falhou'}`
      : item.status === 'running' ? `Processando ${(item.progress || 0).toFixed(0)}%`
      : 'Na fila';
    let actions = '';
    if (item.status === 'done' && item.outFile) {
      actions = `<a class="qi-btn" href="/api/open?path=${encodeURIComponent(item.outFile)}" title="Abrir local"><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></a>`;
    } else if (item.status === 'queued' || item.status === 'running') {
      actions = `<button class="qi-btn" data-cancel="${item.id}" title="Cancelar"><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>`;
    }
    const showProg = item.status === 'running';
    const lastLog = (item.log || []).filter(Boolean).slice(-1)[0];
    return `
      <div class="queue-item ${cls} ${indet}">
        <div class="qi-icon">${iconMap[item.type] || iconMap.download}</div>
        <div class="qi-body">
          <div class="qi-title">${escapeHtml(item.title)}</div>
          <div class="qi-sub">${escapeHtml(sub)}</div>
          ${lastLog ? `<div class="qi-log">${escapeHtml(lastLog)}</div>` : ''}
        </div>
        <div class="qi-actions">${actions}</div>
        ${showProg ? `<div class="progress-track"><div class="progress-fill" style="width:${item.progress || 0}%"></div></div>` : ''}
      </div>
    `;
  }).join('');
  lucide.createIcons();
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function bindAmbientMotion() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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

/* ---------- Drag and drop file path (Windows) ---------- */
['dragover', 'drop'].forEach(ev => window.addEventListener(ev, e => e.preventDefault()));
window.addEventListener('drop', e => {
  const f = e.dataTransfer.files[0];
  if (f && f.path) {
    $('#filePathInput').value = f.path;
    // switch to convert tab
    $$('.app-tab').forEach(t => t.classList.toggle('active', t.dataset.panel === 'convert'));
    $$('.app-panel').forEach(p => p.classList.toggle('active', p.id === 'panel-convert'));
    toast('Arquivo carregado!', 'success', 1500);
  }
});

/* ---------- Boot ---------- */
pingEngine();
setInterval(pingEngine, 15000);
$('#refreshDiagnosticsBtn')?.addEventListener('click', loadDiagnostics);
bindAmbientMotion();
if (window.lucide) lucide.createIcons();
