const express = require('express');
const router = express.Router();
const { 
  sendMessage, 
  getMessages 
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/:orgId', sendMessage);
router.get('/:orgId', getMessages);

module.exports = router;