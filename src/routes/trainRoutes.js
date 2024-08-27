const express = require('express');
const router = express.Router();
const TrainController = require('../src/controllers/TrainController');

router.get('/', TrainController.getAllTrains);
router.get('/:id', TrainController.getTrainById);
router.post('/', TrainController.createTrain);
router.put('/:id', TrainController.updateTrain);
router.delete('/:id', TrainController.deleteTrain);

module.exports = router;
