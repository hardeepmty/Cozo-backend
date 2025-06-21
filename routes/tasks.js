const express = require('express');
const router = express.Router();
const { 
  createTask, 
  getProjectTasks, 
  getMyTasks, 
  updateTaskStatus,
  addComment
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', createTask);
router.get('/project/:projectId', getProjectTasks);
router.get('/my-tasks', getMyTasks);
router.put('/:id/status', updateTaskStatus);
router.post('/:id/comments', addComment);

module.exports = router;
