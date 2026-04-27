const http = require('http');
const https = require('https');

const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

function json(res, status, data) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  res.end(JSON.stringify(data));
}

function engineBase() {
  const raw = (process.env.OMNIFETCH_ENGINE_URL || process.env.ENGINE_URL || '').trim();
  if (!raw) return '';
  try {
    const url = new URL(raw);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
    url.pathname = url.pathname.replace(/\/+$/, '');
    url.search = '';
    url.hash = '';
    return url.toString().replace(/\/$/, '');
  } catch {
    return '';
  }
}

function proxy(req, res, targetPath) {
  const base = engineBase();
  if (!base) {
    return json(res, 503, {
      engine: 'omnifetch-vercel-proxy',
      configured: false,
      error: 'OMNIFETCH_ENGINE_URL ausente',
      message: 'Configure a variavel OMNIFETCH_ENGINE_URL no Vercel apontando para a Online Engine do OmniFetch.',
    });
  }

  const target = new URL(targetPath, base);
  const queryIndex = req.url.indexOf('?');
  if (queryIndex >= 0) target.search = req.url.slice(queryIndex);

  const headers = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (!HOP_BY_HOP.has(key.toLowerCase())) headers[key] = value;
  }
  headers.host = target.host;
  headers['x-forwarded-proto'] = 'https';
  headers['x-omnifetch-proxy'] = 'vercel';

  const transport = target.protocol === 'https:' ? https : http;
  const upstream = transport.request(target, { method: req.method, headers }, remote => {
    res.statusCode = remote.statusCode || 502;
    for (const [key, value] of Object.entries(remote.headers)) {
      if (!HOP_BY_HOP.has(key.toLowerCase()) && value != null) res.setHeader(key, value);
    }
    remote.pipe(res);
  });

  upstream.on('error', err => {
    json(res, 502, {
      engine: 'omnifetch-vercel-proxy',
      configured: true,
      error: err.message || String(err),
    });
  });

  if (req.method === 'GET' || req.method === 'HEAD') {
    upstream.end();
  } else {
    req.pipe(upstream);
  }
}

module.exports = { engineBase, json, proxy };
