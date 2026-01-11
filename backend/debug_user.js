const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

const checkUser = async () => {
    await connectDB();
    const email = 'sandilyaayush98@gmail.com';
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        console.log('User NOT FOUND');
        console.log('User FOUND:', user);
        console.log('Role:', JSON.stringify(user.role));
        console.log('Is Verified:', user.isVerified);

        // Check password
        // const isMatch = await user.matchPassword('9895497140');
        // console.log('Password Match:', isMatch);

        // if (user.role !== 'employer') {
        //     console.log('FIXING: Setting role to employer...');
        //     user.role = 'employer';
        //     await user.save();
        //     console.log('User role updated to employer.');
        // }
    }
    process.exit();
};

checkUser();
