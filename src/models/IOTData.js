const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the schema for IOT data
const IOtDataSchema = new Schema({
    train_id: {
        type: String,
        required: true
    },
    train_name: {
        type: String,
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        required: true
    },
    speed: {
        type: Number,
        required: true
    },
    signal_strength: {
        type: Number,
        min: 0,
        max: 100,
        required: true
    }
});

// Create the model from the schema
const IOTData = mongoose.model('IOTData', IOtDataSchema);

module.exports = IOTData;