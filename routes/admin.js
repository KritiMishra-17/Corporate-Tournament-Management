const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Event = require('../models/Event');
const Ad = require('../models/Ad');

router.get('/dashboard', auth, async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    const ads = await Ad.find().sort({ views: -1 });
    res.render('admin/dashboard', { events, ads });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

router.get('/login', (req, res) => {
  res.render('admin/login');
});

router.post('/events', auth, async (req, res) => {
  try {
    const { name, date, description } = req.body;
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const event = new Event({
      name,
      date,
      description,
      code
    });

    await event.save();
    res.json(event);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

//module.exports = router;