const mongoose = require('mongoose');
const dns = require('dns');
require('dotenv').config();

// Force Google DNS to resolve MongoDB SRV records
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sportstore');
        console.log(`📡 MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`❌ Error: ${err.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
