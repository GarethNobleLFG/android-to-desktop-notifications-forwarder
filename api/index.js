const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import DB connection funciton.
const connectDb = require('./config/database');

// Import routes.
const smsRoutes = require('./routes/smsRoutes');


const app = express();

connectDb();

// Basic middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Simple logging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Routes:
app.get('/', (req, res) => {
    res.json({
        message: 'SMS API server is running!',
        timestampe: new Date().toISOString()
    });
});
app.use('/sms-api', smsRoutes);


// Start server
if (process.env.NODE_ENV === 'development') {
    app.listen(process.env.PORT, () => {
        console.log(`Server running on port ${process.env.PORT}!`);
    });
}

module.exports = app;