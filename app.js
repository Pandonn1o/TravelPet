require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');

const app = express();

// DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

// Middlewares
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: process.env.SESSION_SECRET, // ← це має бути!
  resave: false,
  saveUninitialized: false
}));


// Views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
const authRoutes = require('./routes/auth');
const { requireLogin } = require('./routes/auth');

app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to TravelPet!');
});

app.get('/dashboard', requireLogin, (req, res) => {
  res.send(`Welcome to your dashboard, user ID: ${req.session.userId}`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
