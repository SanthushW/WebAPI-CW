const IOTData = require('../models/IOTData');
const trainService = require('../services/trainService');
const axios = require('axios');

// Controller function to handle GET request to retrieve all trains
const getAllTrains = async (req, res) => {
    try {
        const { date } = req.query;
        const filter = {};

        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 1);

            filter.timestamp = {
                $gte: startDate,
                $lt: endDate
            };
        }

        const trains = await IOTData.find(filter);
        res.json(trains);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Controller function to handle GET request for a specific train
const getTrainById = async (req, res) => {
    try {
        const { train_id } = req.params;
        const { date } = req.query;
        const filter = { train_id };

        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 1);

            filter.timestamp = {
                $gte: startDate,
                $lt: endDate
            };
        }

        const train = await IOTData.findOne(filter);
        if (!train) {
            return res.status(404).json({ message: 'Train not found' });
        }
        res.json(train);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Controller function to handle GET request for live location details of a specific train
const getTrainLocations = async (req, res) => {
    try {
        const { train_id } = req.params;

        // Fetch only the latest location entry directly
        const latestLocation = await IOTData.findOne({ train_id })
            .sort({ timestamp: -1 })  // Ensure you get the latest document
            .select('latitude longitude timestamp')  // Select only necessary fields
            .exec();  // Execute the query

        if (!latestLocation) {
            return res.status(404).json({ message: 'No locations found' });
        }

        // Get location name for the latest coordinate
        const locationName = await getLocationName(latestLocation.latitude, latestLocation.longitude);

        const response = {
            latitude: latestLocation.latitude,
            longitude: latestLocation.longitude,
            timestamp: latestLocation.timestamp,
            locationName
        };

        res.json(response);
    } catch (error) {
        console.error('Error fetching train locations:', error.message);
        res.status(500).json({ error: error.message });
    }
};


// Helper function to get location name based on latitude and longitude
const getLocationName = async (latitude, longitude) => {
    try {
        const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
            params: {
                latlng: `${latitude},${longitude}`,
                key: process.env.GOOGLE_MAPS_API_KEY
            }
        });
        
        if (response.data.status === 'OK' && response.data.results.length > 0) {
            return response.data.results[0].formatted_address;
        } else {
            return 'Unknown Location';
        }
    } catch (error) {
        console.error('Error fetching location name:', error.message);
        return 'Unknown Location';
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

        for (const Mail of locationsData) {
            if (!Mail.train_id || !Mail.train_name || !Mail.latitude || !Mail.longitude || !Mail.timestamp || !Mail.speed || !Mail.signal_strength) {
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

// Controller function to get historical data
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