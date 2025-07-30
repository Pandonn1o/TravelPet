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
  if (!email || !password) {
  return res.render('signup', { error: 'Please fill in all fields.' });
}

if (password.length < 6) {
  return res.render('signup', { error: 'Password must be at least 6 characters long.' });
}

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
    });

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

    res.render('verification-success', {
  title: 'Email Verified!',
  message: '✅ Your email has been successfully verified. You can now log in.'
});

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
// POST Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.render('login', { error: '❌ No account with that email found.' });
    }

    if (!user.verified) {
      return res.render('login', { error: 'Please verify your email before logging in.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.render('login', { error: '❌ Incorrect password.' });
    }

    req.session.userId = user._id;
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).render('login', { error: 'Server error. Please try again later.' });
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
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: email,
      to: process.env.CONTACT_EMAIL, // this is your email that will receive messages
      subject: `Contact Form Message from ${name}`,
      text: `You received a message from:\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Contact email sent!");

    res.render('contact', { message: '✅ Message sent successfully!', error: null });
  } catch (err) {
    console.error("❌ Email send error:", err);
    res.render('contact', { message: null, error: '❌ Failed to send message. Please try again.' });
  }
});

module.exports = router;
module.exports.requireLogin = requireLogin;
