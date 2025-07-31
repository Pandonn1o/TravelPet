const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');
const { requireLogin } = require('./auth');

// Show form to create a new trip
router.get('/new', requireLogin, (req, res) => {
  res.render('newTrip');
});

router.get('/:id/edit', requireLogin, async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.session.userId });
    if (!trip) return res.status(404).send('Trip not found');
    res.render('editTrip', { trip });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
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

// Handle edit form submission
router.post('/:id/edit', requireLogin, async (req, res) => {
  try {
    const { destination, description, date } = req.body;
    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.id, userId: req.session.userId },
      { destination, description, date },
      { new: true }
    );
    if (!trip) return res.status(404).send('Trip not found');
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Handle delete
router.post('/:id/delete', requireLogin, async (req, res) => {
  try {
    const result = await Trip.deleteOne({ _id: req.params.id, userId: req.session.userId });
    if (result.deletedCount === 0) return res.status(404).send('Trip not found');
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});


module.exports = router;
