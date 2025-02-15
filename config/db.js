const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.MONGODB_URI;

const connectDB = async () => {
    
    try {
        await mongoose.connect(mongoURI)
        console.log('Connected to MongoDB')
    } catch (error) {
        console.log(error);
    }
}

module.exports = connectDB;