const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const trainSchema = new mongoose.Schema({
    location_id: {
        type: String,
        default: uuidv4,
        unique: true,
    },
    train_id: {
        type: String,
        required: true,
    },
    train_name: {
        type: String,
        required: true
    },
    latitude: {
        type: Number,
        required: true,
    },
    longitude: {
        type: Number,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
        required: true
    },
    speed: {
        type: Number,
        required: true,
    },
    signal_strength: {
        type: Number,
        min: 0,
        max: 100,
        required: true
    }
});

const Train = mongoose.model('Train', trainSchema);

module.exports = Train;