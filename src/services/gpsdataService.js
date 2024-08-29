const IOTData = require('../models/IOTData');

// Service function to create new GPS data entries
const createGpsData = async (gpsDataArray) => {
    try {
        // Validate that the input is an array
        if (!Array.isArray(gpsDataArray)) {
            throw new Error('Input must be an array of GPS data objects.');
        }

        // Process each GPS data object in the array
        for (const gpsData of gpsDataArray) {
            console.log('Received GPS data:', gpsData); // Debugging line

            const { 
                train_id, 
                train_name, 
                latitude, 
                longitude, 
                timestamp, 
                speed, 
                signal_strength 
            } = gpsData;

            // Validate incoming data
            if (!train_id || !train_name) {
                throw new Error('Train ID and Train Name are required.');
            }

            if (latitude === undefined || longitude === undefined) {
                throw new Error('Latitude and Longitude are required.');
            }

            if (speed === undefined) {
                throw new Error('Speed is required.');
            }

            if (signal_strength === undefined || signal_strength < 0 || signal_strength > 100) {
                throw new Error('Signal strength must be between 0 and 100.');
            }

            // Convert timestamp to a Date object
            const dateTimestamp = new Date(timestamp);
            if (isNaN(dateTimestamp.getTime())) {
                throw new Error('Invalid timestamp format.');
            }

            // Create a new IOTData document
            const newIOTData = new IOTData({
                train_id,
                train_name,
                latitude,
                longitude,
                timestamp: dateTimestamp,
                speed,
                signal_strength
            });

            // Save the new IoT data entry
            await newIOTData.save();
        }

        return { message: 'All IOT data saved successfully.' };
    } catch (err) {
        console.error('Error in createGpsData:', err.message);
        throw new Error('Error saving IOT data: ' + err.message);
    }
};



// Service function to get historical GPS data for a specific train
const getTrainHistory = async (train_id) => {
    try {
        // Calculate the date 90 days ago from today
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        // Fetch GPS data for the specified train_id from the last 90 days
        const gpsData = await IOTData.find({
            train_id,
            timestamp: { $gte: ninetyDaysAgo },
        }).sort({ timestamp: 1 });  // Sort by timestamp ascending

        if (gpsData.length === 0) {
            throw new Error('No historical data found for this train');
        }

        // Format the data for response
        return gpsData.map(data => ({
            timestamp: data.timestamp.toISOString(),
            latitude: data.latitude,
            longitude: data.longitude,
            speed: data.speed,
        }));
    } catch (error) {
        throw new Error('Error fetching historical GPS data: ' + error.message);
    }
};

module.exports = {
    createGpsData,
    getTrainHistory,
};