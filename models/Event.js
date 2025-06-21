const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  // Link to the organization
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  // Link to the project this event belongs to (optional, if it's an org-wide event)
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: false, // Make false if some events are not project-specific, otherwise true
  },
  title: {
    type: String,
    required: [true, 'Please add a title for the event'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters'],
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters'],
  },
  start: { // Corresponds to event.start in FullCalendar
    type: Date,
    required: [true, 'Please add a start date/time'],
  },
  end: { // Corresponds to event.end in FullCalendar (optional for single-day events)
    type: Date,
  },
  allDay: { // If the event is an all-day event
    type: Boolean,
    default: false,
  },
  googleMeetLink: { // Optional: for DSMs, meetings etc.
    type: String,
    match: [
      /^(https?:\/\/(?:meet\.google\.com|zoom\.us|teams\.microsoft\.com)\/[a-zA-Z0-9-?=&.]+)?$/,
      'Please add a valid meeting link (Google Meet, Zoom, Teams)'
    ],
  },
  // Who created this custom event
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Event', EventSchema);
