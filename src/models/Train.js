const mongoose = require('mongoose');

const TrainSchema = new mongoose.Schema({
    train_id: { type: String, required: true },
    timestamps: { type: [String], required: true },
    start_time: { type: String, required: true },
    coordinates: { 
        type: [{ 
            type: [Number], 
            required: true 
        }], 
        required: true 
    },
});

const Train = mongoose.model('Train', TrainSchema);

module.exports = Train;
