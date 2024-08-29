const gpsdataService = require('../services/gpsdataService');

exports.createGpsData = async (req, res) => {
    try {
        const gpsDataArray = req.body;

        // Check if the input is an array
        if (!Array.isArray(gpsDataArray)) {
            return res.status(400).json({ message: 'Input must be an array of GPS data objects.' });
        }

        const result = await gpsdataService.createGpsData(gpsDataArray);
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getTrainHistory = async (req, res) => {
    try {
        const { train_id } = req.params;
        const history = await gpsdataService.getTrainHistory(train_id);
        res.status(200).json(history);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};