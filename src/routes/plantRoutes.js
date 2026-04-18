const express = require('express');
const {
  createPlant,
  getPlants,
  getPlant,
  updatePlant,
  deletePlant
} = require('../controllers/plantController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware); // All routes require authentication

router.route('/')
  .post(createPlant)
  .get(getPlants);

router.route('/:id')
  .get(getPlant)
  .put(updatePlant)
  .delete(deletePlant);

module.exports = router;