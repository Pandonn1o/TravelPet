const mongoose = require('mongoose');

const travelPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  photo: String, // ← New
  location: String,
  latitude: Number,     // ← New
  longitude: Number,    // ← New
  createdAt: {
    type: Date,
    default: Date.now,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

module.exports = mongoose.model('TravelPost', travelPostSchema);
