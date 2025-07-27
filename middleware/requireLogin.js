// middleware/requireLogin.js
module.exports = function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/auth/login');
  }
  next();
};
