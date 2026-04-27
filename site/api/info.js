const { engineBase, json } = require('./_engine-proxy');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('allow', 'GET');
    return res.end('Method not allowed');
  }
  const base = engineBase();
  if (!base) {
    return json(res, 503, {
      engine: 'omnifetch-vercel-proxy',
      configured: false,
      error: 'OMNIFETCH_ENGINE_URL ausente',
      message: 'Configure a variavel OMNIFETCH_ENGINE_URL no Vercel apontando para a Online Engine do OmniFetch.',
    });
  }

  try {
    const response = await fetch(`${base}/api/info`, { headers: { accept: 'application/json' } });
    const data = await response.json().catch(() => ({}));
    return json(res, response.ok ? 200 : response.status, {
      ...data,
      publicBase: base,
      proxy: 'vercel',
    });
  } catch (err) {
    return json(res, 502, {
      engine: 'omnifetch-vercel-proxy',
      configured: true,
      error: err.message || String(err),
    });
  }
};
