const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const mailSchema = new mongoose.Schema({
    mail_id: {
        type: String,
        default: uuidv4,
        unique: true,
    },
    // name: {
    //     type: String,
    //     required: true,
    // },
    train_id: {
        type: String,
        required: true,
    },
    destination: {
        type: String,
        required: true,
    },
});

const Mail = mongoose.model('Mail', mailSchema);

module.exports = Mail;