const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  content: { type: String, required: true },
  chatType: { 
    type: String, 
    enum: ['organization', 'project', 'team', 'task'], 
    required: true 
  },
  chatId: { type: mongoose.Schema.Types.ObjectId, required: true },
  organization: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Organization', 
    required: true 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);