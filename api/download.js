const { proxy } = require('./_engine-proxy');

module.exports = (req, res) => {
  if (req.method !== 'POST' && req.method !== 'OPTIONS') {
    res.statusCode = 405;
    res.setHeader('allow', 'POST, OPTIONS');
    return res.end('Method not allowed');
  }
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }
  return proxy(req, res, '/api/download');
};
