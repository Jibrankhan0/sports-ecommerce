const mongoose = require('mongoose');
const dns = require('dns');
require('dotenv').config();

dns.setServers(['8.8.8.8']);

const User = require('./models/User');

const email = process.argv[2];

if (!email) {
    console.error('❌ Please provide an email: node promote.js user@example.com');
    process.exit(1);
}

async function promote() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const user = await User.findOneAndUpdate(
            { email: email },
            { role: 'admin' },
            { new: true }
        );

        if (user) {
            console.log(`✅ Success: ${email} is now an ADMIN.`);
        } else {
            console.log(`❌ Error: User with email ${email} not found.`);
        }
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        mongoose.disconnect();
    }
}

promote();
