// models/UtilityItem.js
const mongoose = require('mongoose');

const UtilityItemSchema = new mongoose.Schema({
  // The name of the utility item (e.g., "Figma Design", "Staging Server Password")
  name: {
    type: String,
    required: [true, 'Please add a name for the utility item'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  // The value of the utility item (e.g., a URL, a password, a note)
  value: {
    type: String,
    required: [true, 'Please add a value for the utility item']
  },
  // Reference to the Project this utility item belongs to
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  // Reference to the User who created this item (optional, but good for auditing)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps automatically
});

module.exports = mongoose.model('UtilityItem', UtilityItemSchema);