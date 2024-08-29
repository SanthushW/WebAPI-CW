const mailService = require('../services/mailService');

// Controller function to handle POST request to add a new mail
const addMail = async (req, res) => {
    try {
        const mailData = req.body;
        const newMail = await mailService.addMail(mailData);
        res.status(201).json({ message: 'Mail added successfully', data: newMail });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Controller function to handle GET request to retrieve mail and train details
const getMailAndTrainDetails = async (req, res) => {
    try {
        const { mail_id } = req.params;
        const details = await mailService.getMailAndTrainDetails(mail_id);
        res.status(200).json(details);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addMail,
    getMailAndTrainDetails,
};