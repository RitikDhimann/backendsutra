import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const Product = mongoose.model('Product', new mongoose.Schema({}));

async function countProducts() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        const count = await Product.countDocuments();
        console.log('Total Products:', count);
        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

countProducts();
