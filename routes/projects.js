const express = require('express');
const router = express.Router();
const { 
  createProject, 
  getProjects, 
  getProject, 
  updateProject 
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/:orgId', createProject);
router.get('/:orgId', getProjects);
router.get('/:orgId/:id', getProject);
router.put('/:orgId/:id', updateProject);

module.exports = router;