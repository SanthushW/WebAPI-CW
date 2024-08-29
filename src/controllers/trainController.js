const trainService = require('../services/trainService');

// Controller function to handle GET request to retrieve all trains
const getAllTrains = async (req, res) => {
    try {
        const trains = await trainService.getAllTrains();
        res.status(200).json(trains);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Controller function to handle GET request for a specific train
const getTrainById = async (req, res) => {
    try {
        const train = await trainService.getTrainById(req.params.train_id);
        res.status(200).json(train);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Controller function to handle GET request for live location details of a specific train
const getTrainLocations = async (req, res) => {
    try {
        const locations = await trainService.getTrainLocations(req.params.train_id);

        // Get location names for each coordinate and include only necessary fields
        const locationPromises = locations.map(async (loc) => {
            const locationName = await trainService.getLocationName(loc.latitude, loc.longitude);
            return {
                latitude: loc.latitude,
                longitude: loc.longitude,
                locationName
            };
        });

        const locationsWithNames = await Promise.all(locationPromises);
        res.status(200).json(locationsWithNames);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Controller function to handle POST request to ingest multiple train location data
const addTrainLocations = async (req, res) => {
    try {
        let locationsData = req.body;
        console.log("Received data:", locationsData); // Log the incoming data

        if (!Array.isArray(locationsData)) {
            locationsData = [locationsData]; // Wrap single object in an array
        }

        if (locationsData.length === 0) {
            return res.status(400).json({ message: 'Invalid data format or empty array' });
        }

        for (const item of locationsData) {
            if (!item.train_id || !item.train_name || !item.latitude || !item.longitude || !item.timestamp || !item.speed || !item.signal_strength) {
                return res.status(400).json({ message: 'Missing required fields' });
            }
        }

        const newLocations = await Train.insertMany(locationsData);
        res.status(201).json({ message: 'Location data added successfully', data: newLocations });
    } catch (error) {
        console.error('Error adding train locations:', error);
        res.status(500).json({ message: error.message });
    }
};

// Controller function to get journey time
const getJourneyTime = async (req, res) => {
    try {
        const { departureLocation, arrivalLocation } = req.query;
        if (!departureLocation || !arrivalLocation) {
            return res.status(400).json({ message: 'Departure and arrival locations are required' });
        }

        const estimatedTime = await trainService.getJourneyTime(departureLocation, arrivalLocation);
        res.status(200).json({ estimatedTime });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTrainHistory = async (req, res) => {
    try {
        const { train_id } = req.params;

        // Calculate the date 90 days ago from today
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        // Fetch GPS data for the specified trainId from the last 90 days
        const gpsData = await IOTData.find({
            train_id,
            timestamp: { $gte: ninetyDaysAgo },
        }).sort({ timestamp: 1 });  // Sort by timestamp ascending

        if (gpsData.length === 0) {
            return res.status(404).json({ status: 'error', message: 'No historical data found for this train' });
        }

        // Format the data for response
        const formattedData = gpsData.map(data => ({
            timestamp: data.timestamp.toISOString(),
            latitude: data.latitude,
            longitude: data.longitude,
            speed: data.speed,
        }));

        // Send response
        res.status(200).json(formattedData);
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

module.exports = {
    getAllTrains,
    getTrainById,
    getTrainLocations,
    addTrainLocations,
    getJourneyTime,
    getTrainHistory
};