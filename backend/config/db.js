const mongoose = require('mongoose');

// Increase buffer timeout so operations wait longer for connection
mongoose.set('bufferTimeoutMS', 60000);

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            tls: true,
            serverSelectionTimeoutMS: 60000,
            connectTimeoutMS: 60000,
            socketTimeoutMS: 60000,
            heartbeatFrequencyMS: 5000,
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📁 Database Name: ${conn.connection.name}`);

        const User = require('../models/User');
        const bcrypt = require('bcryptjs');

        let admin = await User.findOne({ email: 'admin@food.com' });
        if (!admin) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);
            admin = await User.create({
                name: 'Mitchells Admin',
                email: 'admin@food.com',
                password: hashedPassword,
                role: 'admin',
                isVerified: true
            });
            console.log('✅ Default admin created: admin@food.com / admin123');
        } else {
            console.log('✅ Admin user already exists: admin@food.com');
            const salt = await bcrypt.genSalt(10);
            admin.password = await bcrypt.hash('admin123', salt);
            await admin.save();
            console.log('🔄 Admin password verified/reset to: admin123');
        }

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('📚 Collections:', collections.map(c => c.name));

    } catch (error) {
        console.error(`❌ MongoDB Error: ${error.message}`);
        return false;
    }
};

module.exports = connectDB;