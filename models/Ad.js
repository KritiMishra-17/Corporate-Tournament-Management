const mongoose = require('mongoose');

const AdSchema = new mongoose.Schema({
  name: String,
  imageUrl: String,
  views: { type: Number, default: 0 },
  engagement: { type: Number, default: 0 },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Ad', AdSchema);