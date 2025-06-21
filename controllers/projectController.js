const Project = require('../models/Project');
const Organization = require('../models/Organization');
const { generateAISummary } = require('../utils/aiHelper');

// Create project
exports.createProject = async (req, res) => {
  try {
    const { name, description, problemStatement, teams, endDate } = req.body;
    const organization = req.params.orgId;

    // Verify user is admin of the org
    const org = await Organization.findById(organization);
    const isAdmin = org.members.some(m => 
      m.user.toString() === req.user._id.toString() && m.role === 'admin'
    );

    if (!isAdmin) {
      return res.status(403).json({ 
        success: false, 
        error: 'Only admins can create projects' 
      });
    }

    // Generate AI summary
    //const problemStatementSummary = await generateAISummary(problemStatement);

    const project = await Project.create({
      name,
      description,
      problemStatement,
      //problemStatementSummary,
      organization,
      teams,
      endDate,
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, data: project });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get all projects in organization
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ 
      organization: req.params.orgId 
    })
    .populate('teams', 'name')
    .populate('createdBy', 'name');

    res.status(200).json({ success: true, data: projects });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get project details
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('teams', 'name')
      .populate('createdBy', 'name');

    if (!project) {
      return res.status(404).json({ 
        success: false, 
        error: 'Project not found' 
      });
    }

    res.status(200).json({ success: true, data: project });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Update project
exports.updateProject = async (req, res) => {
  try {
    const { name, description, problemStatement, status, teams, endDate } = req.body;

    // Verify user is admin of the org
    const project = await Project.findById(req.params.id);
    const org = await Organization.findById(project.organization);
    
    const isAdmin = org.members.some(m => 
      m.user.toString() === req.user._id.toString() && m.role === 'admin'
    );

    if (!isAdmin) {
      return res.status(403).json({ 
        success: false, 
        error: 'Only admins can update projects' 
      });
    }

    // Generate new AI summary if problem statement changed
    let problemStatementSummary = project.problemStatementSummary;
    if (problemStatement && problemStatement !== project.problemStatement) {
      problemStatementSummary = await generateAISummary(problemStatement);
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { 
        name, 
        description, 
        problemStatement, 
        problemStatementSummary,
        status, 
        teams, 
        endDate 
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: updatedProject });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};