const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const router = express.Router();

// Middleware to protect routes
function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/auth/login');
  }
  next();
}

// GET Signup form
router.get('/signup', (req, res) => {
  res.render('signup');
});

// POST Signup
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.send('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();

    req.session.userId = user._id;
    res.redirect('/dashboard'); // or wherever you want to go after signup
  } catch (err) {
    console.error(err);
    res.status(500).send('Signup error');
  }
});

// GET Login form
router.get('/login', (req, res) => {
  res.render('login');
});

// POST Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log('Trying login with:', email);
    const user = await User.findOne({ email });
    console.log('Found user in DB:', user);

    if (!user) {
      console.log('User not found');
      return res.send('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log('Input password:', password);
    console.log('Hashed in DB:', user.password);
    console.log('Password match result:', passwordMatch);


    if (!passwordMatch) {
      return res.send('Invalid credentials (wrong password)');
    }

    req.session.userId = user._id;
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Login error');
  }
});


// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
module.exports.requireLogin = requireLogin;
