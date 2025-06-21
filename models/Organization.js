const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  joinCode: { type: String, unique: true },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['admin', 'member', 'viewer'], default: 'member' }
  }],
  createdAt: { type: Date, default: Date.now }
});

// Generate join code before saving
OrganizationSchema.pre('save', function(next) {
  if (!this.joinCode) {
    this.joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    mongoose.model('Organization').findOne({ joinCode: this.joinCode })
      .then(existingOrg => {
        if (existingOrg) {
          return this.constructor.findOne({ joinCode: this.joinCode })
            .then(() => this.pre('save', next)());
        }
        next();
      })
      .catch(err => next(err));
  } else {
    next();
  }
});

module.exports = mongoose.model('Organization', OrganizationSchema);