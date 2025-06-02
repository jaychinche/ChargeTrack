const express = require('express');
const {
  getChargingStations,
  getChargingStation,
  createChargingStation,
  updateChargingStation,
  deleteChargingStation,
  getChargingStationsInRadius,
  getDashboardStats
} = require('../controllers/chargingStationController');
const router = express.Router();
router
  .route('/dashboard-stats').get(getDashboardStats);

router
  .route('/radius/:zipcode/:distance')
  .get(getChargingStationsInRadius);

router
  .route('/')
  .get(getChargingStations)
  .post(createChargingStation);
router
  .route('/:id')
  .get(getChargingStation)
  .put(updateChargingStation)
  .delete(deleteChargingStation);
router.route('/:id').get(getChargingStation);

module.exports = router;