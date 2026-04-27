/* =====================================================================
  OmniFetch Web App Online edition
  - Download via OmniFetch Online Engine, Desktop Agent or Cobalt-compatible fallback
  - Convert via Online Engine or ffmpeg.wasm in the browser
  ===================================================================== */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// Pool de instancias Cobalt tenta uma apos a outra ate alguma funcionar.
// A lista pode ser editada em "Avancado" pelo usuario.
const DEFAULT_INSTANCES = [
  'https://cobalt-api.meowing.de/',
  'https://cobalt.moe/',
  'https://api.cobalt.tools/',
  'https://cobalt.inst.m-99.net/',
  'https://cobalt.qis.sh/',
  'https://cobalt.bcow.xyz/',
  'https://cobalt-backend.canine.tools/',
  'https://kityune.imput.net/',
  'https://capi.3kh0.net/',
  'https://nachos.imput.net/',
  'https://sunny.imput.net/',
  'https://co.eepy.today/',
];

const LOCAL_AGENT = 'http://127.0.0.1:7777';
const CUSTOM_ONLINE_ENGINE = localStorage.getItem('of:onlineEngine') || '';
const DESKTOP_DOWNLOAD_URL = 'downloads/OmniFetch-Desktop-v4.0.0.zip';

const state = {
  mode: 'auto',     // auto | audio | mute
  videoQuality: 'max',
  audioFormat: 'mp3',
  instances: (() => {
    const raw = localStorage.getItem('of:instances');
    if (raw) {
      try { const arr = JSON.parse(raw); if (Array.isArray(arr) && arr.length) return arr; } catch {}
    }
    return [...DEFAULT_INSTANCES];
  })(),
  workingInstance: localStorage.getItem('of:workingInstance') || null,
  file: null,
  ffmpeg: null,
  ffmpegReady: false,
  ffmpegLoading: false,
  onlineEngine: null,
  enginePoll: null,
  localAgent: false,
  localPoll: null,
  queueRunning: false,
  queue: [],
};

function saveInstances() {
  localStorage.setItem('of:instances', JSON.stringify(state.instances));
}

function rememberWorking(url) {
  state.workingInstance = url;
  localStorage.setItem('of:workingInstance', url);
}

// Ordena: instancia que funcionou por ultimo vem primeiro
function orderedInstances() {
  const list = [...state.instances];
  if (state.workingInstance) {
    const idx = list.indexOf(state.workingInstance);
    if (idx > 0) { list.splice(idx, 1); list.unshift(state.workingInstance); }
  }
  return list;
}

function normalizeBaseUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  try {
    const url = new URL(raw);
    url.pathname = url.pathname.replace(/\/+$/, '');
    url.search = '';
    url.hash = '';
    return url.toString().replace(/\/$/, '');
  } catch {
    return '';
  }
}

function sameOriginEngineCandidate() {
  if (!/^https?:$/.test(location.protocol)) return '';
  return location.origin;
}

function onlineEngineCandidates() {
  return [...new Set([normalizeBaseUrl(CUSTOM_ONLINE_ENGINE), sameOriginEngineCandidate()].filter(Boolean))];
}

function engineUrl(base, path) {
  return `${String(base).replace(/\/$/, '')}${path}`;
}

/* ---------- Tabs ---------- */
$$('.app-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.panel;
    $$('.app-tab').forEach(t => t.classList.toggle('active', t === tab));
    $$('.app-panel').forEach(p => p.classList.toggle('active', p.id === `panel-${target}`));
    if (target === 'convert' && !state.onlineEngine && !state.ffmpegReady && !state.ffmpegLoading) initFFmpeg();
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

/* ---------- Engine pill (cobalt reachable?) ---------- */
async function pingEngine() {
  const pill = $('#enginePill');
  const label = $('#engineLabel');
  pill.dataset.status = 'checking';
  label.textContent = 'Verificando';

  state.onlineEngine = null;
  for (const base of onlineEngineCandidates()) {
    try {
      const res = await fetchWithTimeout(engineUrl(base, '/api/info'), { method: 'GET' }, 1600);
      if (!res.ok) continue;
      const info = await res.json().catch(() => ({}));
      if (info.engine !== 'omnifetch-online-engine') continue;
      state.onlineEngine = normalizeBaseUrl(info.publicBase || base);
      pill.dataset.status = 'online';
      label.textContent = 'Online Engine';
      renderLocalBridge(false, { online: true, base: state.onlineEngine });
      return;
    } catch {}
  }

  try {
    const local = await fetchWithTimeout(`${LOCAL_AGENT}/api/info`, { method: 'GET' }, 1200);
    if (local.ok) {
      const info = await local.json().catch(() => ({}));
      state.localAgent = true;
      pill.dataset.status = 'online';
      label.textContent = info.ytdlp ? 'Desktop Agent online' : 'Desktop sem yt-dlp';
      renderLocalBridge(true, info);
      return;
    }
  } catch {}

  state.localAgent = false;
  renderLocalBridge(false);

  for (const inst of orderedInstances()) {
    try {
      const res = await fetch(new URL(inst).origin + '/', { method: 'GET', mode: 'cors' });
      if (res.ok) {
        const info = await res.json().catch(() => ({}));
        pill.dataset.status = 'online';
        const ver = info?.cobalt?.version;
        label.textContent = ver ? `Cobalt v${ver}` : 'API online';
        rememberWorking(inst);
        return;
      }
    } catch {}
  }
  pill.dataset.status = 'offline';
  label.textContent = 'sem API use Desktop';
}

async function fetchWithTimeout(url, options = {}, timeout = 5000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    return await fetch(url, { ...options, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

function renderLocalBridge(isOnline, info = {}) {
  const el = $('#localBridgeStatus');
  if (!el) return;
  if (info.online) {
    el.dataset.status = 'online';
    el.innerHTML = `<span class="dot-small green-bg"></span><strong>Online Engine conectado</strong><small>Downloads e conversoes usam motor OmniFetch no servidor, sem abrir Desktop.</small>`;
    return;
  }
  el.dataset.status = isOnline ? 'online' : 'offline';
  el.innerHTML = isOnline
    ? `<span class="dot-small green-bg"></span><strong>Desktop Agent conectado</strong><small>Downloads usam yt-dlp local e salvam no seu computador.</small>`
    : `<span class="dot-small"></span><strong>Modo online publico</strong><small>Se alguma API publica bloquear, abra o OmniFetch Desktop para download confiavel.</small>`;
}

/* ---------- Tenta multiplas instancias ate uma funcionar ---------- */
async function postWithFallback(body) {
  const errors = [];
  for (const inst of orderedInstances()) {
    try {
      const apiUrl = new URL(inst).origin + '/';
      const headers = { 'Accept': 'application/json', 'Content-Type': 'application/json' };
      const apiToken = $('#apiTokenInput')?.value.trim();
      if (apiToken) headers.Authorization = `Api-Key ${apiToken}`;
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        errors.push(`${inst} -> HTTP ${res.status}`);
        continue;
      }
      const data = await res.json();
      if (data.status === 'error') {
        errors.push(`${inst} -> ${data.error?.code || 'erro'}`);
        // Se o erro nao for de bot/rate, ainda assim retorna pra mostrar pro user
        if (!/auth|rate|captcha|bot/i.test(data.error?.code || '')) {
          rememberWorking(inst);
          return data;
        }
        continue;
      }
      rememberWorking(inst);
      return data;
    } catch (err) {
      errors.push(`${inst} -> ${err.message || err}`);
    }
  }
  const msg = `Nenhuma instancia respondeu.\n\nDetalhes:\n${errors.slice(0, 4).join('\n')}`;
  const e = new Error(msg);
  e.allBlocked = true;
  throw e;
}

/* ---------- Download (mode + quality chips) ---------- */
$('#modeChips').addEventListener('click', e => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  state.mode = chip.dataset.mode;
  $$('#modeChips .chip').forEach(c => c.classList.toggle('active', c === chip));
  $('#videoQualityRow').style.display = state.mode === 'audio' || state.mode === 'file' ? 'none' : 'grid';
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

$('#advancedBtn').addEventListener('click', () => {
  const p = $('#advancedPanel');
  p.style.display = p.style.display === 'none' ? 'block' : 'none';
  if (p.style.display === 'block') renderInstanceList();
});

function renderInstanceList() {
  const ul = $('#instanceList');
  if (!ul) return;
  ul.innerHTML = state.instances.map((url, i) => `
    <li class="instance-item${url === state.workingInstance ? ' working' : ''}">
      <span class="dot-small ${url === state.workingInstance ? 'green-bg' : ''}" style="${url === state.workingInstance ? '' : 'background:var(--text-dim);'}"></span>
      <code>${escapeHtml(url)}</code>
      <button class="qi-btn" data-rm="${i}" title="Remover">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </li>
  `).join('');
  ul.querySelectorAll('button[data-rm]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.rm, 10);
      state.instances.splice(idx, 1);
      saveInstances();
      renderInstanceList();
    });
  });
}

$('#addInstanceBtn')?.addEventListener('click', () => {
  let v = $('#newInstance').value.trim();
  if (!v) return;
  if (!/^https?:\/\//i.test(v)) v = 'https://' + v;
  if (!v.endsWith('/')) v += '/';
  if (state.instances.includes(v)) { toast('Instancia ja esta na lista.', 'warn'); return; }
  state.instances.unshift(v);
  saveInstances();
  $('#newInstance').value = '';
  renderInstanceList();
  pingEngine();
  toast('Instancia adicionada e priorizada.', 'success');
});

$('#resetInstancesBtn')?.addEventListener('click', () => {
  state.instances = [...DEFAULT_INSTANCES];
  state.workingInstance = null;
  localStorage.removeItem('of:workingInstance');
  saveInstances();
  renderInstanceList();
  pingEngine();
  toast('Lista de instancias restaurada.', 'success');
});

$('#clearTokenBtn')?.addEventListener('click', () => {
  const input = $('#apiTokenInput');
  if (!input) return;
  if (input.value) {
    input.value = '';
    toast('Token limpo nesta sessao.', 'success');
  } else {
    toast('Cole aqui o token da sua instancia Cobalt, se ela exigir autenticacao.', 'info', 5000);
  }
});

$('#saveEngineBtn')?.addEventListener('click', () => {
  const input = $('#onlineEngineInput');
  const value = normalizeBaseUrl(input?.value);
  if (!value) {
    localStorage.removeItem('of:onlineEngine');
    toast('Motor online personalizado removido. Vou tentar o mesmo dominio do site.', 'info', 5000);
  } else {
    localStorage.setItem('of:onlineEngine', value);
    toast('Motor online salvo. Recarregando status...', 'success');
  }
  setTimeout(() => location.reload(), 700);
});

$('#pasteBtn').addEventListener('click', async () => {
  try {
    const txt = await navigator.clipboard.readText();
    $('#urlInput').value = txt.trim();
    toast('Colado!', 'success', 1800);
  } catch {
    toast('Permita acesso area de transferencia ou cole manualmente (Ctrl+V).', 'warn');
  }
});

/* ---------- Download flow + inline queue ---------- */
function normalizeLinks(text) {
  return [...new Set(String(text)
    .split(/\r?\n|[\t ]+(?=https?:\/\/)/i)
    .map(v => v.trim())
    .filter(Boolean))];
}

function validateUrl(url) {
  if (!url) return 'Cole um link primeiro.';
  if (!/^https?:\/\//i.test(url)) return 'URL invalida precisa comecar com http:// ou https://';
  return '';
}

function sanitizeUrl(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) {
      // Remove playlist params which often trigger bot detection or Cobalt errors
      u.searchParams.delete('list');
      u.searchParams.delete('index');
      u.searchParams.delete('pp');
      u.searchParams.delete('feature');
    }
    return u.toString();
  } catch {
    return url;
  }
}

function buildDownloadBody(url) {
  const body = {
    url,
    downloadMode: state.mode,
    filenameStyle: 'pretty',
    alwaysProxy: true,
    youtubeVideoCodec: 'h264',
    youtubeVideoContainer: 'mp4',
    audioBitrate: '320',
    disableMetadata: false,
    tiktokFullAudio: true,
    allowH265: true,
    twitterGif: true,
  };
  if (state.mode !== 'audio') body.videoQuality = state.videoQuality;
  if (state.mode !== 'mute') body.audioFormat = state.audioFormat;
  return body;
}

function currentDownloadMode() {
  if (state.mode === 'audio') return 'audio';
  if (state.mode === 'mute') return 'mute';
  if (state.mode === 'file') return 'file';
  return 'video';
}

function startBrowserFileDownload(url, item) {
  updateItem(item, {
    sub: 'Abrindo pelo navegador. Para links bloqueados por CORS, use a Online Engine ou Desktop.',
    status: 'success',
    indeterminate: false,
    progress: 100,
    actions: [
      { icon: 'download', label: 'Baixar', href: url, download: true },
      { icon: 'external-link', label: 'Abrir', href: url, target: '_blank' },
    ],
  });
  const a = document.createElement('a');
  a.href = url;
  a.download = '';
  a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

async function runDownload(url, item) {
  if (state.onlineEngine) {
    await startEngineDownload(url, item);
    return;
  }

  if (state.mode === 'file') {
    startBrowserFileDownload(url, item);
    return;
  }

  if (state.localAgent) {
    await startLocalDownload(url, item);
    return;
  }

  const cleanUrl = sanitizeUrl(url);
  updateItem(item, { sub: 'Tentando instancias publicas...', status: 'processing', indeterminate: true });
  
  let data = null;
  try {
    data = await postWithFallback(buildDownloadBody(cleanUrl));
  } catch (err) {
    try {
      updateItem(item, { sub: 'Refazendo com modo de compatibilidade...', indeterminate: true });
      const body = buildDownloadBody(cleanUrl);
      body.videoQuality = '720'; 
      body.youtubeVideoCodec = null;
      body.youtubeVideoContainer = null;
      data = await postWithFallback(body);
    } catch (err2) {
      console.warn('Cobalt falhou totalmente, tentando Piped...', err2);
    }
  }

  // LAST RESORT: Piped API Fallback (Only for YouTube)
  if (!data || data.status === 'error') {
    try {
      const videoId = cleanUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/|.*vi=))([^&?#]+)/)?.[1];
      if (videoId) {
        updateItem(item, { sub: 'Usando motor de emergencia Piped...', indeterminate: true });
        const pipedInst = ['https://pipedapi.kavin.rocks', 'https://api.piped.victr.me', 'https://piped-api.lunar.icu'];
        for (const inst of pipedInst) {
          try {
            const res = await fetch(`${inst}/streams/${videoId}`);
            if (res.ok) {
              const pData = await res.json();
              const stream = pData.videoStreams?.find(s => s.quality === '720p' && s.format === 'mp4') || pData.videoStreams?.[0];
              if (stream) {
                data = { status: 'redirect', url: stream.url, filename: pData.title };
                break;
              }
            }
          } catch(e) {}
        }
      } catch(e) {}
  }

  // LAST RESORT 2: Invidious API Fallback
  if (!data || data.status === 'error') {
    try {
      const videoId = cleanUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/|.*vi=))([^&?#]+)/)?.[1];
      if (videoId) {
        updateItem(item, { sub: 'Usando motor de emergencia Invidious...', indeterminate: true });
        const invInst = ['https://invidious.snopyta.org', 'https://yewtu.be', 'https://vid.puffyan.us'];
        for (const inst of invInst) {
          try {
            const res = await fetch(`${inst}/api/v1/videos/${videoId}`);
            if (res.ok) {
              const iData = await res.json();
              const fmt = iData.formatStreams?.find(f => f.quality === '720p' || f.quality === 'medium') || iData.formatStreams?.[0];
              if (fmt) {
                data = { status: 'redirect', url: fmt.url, filename: iData.title };
                break;
              }
            }
          } catch(e) {}
        }
      }
    } catch(e) {}
  }

  if (!data) {
    throw new Error('Nenhuma API publica aceitou no momento. O YouTube esta bloqueando a maioria dos motores online.');
  }

  if (data.status === 'error') {
    throw new Error(data.error?.code || 'API retornou erro');
  }

  if (data.status === 'tunnel' || data.status === 'redirect') {
    updateItem(item, {
      sub: `Pronto - ${data.filename || 'arquivo'}`,
      status: 'success',
      indeterminate: false,
      progress: 100,
      actions: [
        { icon: 'download', label: 'Baixar', href: data.url, download: data.filename || true },
        { icon: 'external-link', label: 'Abrir', href: data.url, target: '_blank' },
      ],
    });
    const a = document.createElement('a');
    a.href = data.url;
    a.download = data.filename || '';
    document.body.appendChild(a);
    a.click();
    a.remove();
    return;
  }

  if (data.status === 'picker') {
    updateItem(item, {
      sub: `${data.picker.length} opcoes encontradas`,
      status: 'success',
      indeterminate: false,
      progress: 100,
      actions: data.picker.slice(0, 6).map((p, i) => ({
        icon: 'download',
        label: p.type || `Opcao ${i + 1}`,
        href: p.url,
        target: '_blank',
      })),
    });
    return;
  }

  if (data.status === 'local-processing') {
    throw new Error('A API pediu processamento local. Use o Desktop Agent para este link.');
  }

  throw new Error('Resposta desconhecida da API: ' + data.status);
}

async function startSingleDownload(url) {
  const validation = validateUrl(url);
  if (validation) {
    toast(validation, validation.includes('invalida') ? 'error' : 'warn');
    return;
  }
  const btn = $('#downloadBtn');
  btn.disabled = true;
  const item = enqueue({
    type: 'download',
    title: url.length > 72 ? url.slice(0, 69) + '...' : url,
    sub: state.onlineEngine ? 'Enviando a Online Engine' : state.localAgent ? 'Enviando ao Desktop Agent' : 'Conectando a API',
    status: 'processing',
    indeterminate: true,
  });

  try {
    await runDownload(url, item);
    toast(state.localAgent ? 'Enviado ao Desktop Agent.' : 'Download iniciado!', 'success');
  } catch (err) {
    updateItem(item, {
      sub: err.allBlocked ? 'Todas as instancias bloquearam' : 'Erro: ' + (err.message || err),
      status: 'error',
      indeterminate: false,
      actions: err.allBlocked ? [
        { icon: 'download', label: 'Baixar Desktop', href: DESKTOP_DOWNLOAD_URL, download: true },
      ] : undefined,
    });
    if (err.allBlocked) {
      toast('Nenhuma API publica aceitou no momento. Para uso confiavel, baixe a versao Desktop.', 'error', 8000);
    } else {
      toast('Falha no download: ' + (err.message || err), 'error', 7000);
    }
  } finally {
    btn.disabled = false;
  }
}

function addLinksToQueue(links) {
  const valid = [];
  const invalid = [];
  for (const url of links) {
    const error = validateUrl(url);
    if (error) invalid.push(url);
    else valid.push(url);
  }
  for (const url of [...valid].reverse()) {
    enqueue({
      type: 'download',
      title: url.length > 72 ? url.slice(0, 69) + '...' : url,
      sourceUrl: url,
      sub: 'Aguardando inicio da fila',
      status: 'queued',
      indeterminate: false,
      progress: 0,
    });
  }
  renderQueue();
  if (valid.length) toast(`${valid.length} link(s) adicionados na fila.`, 'success');
  if (invalid.length) toast(`${invalid.length} link(s) ignorados por URL invalida.`, 'warn');
}

async function processQueuedDownloads() {
  if (state.queueRunning) return;
  const queued = state.queue.filter(i => i.status === 'queued' && i.sourceUrl);
  if (!queued.length) {
    const pasted = normalizeLinks($('#bulkLinksInput').value);
    if (pasted.length) addLinksToQueue(pasted);
  }
  const jobs = state.queue.filter(i => i.status === 'queued' && i.sourceUrl);
  if (!jobs.length) {
    toast('Adicione links na fila primeiro.', 'warn');
    return;
  }

  state.queueRunning = true;
  $('#startQueueBtn').disabled = true;
  try {
    for (const item of jobs) {
      updateItem(item.id, { status: 'processing', sub: 'Iniciando...', indeterminate: true });
      try {
        await runDownload(item.sourceUrl, item.id);
      } catch (err) {
        updateItem(item.id, {
          status: 'error',
          indeterminate: false,
          sub: err.allBlocked ? 'Todas as instancias bloquearam' : 'Erro: ' + (err.message || err),
          actions: err.allBlocked ? [
            { icon: 'download', label: 'Desktop', href: DESKTOP_DOWNLOAD_URL, download: true },
          ] : undefined,
        });
      }
      await new Promise(resolve => setTimeout(resolve, 350));
    }
    toast('Fila processada.', 'success');
  } finally {
    state.queueRunning = false;
    $('#startQueueBtn').disabled = false;
  }
}

$('#downloadBtn').addEventListener('click', () => startSingleDownload($('#urlInput').value.trim()));

$('#addQueueBtn').addEventListener('click', () => {
  const url = $('#urlInput').value.trim();
  const bulk = normalizeLinks($('#bulkLinksInput').value);
  const links = url ? [url, ...bulk] : bulk;
  if (!links.length) {
    toast('Cole um link ou uma lista de links.', 'warn');
    return;
  }
  addLinksToQueue(links);
  $('#bulkLinksInput').value = '';
});

$('#startQueueBtn').addEventListener('click', processQueuedDownloads);

$('#clearQueueBtn').addEventListener('click', () => {
  if (state.queueRunning) {
    toast('A fila esta rodando. Aguarde terminar.', 'warn');
    return;
  }
  state.queue = [];
  renderQueue();
});

async function startLocalDownload(url, item) {
  const mode = currentDownloadMode();
  const body = {
    url,
    mode,
    quality: state.videoQuality === 'max' ? 'best' : state.videoQuality,
    audioFormat: state.audioFormat,
  };

  updateItem(item, { sub: 'Enviando para o Desktop Agent...', indeterminate: true });
  const res = await fetchWithTimeout(`${LOCAL_AGENT}/api/download`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }, 5000);
  if (!res.ok) throw new Error(`Desktop Agent HTTP ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  updateItem(item, {
    localJobId: data.jobId,
    sub: 'Rodando localmente no Desktop Agent...',
    status: 'processing',
    indeterminate: true,
  });
  startLocalPolling();
}

async function startEngineDownload(url, item) {
  const mode = currentDownloadMode();
  const body = {
    url,
    mode,
    quality: state.videoQuality === 'max' ? 'best' : state.videoQuality,
    audioFormat: state.audioFormat,
  };

  updateItem(item, { sub: 'Enviando para o Online Engine...', indeterminate: true });
  const res = await fetchWithTimeout(engineUrl(state.onlineEngine, '/api/download'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }, 8000);
  if (!res.ok) throw new Error(`Online Engine HTTP ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  updateItem(item, {
    engineJobId: data.jobId,
    engineBase: state.onlineEngine,
    sub: 'Rodando no Online Engine...',
    status: 'processing',
    indeterminate: true,
  });
  startEnginePolling();
}

async function startEngineConvert(file, target, item) {
  const fd = new FormData();
  fd.append('file', file, file.name);
  fd.append('target', target);
  updateItem(item, { sub: 'Enviando arquivo ao Online Engine...', indeterminate: true });
  const res = await fetchWithTimeout(engineUrl(state.onlineEngine, '/api/convert'), {
    method: 'POST',
    body: fd,
  }, 120000);
  if (!res.ok) throw new Error(`Online Engine HTTP ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  updateItem(item, {
    engineJobId: data.jobId,
    engineBase: state.onlineEngine,
    sub: 'Convertendo no Online Engine...',
    status: 'processing',
    indeterminate: true,
  });
  startEnginePolling();
}

function startEnginePolling() {
  if (state.enginePoll) return;
  state.enginePoll = setInterval(pollEngineJobs, 1200);
}

async function pollEngineJobs() {
  const active = state.queue.filter(i => i.engineJobId && i.status === 'processing');
  if (active.length === 0) {
    clearInterval(state.enginePoll);
    state.enginePoll = null;
    return;
  }
  for (const item of active) {
    try {
      const r = await fetchWithTimeout(engineUrl(item.engineBase, `/api/jobs/${item.engineJobId}`), {}, 4500);
      if (!r.ok) continue;
      const data = await r.json();
      const progress = Number(data.progress || 0);
      if (data.status === 'done') {
        const href = data.downloadUrl || data.outputFile;
        updateItem(item.id, {
          status: 'success',
          indeterminate: false,
          progress: 100,
          sub: data.outputFile ? `Pronto - ${String(data.outputFile).split(/[\\/]/).pop()}` : 'Concluido no Online Engine',
          actions: href ? [
            { icon: 'download', label: 'Baixar', href, download: true },
            { icon: 'external-link', label: 'Abrir', href, target: '_blank' },
          ] : [],
        });
        if (href) {
          const a = document.createElement('a');
          a.href = href;
          a.download = '';
          document.body.appendChild(a);
          a.click();
          a.remove();
        }
      } else if (data.status === 'error' || data.status === 'cancelled') {
        updateItem(item.id, {
          status: 'error',
          indeterminate: false,
          sub: data.error || 'Falhou no Online Engine',
        });
      } else {
        const lastLog = (data.log || []).filter(Boolean).slice(-1)[0];
        updateItem(item.id, {
          progress,
          indeterminate: progress < 1,
          sub: lastLog || `Processando no Online Engine... ${progress.toFixed(0)}%`,
        });
      }
    } catch {}
  }
}

function startLocalPolling() {
  if (state.localPoll) return;
  state.localPoll = setInterval(pollLocalJobs, 1200);
}

async function pollLocalJobs() {
  const active = state.queue.filter(i => i.localJobId && i.status === 'processing');
  if (active.length === 0) {
    clearInterval(state.localPoll);
    state.localPoll = null;
    return;
  }
  for (const item of active) {
    try {
      const r = await fetchWithTimeout(`${LOCAL_AGENT}/api/jobs/${item.localJobId}`, {}, 3500);
      if (!r.ok) continue;
      const data = await r.json();
      const progress = Number(data.progress || 0);
      if (data.status === 'done') {
        updateItem(item, {
          status: 'success',
          indeterminate: false,
          progress: 100,
          sub: data.outFile ? `Salvo - ${data.outFile}` : 'Concluido no Desktop Agent',
          actions: data.outFile ? [
            { icon: 'external-link', label: 'Abrir local', href: `${LOCAL_AGENT}/api/open?path=${encodeURIComponent(data.outFile)}`, target: '_blank' },
          ] : [],
        });
        toast('Download local concluido.', 'success', 3500);
      } else if (data.status === 'error' || data.status === 'cancelled') {
        updateItem(item, {
          status: 'error',
          indeterminate: false,
          sub: data.error || 'Falhou no Desktop Agent',
        });
      } else {
        const lastLog = (data.log || []).filter(Boolean).slice(-1)[0];
        updateItem(item, {
          progress,
          indeterminate: progress < 1,
          sub: lastLog || `Processando localmente... ${progress.toFixed(0)}%`,
        });
      }
    } catch {}
  }
}

/* ---------- Convert (FFmpeg WASM) ---------- */
const dropzone = $('#dropzone');
const fileInput = $('#fileInput');

dropzone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', e => {
  if (e.target.files[0]) setFile(e.target.files[0]);
});
['dragover', 'dragenter'].forEach(ev =>
  dropzone.addEventListener(ev, e => { e.preventDefault(); dropzone.classList.add('dragover'); })
);
['dragleave', 'dragend', 'drop'].forEach(ev =>
  dropzone.addEventListener(ev, e => { e.preventDefault(); dropzone.classList.remove('dragover'); })
);
dropzone.addEventListener('drop', e => {
  if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
});

$('#clearFileBtn').addEventListener('click', () => setFile(null));

function setFile(file) {
  state.file = file;
  if (!file) {
    dropzone.classList.remove('has-file');
    dropzone.innerHTML = `
      <input type="file" id="fileInput" hidden>
      <i data-lucide="upload-cloud"></i>
      <div class="dz-title">Clique ou arraste um arquivo</div>
      <div class="dz-hint">video, audio ou imagem max ~500&nbsp;MB</div>
    `;
    // re-bind input ref
    $('#fileInput').addEventListener('change', e => { if (e.target.files[0]) setFile(e.target.files[0]); });
    $('#convertBtn').disabled = true;
    $('#clearFileBtn').style.display = 'none';
    lucide.createIcons();
    return;
  }
  dropzone.classList.add('has-file');
  const sizeMB = (file.size / 1024 / 1024).toFixed(1);
  dropzone.innerHTML = `
    <div class="dz-file">
      <div class="qi-icon"><i data-lucide="file"></i></div>
      <div class="file-meta">
        <div class="file-name">${file.name}</div>
        <div class="file-size">${sizeMB} MB ${file.type || 'desconhecido'}</div>
      </div>
    </div>
  `;
  $('#convertBtn').disabled = false;
  $('#clearFileBtn').style.display = 'inline-flex';
  lucide.createIcons();
  if (!state.ffmpegReady && !state.ffmpegLoading) initFFmpeg();
}

/* FFmpeg loader (UMD via CDN, no bundler needed) */
async function initFFmpeg() {
  if (state.ffmpegLoading || state.ffmpegReady) return;
  state.ffmpegLoading = true;
  const card = $('#ffmpegStatusCard');
  const txt = $('#ffmpegStatusText');
  const fill = $('#ffmpegLoadFill');
  card.style.display = 'block';
  txt.textContent = 'Carregando FFmpeg (25 MB)';

  try {
    if (!window.isSecureContext && location.protocol !== 'http:') {
      throw new Error('O conversor online precisa rodar em HTTPS ou localhost.');
    }

    console.log('Iniciando carregamento de bibliotecas locais...');
    await loadScriptOnce('ffmpeg-wasm', [
      '/lib/ffmpeg.js',
      'https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.10/dist/umd/ffmpeg.js'
    ]);
    await loadScriptOnce('ffmpeg-util', [
      '/lib/ffmpeg-util.js',
      'https://cdn.jsdelivr.net/npm/@ffmpeg/util@0.12.1/dist/umd/index.js'
    ]);

    if (!window.FFmpegWASM?.FFmpeg || !window.FFmpegUtil?.fetchFile) {
      throw new Error('Biblioteca FFmpeg nao ficou disponivel no navegador.');
    }

    const { FFmpeg } = window.FFmpegWASM;
    const { fetchFile, toBlobURL } = window.FFmpegUtil;
    state.fetchFile = fetchFile;

    const ff = new FFmpeg();
    ff.on('log', ({ message }) => console.log('[ffmpeg]', message));
    ff.on('progress', ({ progress }) => {
      fill.style.width = Math.min(100, Math.max(0, progress * 100)) + '%';
    });

    console.log('FFmpeg bibliotecas OK, iniciando ff.load()...');
    const baseURL = '/lib';
    try {
      await ff.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
    } catch (loadErr) {
      console.error('Erro ao carregar do /lib, tentando CDN...', loadErr);
      const cdnBase = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd';
      await ff.load({
        coreURL: await toBlobURL(`${cdnBase}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${cdnBase}/ffmpeg-core.wasm`, 'application/wasm'),
      });
    }

    state.ffmpeg = ff;
    state.ffmpegReady = true;
    state.ffmpegLoading = false;
    txt.textContent = 'FFmpeg pronto';
    fill.style.width = '100%';
    setTimeout(() => { card.style.display = 'none'; }, 1500);
    toast('FFmpeg carregado - pronto para converter.', 'success');
  } catch (err) {
    txt.textContent = 'Falha ao carregar FFmpeg: ' + (err.message || err);
    toast('Nao consegui carregar o FFmpeg. Verifique a conexao ou use a versao Desktop.', 'error', 8000);
    state.ffmpegLoading = false;
  }
}

function loadScriptOnce(id, urls) {
  if (document.querySelector(`script[data-of-script="${id}"]`)) return Promise.resolve();
  return urls.reduce((promise, url) => promise.catch(() => new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = url;
    s.async = true;
    s.dataset.ofScript = id;
    s.onload = resolve;
    s.onerror = () => {
      s.remove();
      reject(new Error(`Falha ao carregar ${url}`));
    };
    document.head.appendChild(s);
  })), Promise.reject()).catch(() => {
    throw new Error(`Falha ao carregar ${id}`);
  });
}

const formatRecipes = {
  mp4: { args: file => ['-i', file, '-c:v', 'libx264', '-preset', 'fast', '-crf', '20', '-c:a', 'aac', '-b:a', '192k', 'out.mp4'], out: 'out.mp4', mime: 'video/mp4' },
  webm: { args: file => ['-i', file, '-c:v', 'libvpx-vp9', '-crf', '32', '-b:v', '0', '-c:a', 'libopus', 'out.webm'], out: 'out.webm', mime: 'video/webm' },
  mkv: { args: file => ['-i', file, '-c:v', 'libx264', '-crf', '20', '-c:a', 'flac', 'out.mkv'], out: 'out.mkv', mime: 'video/x-matroska' },
  mov: { args: file => ['-i', file, '-c:v', 'libx264', '-preset', 'fast', '-crf', '20', '-c:a', 'aac', 'out.mov'], out: 'out.mov', mime: 'video/quicktime' },
  gif: { args: file => ['-i', file, '-vf', 'fps=12,scale=480:-1:flags=lanczos', '-loop', '0', 'out.gif'], out: 'out.gif', mime: 'image/gif' },

  mp3: { args: file => ['-i', file, '-vn', '-c:a', 'libmp3lame', '-b:a', '320k', 'out.mp3'], out: 'out.mp3', mime: 'audio/mpeg' },
  wav: { args: file => ['-i', file, '-vn', '-c:a', 'pcm_s16le', 'out.wav'], out: 'out.wav', mime: 'audio/wav' },
  flac: { args: file => ['-i', file, '-vn', '-c:a', 'flac', 'out.flac'], out: 'out.flac', mime: 'audio/flac' },
  ogg: { args: file => ['-i', file, '-vn', '-c:a', 'libvorbis', '-q:a', '5', 'out.ogg'], out: 'out.ogg', mime: 'audio/ogg' },
  opus: { args: file => ['-i', file, '-vn', '-c:a', 'libopus', '-b:a', '128k', 'out.opus'], out: 'out.opus', mime: 'audio/opus' },
  aac: { args: file => ['-i', file, '-vn', '-c:a', 'aac', '-b:a', '256k', 'out.aac'], out: 'out.aac', mime: 'audio/aac' },
  m4a: { args: file => ['-i', file, '-vn', '-c:a', 'aac', '-b:a', '256k', 'out.m4a'], out: 'out.m4a', mime: 'audio/mp4' },

  jpg: { args: file => ['-i', file, '-vframes', '1', '-q:v', '2', 'out.jpg'], out: 'out.jpg', mime: 'image/jpeg' },
  png: { args: file => ['-i', file, '-vframes', '1', 'out.png'], out: 'out.png', mime: 'image/png' },
  webp: { args: file => ['-i', file, '-vframes', '1', '-c:v', 'libwebp', '-q:v', '85', 'out.webp'], out: 'out.webp', mime: 'image/webp' },
};

$('#convertBtn').addEventListener('click', async () => {
  if (!state.file) return;
  const target = $('#formatSelect').value;
  const recipe = formatRecipes[target];
  if (!recipe) { toast('Formato desconhecido.', 'error'); return; }

  const file = state.file;
  const baseName = file.name.replace(/\.[^.]+$/, '');
  const outName = baseName + '.' + target;

  const btn = $('#convertBtn');
  btn.disabled = true;
  const item = enqueue({
    type: 'convert',
    title: outName,
    sub: 'Preparando',
    status: 'processing',
    indeterminate: false,
    progress: 0,
  });

  try {
    if (state.onlineEngine) {
      await startEngineConvert(file, target, item);
      toast('Conversao enviada ao Online Engine.', 'success');
      return;
    }

    if (!state.ffmpegReady) {
      throw new Error('Aguarde o FFmpeg terminar de carregar ou use o Online Engine.');
    }

    const inExt = file.name.split('.').pop() || 'bin';
    const sessionId = Date.now();
    const inName = `in_${sessionId}.${inExt}`;
    const outName_fs = `out_${sessionId}.${target}`;
    
    const ff = state.ffmpeg;
    updateItem(item, { sub: 'Processando arquivo...' });
    await ff.writeFile(inName, await state.fetchFile(file));

    const onProg = ({ progress }) => {
      updateItem(item, { progress: Math.min(99, progress * 100), sub: `Convertendo ${(progress * 100).toFixed(0)}%` });
    };
    ff.on('progress', onProg);

    const args = recipe.args(inName);
    // ensure unique output name
    args[args.length - 1] = outName_fs;
    await ff.exec(args);

    const data = await ff.readFile(outName_fs);
    const blob = new Blob([data.buffer], { type: recipe.mime });
    const url = URL.createObjectURL(blob);

    // cleanup
    try { await ff.deleteFile(inName); } catch {}
    try { await ff.deleteFile(outName_fs); } catch {}
    if (typeof ff.off === 'function') ff.off('progress', onProg);

    updateItem(item, {
      sub: `Pronto - ${(blob.size / 1024 / 1024).toFixed(1)} MB`,
      status: 'success',
      indeterminate: false,
      progress: 100,
      actions: [
        { icon: 'download', label: 'Baixar', href: url, download: outName },
      ],
    });

    // auto-trigger browser download
    const a = document.createElement('a');
    a.href = url;
    a.download = outName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast('Conversao concluida!', 'success');
  } catch (err) {
    console.error('Erro na conversao:', err);
    updateItem(item, {
      sub: 'Erro: ' + (err.message || err),
      status: 'error',
      indeterminate: false,
    });
    toast('Falha na conversao: ' + (err.message || err), 'error', 7000);
    
    // Se for erro de sistema de arquivos, forcar recarregamento do FFmpeg
    if (err.message?.includes('FS')) {
      state.ffmpegReady = false;
      initFFmpeg(); 
    }
  } finally {
    btn.disabled = false;
  }
});

/* ---------- Queue UI ---------- */
function enqueue(opts) {
  const id = 'q' + Date.now() + Math.random().toString(36).slice(2, 6);
  const item = { id, ...opts };
  state.queue.unshift(item);
  renderQueue();
  return id;
}

function updateItem(id, patch) {
  const item = state.queue.find(i => i.id === id);
  if (!item) return;
  Object.assign(item, patch);
  renderQueue();
}

const iconMap = {
  download: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
  convert: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
};
const actionIcons = {
  download:   '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
  'external-link': '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
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
    const indet = item.indeterminate ? 'indeterminate' : '';
    const actions = (item.actions || []).map(a =>
      `<a class="qi-btn" href="${a.href}" ${a.download ? `download="${a.download === true ? '' : a.download}"` : ''} ${a.target ? `target="${a.target}"` : ''} title="${a.label}">${actionIcons[a.icon] || ''}</a>`
    ).join('');
    const showProg = item.status === 'processing' || (item.progress != null && item.progress < 100);
    return `
      <div class="queue-item ${item.status} ${indet}" data-id="${item.id}">
        <div class="qi-icon">${iconMap[item.type] || iconMap.download}</div>
        <div class="qi-body">
          <div class="qi-title">${escapeHtml(item.title)}</div>
          <div class="qi-sub">${escapeHtml(item.sub || '')}</div>
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

/* ---------- Boot ---------- */
if ($('#onlineEngineInput') && CUSTOM_ONLINE_ENGINE) $('#onlineEngineInput').value = CUSTOM_ONLINE_ENGINE;
pingEngine();
setInterval(pingEngine, 15000);
bindAmbientMotion();

// Render Lucide icons (initial chips already in HTML; this catches dynamic ones)
if (window.lucide) lucide.createIcons();

// Auto-paste: detect URL from clipboard on focus, only suggests
window.addEventListener('focus', async () => {
  if ($('#urlInput').value) return;
  try {
    const txt = await navigator.clipboard.readText();
    if (/^https?:\/\//i.test(txt) && txt.length < 2000) {
      $('#urlInput').placeholder = `Detectado: ${txt.slice(0, 50)} (clique em COLAR)`;
    }
  } catch {}
});

// Custom Cursor logic
(() => {
  const cursor = $('#cursor');
  const dot = $('#cursorDot');
  if (!cursor || !dot) return;

  document.addEventListener('mousemove', e => {
    const x = e.clientX;
    const y = e.clientY;
    dot.style.left = `${x}px`;
    dot.style.top = `${y}px`;
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

  const hoverables = 'a, button, .chip, .tool-card, .path-card, .dz-file, .qi-btn, .dropzone';
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
})();
