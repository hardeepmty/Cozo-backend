// controllers/utilityController.js

const UtilityItem = require('../models/UtilityItem');
const Project = require('../models/Project'); // Assuming your Project model is used for validation/auth

// @desc    Get all utility items for a specific project
// @route   GET /api/utility-items/project/:projectId
// @access  Private
exports.getUtilityItemsByProject = async (req, res) => {
  try {
    const projectId = req.params.projectId;

    // Basic project existence check (can be expanded with full authorization)
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const utilityItems = await UtilityItem.find({ project: projectId }).sort('name');

    res.status(200).json({ success: true, count: utilityItems.length, data: utilityItems });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Create a new utility item
// @route   POST /api/utility-items
// @access  Private
exports.createUtilityItem = async (req, res) => {
  try {
    const { name, value, project } = req.body;

    // Validate project existence
    const existingProject = await Project.findById(project);
    if (!existingProject) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const utilityItem = await UtilityItem.create({
      name,
      value,
      project,
      createdBy: req.user.id // Assuming req.user.id is set by your protect middleware
    });

    res.status(201).json({ success: true, data: utilityItem });
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, error: messages });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Update a utility item
// @route   PUT /api/utility-items/:id
// @access  Private
exports.updateUtilityItem = async (req, res) => {
  try {
    let utilityItem = await UtilityItem.findById(req.params.id);

    if (!utilityItem) {
      return res.status(404).json({ success: false, error: 'Utility item not found' });
    }

    utilityItem = await UtilityItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: utilityItem });
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, error: messages });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Delete a utility item
// @route   DELETE /api/utility-items/:id
// @access  Private
exports.deleteUtilityItem = async (req, res) => {
  try {
    const utilityItem = await UtilityItem.findById(req.params.id);

    if (!utilityItem) {
      return res.status(404).json({ success: false, error: 'Utility item not found' });
    }

    await utilityItem.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};