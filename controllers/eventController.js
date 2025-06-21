const Event = require('../models/Event');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Organization = require('../models/Organization');

// @desc    Get all events for a specific project
// @route   GET /api/projects/:projectId/events
// @access  Private
exports.getProjectEvents = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId).populate('organization');
    if (!project) {
      return res.status(404).json({ success: false, message: `Project not found with id ${projectId}` });
    }

    const organization = await Organization.findById(project.organization._id).populate('members.user');
    if (!organization) {
      return res.status(404).json({ success: false, message: 'Organization not found for this project' });
    }

    const isOrgMember = organization.members.some(member => member.user._id.toString() === req.user._id.toString());
    if (!isOrgMember) {
      return res.status(403).json({ success: false, message: 'You are not authorized to view this project\'s calendar' });
    }

    const events = [];

    if (project.startDate) {
      events.push({
        id: `project-start-${project._id}`,
        title: `${project.name} (Start)`,
        start: project.startDate,
        allDay: true,
        backgroundColor: '#17a2b8',
        borderColor: '#17a2b8',
        extendedProps: { type: 'project', projectId: project._id }
      });
    }

    if (project.endDate) {
      events.push({
        id: `project-end-${project._id}`,
        title: `${project.name} (End)`,
        start: project.endDate,
        allDay: true,
        backgroundColor: '#fd7e14',
        borderColor: '#fd7e14',
        extendedProps: { type: 'project', projectId: project._id }
      });
    }

    const tasks = await Task.find({ project: projectId });
    tasks.forEach(task => {
      if (task.dueDate) {
        events.push({
          id: `task-${task._id}`,
          title: `Task: ${task.title}`,
          start: task.dueDate,
          allDay: true,
          backgroundColor: '#ffc107',
          borderColor: '#ffc107',
          extendedProps: { type: 'task', taskId: task._id, status: task.status }
        });
      }
    });

    const customEvents = await Event.find({ project: projectId }).populate('createdBy', 'name');
    const isAdmin = organization.members.some(member =>
      member.user._id.toString() === req.user._id.toString() && member.role === 'admin'
    );

    customEvents.forEach(event => {
      events.push({
        id: event._id,
        title: event.title,
        start: event.start,
        end: event.end || null,
        allDay: event.allDay,
        backgroundColor: '#007bff',
        borderColor: '#007bff',
        extendedProps: {
          type: 'custom',
          description: event.description,
          googleMeetLink: event.googleMeetLink,
          createdBy: event.createdBy.name,
          editable: event.createdBy._id.toString() === req.user._id.toString() || isAdmin
        }
      });
    });

    res.status(200).json({ success: true, data: events });

  } catch (err) {
    console.error('Error in getProjectEvents:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create a new custom event
// @route   POST /api/projects/:projectId/events
// @access  Private (Admin only)
exports.createEvent = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, start, end, allDay, googleMeetLink } = req.body;

    const project = await Project.findById(projectId).populate('organization');
    if (!project) {
      return res.status(404).json({ success: false, message: `Project not found with id ${projectId}` });
    }

    const organization = await Organization.findById(project.organization._id).populate('members.user');
    if (!organization) {
      return res.status(404).json({ success: false, message: 'Organization not found for this project' });
    }

    const isAdmin = organization.members.some(member =>
      member.user._id.toString() === req.user._id.toString() && member.role === 'admin'
    );

    if (!isAdmin) {
      return res.status(403).json({ success: false, message: 'You are not authorized to create events for this project' });
    }

    const event = await Event.create({
      organization: organization._id,
      project: projectId,
      title,
      description,
      start,
      end: end || null,
      allDay: allDay || false,
      googleMeetLink,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, data: event, message: 'Event created successfully!' });

  } catch (err) {
    console.error('Error in createEvent:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update a custom event
// @route   PUT /api/events/:eventId
// @access  Private (Admin or creator)
exports.updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const updateData = req.body;

    let event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: `Event not found with id ${eventId}` });
    }

    const organization = await Organization.findById(event.organization).populate('members.user');
    const isAdmin = organization && organization.members.some(member =>
      member.user._id.toString() === req.user._id.toString() && member.role === 'admin'
    );

    if (event.createdBy.toString() !== req.user._id.toString() && !isAdmin) {
      return res.status(403).json({ success: false, message: 'You are not authorized to update this event' });
    }

    event = await Event.findByIdAndUpdate(eventId, updateData, { new: true, runValidators: true });

    res.status(200).json({ success: true, data: event, message: 'Event updated successfully!' });

  } catch (err) {
    console.error('Error in updateEvent:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete a custom event
// @route   DELETE /api/events/:eventId
// @access  Private (Admin or creator)
exports.deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: `Event not found with id ${eventId}` });
    }

    const organization = await Organization.findById(event.organization).populate('members.user');
    const isAdmin = organization && organization.members.some(member =>
      member.user._id.toString() === req.user._id.toString() && member.role === 'admin'
    );

    if (event.createdBy.toString() !== req.user._id.toString() && !isAdmin) {
      return res.status(403).json({ success: false, message: 'You are not authorized to delete this event' });
    }

    await event.deleteOne();

    res.status(200).json({ success: true, data: {}, message: 'Event deleted successfully!' });

  } catch (err) {
    console.error('Error in deleteEvent:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
