require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const User = require('./models/User');
const tripRoutes = require('./routes/tripRoutes');

const app = express();
const Trip = require('./models/Trip'); // Import Trip model



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
app.use('/trips', tripRoutes);


// Views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
const authRoutes = require('./routes/auth');
const { requireLogin } = require('./routes/auth');

app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.render('index', { title: 'TripTeller' });
});


app.get('/dashboard', requireLogin, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    const trips = await Trip.find({ userId: req.session.userId }).sort({ date: -1 });
    res.render('dashboard', { user, trips });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
