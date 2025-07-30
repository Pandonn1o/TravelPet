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
  res.render('signup', { error: null });
});

// POST Signup with email verification
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('signup', { error: 'User already exists' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = new User({
      email,
      password, // Let Mongoose pre-save middleware hash it
      verificationToken,
      verified: false
    });
    await user.save();

    console.log("Preparing to send verification email to:", user.email);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    }
    res.render('signup-success', {
      message: '✅ Account created! A confirmation email has been sent to your inbox.',
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Signup error');
  }
  );

    const verifyUrl = `http://localhost:3000/auth/verify?token=${user.verificationToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Verify your email',
      text: `Thanks for signing up! Please confirm your email:\n\n${verifyUrl}`
    };

    await transporter.sendMail(mailOptions);
    console.log("Verification email sent successfully.");

    res.render('signup-success', {
      message: '✅ Account created! A confirmation email has been sent to your inbox.',
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Signup error');
  }
});

// Email verification
router.get('/verify', async (req, res) => {
  const token = req.query.token;
  if (!token) return res.send('❌ Invalid verification link.');

  try {
    const user = await User.findOne({ verificationToken: token });
    if (!user) return res.send('❌ Invalid or expired verification link.');

    user.verified = true;
    user.verificationToken = null;
    await user.save();

    res.send('✅ Email successfully verified! You can now log in.');
  } catch (err) {
    console.error(err);
    res.send('❌ Verification failed.');
  }
});

// GET Login form
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// POST Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.render('login', { error: 'Invalid credentials' });

    if (!user.verified) {
      return res.render('login', { error: 'Please verify your email first.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.render('login', { error: 'Invalid credentials (wrong password)' });

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
    // Enable this when ready to send real contact emails
    // const transporter = nodemailer.createTransport({ ... });
    // await transporter.sendMail({ ... });

    res.render('contact', {
      message: 'Message sent successfully!',
      error: null
    });
  } catch (err) {
    console.error(err);
    res.render('contact', {
      message: null,
      error: 'Failed to send message. Please try again.'
    });
  }
});

module.exports = router;
module.exports.requireLogin = requireLogin;
