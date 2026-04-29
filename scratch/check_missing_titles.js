import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const count = await mongoose.connection.db.collection('products').countDocuments({ title: { $exists: false } });
        const countNull = await mongoose.connection.db.collection('products').countDocuments({ title: null });
        console.log('Products without title field:', count);
        console.log('Products with null title:', countNull);
        
        if (count > 0 || countNull > 0) {
            const samples = await mongoose.connection.db.collection('products').find({ $or: [{ title: { $exists: false } }, { title: null }] }).limit(5).toArray();
            console.log('Samples:', JSON.stringify(samples, null, 2));
        }
        
        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

check();
