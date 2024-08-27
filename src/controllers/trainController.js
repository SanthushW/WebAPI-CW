const Train = require('../models/Train');

// Get all trains
exports.getAllTrains = async (req, res) => {
    try {
        const trains = await Train.find();
        res.status(200).json(trains);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a train by ID
exports.getTrainById = async (req, res) => {
    try {
        const train = await Train.findById(req.params.id);
        if (!train) return res.status(404).json({ message: 'Train not found' });
        res.status(200).json(train);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
