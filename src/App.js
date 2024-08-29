const express = require('express');
const morgan = require('morgan');
const cors = require('cors'); // Import the cors middleware
const trainRoutes = require('./routes/trainRoutes');
const gpsdataRoutes = require('./routes/gpsdataRoutes');
const connectDB = require('./config/dbConfig');
require('dotenv').config();

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(express.json());
app.use(morgan('dev'));
app.use(cors()); // Use the cors middleware

// Routes
app.use('/api', gpsdataRoutes);
app.use('/api/v1', trainRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        status: 'error',
        message: err.message,
    });
});

module.exports = app;