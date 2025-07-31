// routes/travelPosts.js
const express = require('express');
const router = express.Router();
const TravelPost = require('../models/TravelPost');
const { requireLogin } = require('./auth');
const upload = require('../middleware/upload');

// Show all posts
router.get('/', async (req, res) => {
  const posts = await TravelPost.find().populate('owner');
  res.render('index', { posts }); 
});

// Show form to create post
router.get('/new', requireLogin, (req, res) => {
  res.render('travelPostForm');
});

// Create post with file upload
router.post('/', requireLogin, upload.single('photo'), async (req, res) => {
  const { title, description, location, latitude, longitude } = req.body;
  const photo = req.file ? `/uploads/${req.file.filename}` : req.body.photo || null;

  const newPost = new TravelPost({
    title,
    description,
    photo,
    location,
    latitude,
    longitude,
    owner: req.session.userId
  });

  await newPost.save();
  res.redirect('/posts');
});

// Show one post
router.get('/:id', async (req, res) => {
  const post = await TravelPost.findById(req.params.id).populate('owner');
  res.render('posts/show', { post });
});

// Edit form
router.get('/:id/edit', requireLogin, async (req, res) => {
  const post = await TravelPost.findById(req.params.id);
  if (!post.owner.equals(req.session.userId)) return res.redirect('/posts');
  res.render('posts/edit', { post });
});

// Update post
router.post('/:id', requireLogin, async (req, res) => {
  const post = await TravelPost.findById(req.params.id);
  if (!post.owner.equals(req.session.userId)) return res.redirect('/posts');
  const { title, description, photo, location } = req.body;
  post.set({ title, description, photo, location });
  await post.save();
  res.redirect(`/posts/${post._id}`);
});

// Delete post
router.post('/:id/delete', requireLogin, async (req, res) => {
  const post = await TravelPost.findById(req.params.id);
  if (!post.owner.equals(req.session.userId)) return res.redirect('/posts');
  await post.deleteOne();
  res.redirect('/posts');
});

module.exports = router;
