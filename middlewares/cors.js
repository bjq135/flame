function cors(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, UPDATE, PUT, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, XXX-xxx, XXX-TYHsss');
  res.header('Access-Control-Expose-Headers', 'Content-Type, Authorization, X-Total, X-Totalpages');
  next();
};

module.exports = cors;
