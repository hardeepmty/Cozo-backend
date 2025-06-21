// routes/utilityItems.js

const express = require('express');
const { protect } = require('../middleware/auth'); // Your authentication middleware
const {
  getUtilityItemsByProject,
  createUtilityItem,
  updateUtilityItem,
  deleteUtilityItem
} = require('../controllers/utilityController'); // <--- Import controller functions

const router = express.Router();

// Routes for Utility Items
router.route('/')
  .post(protect, createUtilityItem); // POST /api/utility-items

router.route('/project/:projectId')
  .get(protect, getUtilityItemsByProject); // GET /api/utility-items/project/:projectId

router.route('/:id')
  .put(protect, updateUtilityItem)    // PUT /api/utility-items/:id
  .delete(protect, deleteUtilityItem); // DELETE /api/utility-items/:id

module.exports = router;