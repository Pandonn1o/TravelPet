const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
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

// POST Signup with email verification
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.redirect('/auth/signup?error=exists');
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with verification token
    const user = new User({ email, password: hashedPassword, verificationToken });
    await user.save();

    // Send verification email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    });

    const verificationLink = `http://localhost:3000/auth/verify/${verificationToken}`;

    await transporter.sendMail({
      from: `"TravelPet" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify your email ✔️',
      html: `<p>Please click the following link to verify your email:</p><a href="${verificationLink}">${verificationLink}</a>`
    });

    res.send('Signup successful! Please check your email to verify your account.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Signup error');
  }
});

// Email verification route
router.get('/verify/:token', async (req, res) => {
  const user = await User.findOne({ verificationToken: req.params.token });
  if (!user) return res.render('auth/verifyError');

  user.verified = true;
  user.verificationToken = undefined;
  await user.save();

  res.render('auth/verify');
});

// GET Login form
router.get('/login', (req, res) => {
  res.render('login');
});

// POST Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.send('Invalid credentials');

    if (!user.verified) {
      return res.send('Please verify your email before logging in.');
    }

    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) return res.send('Invalid credentials (wrong password)');

    req.session.userId = user._id;
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Login error');
  }
});

// ✅ GET Logout (повернули)
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login');
  });
});

// GET Contact form
router.get('/contact', (req, res) => {
  res.render('contact', { message: null, error: null });
});

// POST Contact form
router.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;

  try {
    // Example: send email logic (customize as needed)
    // const transporter = nodemailer.createTransport({ ... });
    // await transporter.sendMail({
    //   from: email,
    //   to: process.env.CONTACT_EMAIL,
    //   subject: `Contact from ${name}`,
    //   text: message
    // });

    res.render('contact', { message: 'Message sent successfully!', error: null });
  } catch (err) {
    console.error(err);
    res.render('contact', { message: null, error: 'Failed to send message. Please try again.' });
  }
});

module.exports = router;
module.exports.requireLogin = requireLogin;
