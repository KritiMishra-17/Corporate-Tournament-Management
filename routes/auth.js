const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // For testing, create an admin if none exists
      let admin = await Admin.findOne({ email });
      if (!admin) {
        admin = new Admin({
          email: email,
          password: password
        });
        await admin.save();
      }
  
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.redirect('/admin/login');
      }
  
      const token = jwt.sign({ id: admin.id }, 'your_jwt_secret', { expiresIn: '1h' });
      res.cookie('token', token, { httpOnly: true });
      res.redirect('/admin/dashboard');
    } catch (err) {
      console.error(err);
      res.redirect('/admin/login');
    }
  });
  
module.exports = router;