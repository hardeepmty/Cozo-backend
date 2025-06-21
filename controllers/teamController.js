const Team = require('../models/Team');
const Organization = require('../models/Organization');
const User = require('../models/User');

// Create team
exports.createTeam = async (req, res) => {
  try {
    const { name, description, members, teamLead } = req.body;
    const organization = req.params.orgId;

    // Verify user is admin of the org
    const org = await Organization.findById(organization);
    const isAdmin = org.members.some(m => 
      m.user.toString() === req.user._id.toString() && m.role === 'admin'
    );

    if (!isAdmin) {
      return res.status(403).json({ 
        success: false, 
        error: 'Only admins can create teams' 
      });
    }

    const team = await Team.create({
      name,
      description,
      organization,
      members,
      teamLead,
      createdBy: req.user._id
    });

    // Add team to users' teams list
    await User.updateMany(
      { _id: { $in: members } },
      { $addToSet: { teams: team._id } }
    );

    res.status(201).json({ success: true, data: team });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get all teams in organization
exports.getTeams = async (req, res) => {
  try {
    const teams = await Team.find({ organization: req.params.orgId })
      .populate('members', 'name email avatar')
      .populate('teamLead', 'name');

    res.status(200).json({ success: true, data: teams });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Add member to team
exports.addTeamMember = async (req, res) => {
  try {
    const { userId } = req.body;

    // Verify user is admin of the org
    const team = await Team.findById(req.params.teamId);
    const org = await Organization.findById(team.organization);
    
    const isAdmin = org.members.some(m => 
      m.user.toString() === req.user._id.toString() && m.role === 'admin'
    );

    if (!isAdmin) {
      return res.status(403).json({ 
        success: false, 
        error: 'Only admins can add team members' 
      });
    }

    // Check if user is already in team
    if (team.members.includes(userId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'User is already in this team' 
      });
    }

    team.members.push(userId);
    await team.save();

    // Add team to user's teams list
    await User.findByIdAndUpdate(userId, {
      $addToSet: { teams: team._id }
    });

    res.status(200).json({ success: true, data: team });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};