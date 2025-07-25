require('dotenv').config(); // ← this must come before any use of process.env

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const hashedPassword = await bcrypt.hash('mishka', 10);
    const user = new User({
      email: 'test@example.com',
      password: hashedPassword,
    });
    await user.save();
    console.log('User created successfully');
    mongoose.disconnect();
  })
  .catch(err => console.error(err));
