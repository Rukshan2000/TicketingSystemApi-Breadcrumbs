const express = require('express');
const {
  getAllSystems,
  getSystemById,
  createSystem,
  updateSystem,
  deleteSystem,
} = require('../controllers/systemsController');

const router = express.Router();

/**
 * GET Routes
 */
// Get all systems
router.get('/', getAllSystems);

// Get single system by ID
router.get('/:id', getSystemById);

/**
 * POST Routes
 */
// Create new system
router.post('/', createSystem);

/**
 * PUT Routes
 */
// Update system details
router.put('/:id', updateSystem);

/**
 * DELETE Routes
 */
// Delete system
router.delete('/:id', deleteSystem);

module.exports = router;