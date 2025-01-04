const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect('/admin/login');
  }

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    req.admin = decoded;
    next();
  } catch (err) {
    res.redirect('/admin/login');
  }
};