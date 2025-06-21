const express = require('express');
const { protect } = require('../middleware/auth'); // Your auth middleware
const {
  getProjectEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController'); // Your event controller

const router = express.Router();

// Define routes for event management
router.route('/projects/:projectId/events')
  .get(protect, getProjectEvents) // Get all events for a project
  .post(protect, createEvent);    // Create a new event for a project (Admin only)

router.route('/:eventId')
  .put(protect, updateEvent)    // Update an event (Admin or creator only)
  .delete(protect, deleteEvent); // Delete an event (Admin or creator only)

module.exports = router;
