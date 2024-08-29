const express = require('express');
const router = express.Router();
const {
    getAllTrains,
    getTrainById,
    getTrainLocations,
    addTrainLocations,
    getJourneyTime,
    getTrainHistory
} = require('../controllers/trainController');



// GET all trains
router.get('/trains', getAllTrains);
// GET specific train
router.get('/trains/:train_id', getTrainById);
// GET live location details of specific train
router.get('/trains/:train_id/locations', getTrainLocations);

// POST endpoint for ingesting train location data
router.post('/data', addTrainLocations);

//GET journey time
router.get('/journey-time', getJourneyTime);

// GET historical location data for a specific train
router.get('/:train_id/history', getTrainHistory);

module.exports = router;
// In trainRoutes.js
console.log(getAllTrains);
console.log(getTrainById);
console.log(getTrainLocations);
console.log(addTrainLocations);
console.log(getJourneyTime);
console.log(getTrainHistory);
