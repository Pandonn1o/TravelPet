const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');
const { requireLogin } = require('./auth');

// Show form to create a new trip
router.get('/new', requireLogin, (req, res) => {
  res.render('newTrip');
});

// Handle trip creation
router.post('/', requireLogin, async (req, res) => {
  const { destination, description, date } = req.body;
  try {
    await Trip.create({
      destination,
      description,
      date,
      userId: req.session.userId,
    });
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating trip');
  }
});

module.exports = router;
