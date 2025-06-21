const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  problemStatement: { type: String, required: true },
  problemStatementSummary: { type: String },
  status: { 
    type: String, 
    enum: ['not_started', 'in_progress', 'on_hold', 'completed'], 
    default: 'not_started' 
  },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  organization: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Organization', 
    required: true 
  },
  teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);