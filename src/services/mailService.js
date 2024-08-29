const Mail = require('../models/mail');
const Train = require('../models/IOTData');
const axios = require('axios');

// Function to get location name from latitude and longitude using Google Maps API
const getLocationName = async (latitude, longitude) => {
    try {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
        const response = await axios.get(url);
        if (response.data.status === 'OK') {
            return response.data.results[0].formatted_address;
        } else {
            throw new Error('Unable to get location name from Google Maps API');
        }
    } catch (error) {
        throw new Error('Error fetching location name: ' + error.message);
    }
};

// Service function to add a new mail
const addMail = async (mailData) => {
    try {
        // Validate if the train_id exists in the system
        const trainExists = await Train.findOne({ train_id: mailData.train_id });
        if (!trainExists) {
            throw new Error('Train ID does not exist in the system');
        }

        const newMail = new Mail(mailData);
        await newMail.save();
        return newMail;
    } catch (error) {
        throw new Error('Error adding mail: ' + error.message);
    }
};

// Service function to retrieve a specific mail by ID and fetch the corresponding train details
const getMailAndTrainDetails = async (mail_id) => {
    try {
        const mail = await Mail.findOne({ mail_id });
        if (!mail) {
            throw new Error('Mail not found');
        }

        // Fetch the latest train location based on the train_id
        const trainLocation = await Train.findOne(
            { train_id: mail.train_id },
            { latitude: 1, longitude: 1 }
        ).sort({ timestamp: -1 });

        if (!trainLocation) {
            throw new Error('No location data found for this train');
        }

        // Get the human-readable location name using Google Maps API
        const locationName = await getLocationName(trainLocation.latitude, trainLocation.longitude);

        return {
            mail,
            train_id: mail.train_id,
            trainLocation: {
                latitude: trainLocation.latitude,
                longitude: trainLocation.longitude,
                locationName
            }
        };
    } catch (error) {
        throw new Error('Error fetching mail and train details: ' + error.message);
    }
};

module.exports = {
    addMail,
    getMailAndTrainDetails,
};