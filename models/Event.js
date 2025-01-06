const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  description: String,
  code: { type: String, unique: true },
  maxTeams: { type: Number, default: 10 },
  teams: [{
    teamName: String,
        teamCode: String,
        members: [{
            realName: String,
            email: String,
            codeName: String
        }]
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  winners: [{
    teamId: mongoose.Schema.Types.ObjectId,
    position: String
}]
});

module.exports = mongoose.model('Event', EventSchema);