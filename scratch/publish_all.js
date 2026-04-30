import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
        
        const res = await Product.updateMany({}, { 
            $set: { 
                published: true, 
                status: 'active' 
            } 
        });
        
        console.log(`Successfully updated ${res.modifiedCount} products to Active status.`);
        process.exit(0);
    } catch (err) {
        console.error("Error updating products:", err);
        process.exit(1);
    }
})();
