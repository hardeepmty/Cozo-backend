const express = require('express');
const router = express.Router();
const { 
  createOrganization, 
  joinOrganization, 
  getMyOrganizations, 
  getOrganization,
  inviteUser
} = require('../controllers/orgController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', createOrganization);
router.post('/join', joinOrganization);
router.get('/', getMyOrganizations);
router.get('/:id', getOrganization);
router.post('/:id/invite', inviteUser);

module.exports = router;