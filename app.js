require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const User = require('./models/User');
const tripRoutes = require('./routes/tripRoutes');
const travelPostRoutes = require('./routes/travelPosts');  
const { requireLogin } = require('./routes/auth');
const Trip = require('./models/Trip');
const TravelPost = require('./models/TravelPost');
const authRoutes = require('./routes/auth');
const app = express();

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'Mishka30283028',
  resave: false,
  saveUninitialized: true
}));

// Middleware to make req.query available as 'query' in all views
app.use((req, res, next) => {
  res.locals.query = req.query;
  next();
});

// Middleware to set currentUser 
app.use(async (req, res, next) => {
  if (req.session.userId) {
    try {
      const user = await User.findById(req.session.userId);
      res.locals.currentUser = user;
    } catch (e) {
      res.locals.currentUser = null;
    }
  } else {
    res.locals.currentUser = null;
  }
  next();
});


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/trips', tripRoutes);
app.use('/posts', travelPostRoutes);
app.use('/auth', authRoutes);




// Routes for main pages
app.get('/', async (req, res) => {
  if (!req.session.userId) {
    return res.render('landing'); 
  }

  const posts = await TravelPost.find().populate('owner');
  res.render('index', { posts });
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

// Contact form routes
app.get('/contact', (req, res) => {
  res.render('contact', { message: null, error: null });
});

app.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;

  try {
    console.log(`Message from ${name} <${email}>: ${message}`);
    res.render('contact', { message: '✅ Message sent successfully!', error: null });
  } catch (err) {
    res.render('contact', { message: null, error: '❌ Failed to send message.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
