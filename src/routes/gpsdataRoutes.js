const express = require('express');
const router = express.Router();
const gpsdataController = require('../controllers/gpsdataController');

// Route to handle incoming GPS data
router.post('/gpsdata', gpsdataController.createGpsData);

module.exports = router;