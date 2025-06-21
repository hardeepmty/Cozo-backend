const express = require('express');
const router = express.Router();
const { 
  createTeam, 
  getTeams, 
  addTeamMember 
} = require('../controllers/teamController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/:orgId', createTeam);
router.get('/:orgId', getTeams);
router.post('/:teamId/members', addTeamMember);

module.exports = router;