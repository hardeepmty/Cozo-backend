const Task = require('../models/Task');
const Project = require('../models/Project');
const Organization = require('../models/Organization');

// Create task
exports.createTask = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      priority, 
      dueDate, 
      assignedTo, 
      assignedTeam,
      project 
    } = req.body;

    // Verify user is admin of the org
    const proj = await Project.findById(project);
    const org = await Organization.findById(proj.organization);
    
    const isAdmin = org.members.some(m => 
      m.user.toString() === req.user._id.toString() && m.role === 'admin'
    );

    if (!isAdmin) {
      return res.status(403).json({ 
        success: false, 
        error: 'Only admins can create tasks' 
      });
    }

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      assignedTo,
      assignedTeam,
      project,
      organization: proj.organization,
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get all tasks in project
exports.getProjectTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', 'name avatar')
      .populate('assignedTeam', 'name')
      .populate('createdBy', 'name');

    res.status(200).json({ success: true, data: tasks });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get user's tasks
exports.getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ 
      $or: [
        { assignedTo: req.user._id },
        { assignedTeam: { $in: req.user.teams } }
      ]
    })
    .populate('project', 'name')
    .populate('assignedTeam', 'name')
    .populate('createdBy', 'name');

    res.status(200).json({ success: true, data: tasks });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Update task status
exports.updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Check if user is assigned to the task or in the assigned team
    const isAssigned =
      (task.assignedTo && task.assignedTo.toString() === req.user._id.toString()) ||
      (task.assignedTeam && req.user.teams && 
       req.user.teams.some(team => team.toString() === task.assignedTeam.toString()));

    if (!isAssigned) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this task'
      });
    }

    task.status = status;
    await task.save();

    res.status(200).json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};



// Add comment to task
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ 
        success: false, 
        error: 'Task not found' 
      });
    }

    // Check if user is member of the org
    const org = await Organization.findById(task.organization);
    const isMember = org.members.some(m => 
      m.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ 
        success: false, 
        error: 'Not authorized to comment on this task' 
      });
    }

    task.comments.push({
      user: req.user._id,
      text
    });

    await task.save();

    res.status(200).json({ success: true, data: task.comments });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};