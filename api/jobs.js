const { proxy } = require('./_engine-proxy');

module.exports = (req, res) => {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('allow', 'GET');
    return res.end('Method not allowed');
  }
  return proxy(req, res, '/api/jobs');
};
