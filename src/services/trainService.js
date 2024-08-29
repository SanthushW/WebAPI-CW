const Train = require('../models/Train');
const axios = require('axios');
const crypto = require('crypto');

// Service function to retrieve all trains
const getAllTrains = async () => {
    try {
        const trains = await Train.find({});
        return trains;
    } catch (error) {
        throw new Error('Error fetching all trains: ' + error.message);
    }
};

// Service function to retrieve a specific train by ID
const getTrainById = async (train_id) => {
    try {
        const train = await Train.findOne({ train_id: train_id });
        if (!train) {
            throw new Error('Train not found');
        }
        return train;
    } catch (error) {
        throw new Error('Error fetching train: ' + error.message);
    }
};

// Service function to retrieve live location data for a specific train
const getTrainLocations = async (train_id) => {
    try {
        const locations = await Train.find(
            { train_id: train_id },
            { 'latitude': 1, 'longitude': 1, _id: 0 }
        ).sort({ timestamp: -1 });
        return locations;
    } catch (error) {
        throw new Error('Error fetching train locations: ' + error.message);
    }
};

// Service function to save multiple location data
const addTrainLocations = async (locationsData) => {
    try {
        // Use insertMany to save all location objects in the array at once
        const newLocations = await Train.insertMany(locationsData);
        return newLocations;
    } catch (error) {
        throw new Error('Error adding train locations: ' + error.message);
    }
};


// Service function to get location name from latitude and longitude (Help to get live loaction of train)
const getLocationName = async (latitude, longitude) => {
    try {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        const response = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
        );
        
        if (response.data.results.length === 0) {
            throw new Error('No results found for the given coordinates');
        }

        // Get the formatted address from the first result
        const locationName = response.data.results[0].formatted_address;
        return locationName;
    } catch (error) {
        console.error('Error fetching location name:', error.message);
        throw new Error('Error fetching location name: ' + error.message);
    }
};

const getJourneyTime = async (departureLocation, arrivalLocation) => {
    try {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        const response = await axios.get(
            `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(departureLocation)}&destination=${encodeURIComponent(arrivalLocation)}&key=${apiKey}`
        );

        // Log the full response for debugging
        console.log(response.data);

        const route = response.data.routes[0];
        if (route) {
            const duration = route.legs[0].duration.text; // Estimated travel time
            return duration;
        } else {
            throw new Error('No route found');
        }
    } catch (error) {
        throw new Error('Error fetching journey time: ' + error.message);
    }
};

module.exports = {
    getAllTrains,
    getTrainById,
    getTrainLocations,
    addTrainLocations,
    getLocationName,
    getJourneyTime,
};