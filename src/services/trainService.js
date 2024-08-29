const axios = require('axios');
const crypto = require('crypto');
const IOTData = require('../models/IOTData');

// Service function to retrieve all trains
const getAllTrains = async (date) => {
    try {
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
        return trains;
    } catch (error) {
        throw new Error('Error fetching all trains: ' + error.message);
    }
};


// Service function to retrieve a specific train by ID
const getTrainById = async (train_id, date) => {
    try {
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
            throw new Error('Train not found');
        }
        return train;
    } catch (error) {
        throw new Error('Error fetching train: ' + error.message);
    }
};


// Service function to retrieve live location data with location names for a specific train
const getTrainLocations = async (train_id, date) => {
    try {
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

        const locations = await IOTData.find(filter, { 'latitude': 1, 'longitude': 1, _id: 0 }).sort({ timestamp: -1 });

        const locationPromises = locations.map(async loc => {
            const locationName = await getLocationName(loc.latitude, loc.longitude);
            return {
                latitude: loc.latitude,
                longitude: loc.longitude,
                locationName: locationName
            };
        });

        const locationsWithNames = await Promise.all(locationPromises);
        return locationsWithNames;

    } catch (error) {
        throw new Error('Error fetching train locations: ' + error.message);
    }
};


// Service function to save multiple location data
const addTrainLocations = async (locationsData) => {
    try {
        // Use insertMany to save all location objects in the array at once
        const newLocations = await IOTData.insertMany(locationsData);
        return newLocations;
    } catch (error) {
        throw new Error('Error adding train locations: ' + error.message);
    }
};

// Service function to get latitude and longitude of a user's location (Help to get Journey time through google map API)
const getUserCoordinates = async (userLocation) => {
    try {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        const response = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(userLocation)}&key=${apiKey}`
        );
        if (response.data.results.length === 0) {
            throw new Error('No results found for the given address');
        }
        const location = response.data.results[0].geometry.location;
        console.log(`Fetched coordinates: ${location.lat}, ${location.lng}`);
        return {
            latitude: location.lat,
            longitude: location.lng
        };
    } catch (error) {
        console.error('Error fetching user coordinates:', error.message);
        throw new Error('Error fetching user coordinates: ' + error.message);
    }
};


// Service function to get location name from latitude and longitude (based on Google Maps API)
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
    getUserCoordinates,
    getLocationName,
    getJourneyTime,
};