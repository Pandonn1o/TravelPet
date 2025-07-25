const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const session = require('express-session');

const app = express(); 



app.use(session({
  secret: 'ADchhoWk0wK2LFw', // change this to something secure in production
  resave: false,
  saveUninitialized: false,
}));


app.use(express.urlencoded({ extended: true })); // for form data
app.use(express.json()); // for JSON
app.use('/auth', authRoutes);
// Dashboard route
app.get('/dashboard', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/auth/login');
  }
  res.render('dashboard', { userId: req.session.userId });
});


const PORT = process.env.PORT || 3000;

app.use(express.json());        
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index', { title: 'TripTeller' });
});

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
})
.catch(err => console.error(err));