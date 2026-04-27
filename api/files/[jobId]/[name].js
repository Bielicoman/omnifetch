const { proxy } = require('../../_engine-proxy');

module.exports = (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405;
    res.setHeader('allow', 'GET, HEAD');
    return res.end('Method not allowed');
  }
  const jobId = req.query?.jobId || '';
  const name = req.query?.name || req.url.split('/').pop().split('?')[0];
  return proxy(req, res, `/files/${encodeURIComponent(jobId)}/${encodeURIComponent(name)}`);
};
