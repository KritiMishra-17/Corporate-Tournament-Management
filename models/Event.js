const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  description: String,
  code: { type: String, unique: true },
  teams: [{
    teamName: String,
        teamCode: String,
        members: [{
            realName: String,
            codeName: String
        }]
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Event', EventSchema);