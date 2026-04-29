import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function fixCasing() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        
        const products = await mongoose.connection.db.collection('products').find({}).toArray();
        console.log(`Found ${products.length} products`);

        const bulkOps = [];
        for (const product of products) {
            const updatedProduct = {};
            const keysToDelete = [];

            // Mapping capitalized keys to lowercase keys
            const keyMap = {
                'Title': 'title',
                'Handle': 'handle',
                'Vendor': 'vendor',
                'Type': 'type',
                'Tags': 'tags',
                'Published': 'published',
                'Status': 'status',
                'Body (HTML)': 'description',
                'Product Category': 'productCategory',
                'Option1 Name': 'option1Name',
                'Option1 Value': 'option1Value',
                'Variant Price': 'price', // Note: schema has variants array, this might need mapping
                'Image Src': 'imageSrc' // Note: schema has images array
            };

            for (const key in product) {
                if (keyMap[key]) {
                    updatedProduct[keyMap[key]] = product[key];
                    keysToDelete.push(key);
                } else if (key === '_id') {
                    // Keep _id
                } else {
                    // For other keys, just lowercase them if they start with uppercase
                    const lowerKey = key.charAt(0).toLowerCase() + key.slice(1);
                    if (lowerKey !== key) {
                        updatedProduct[lowerKey] = product[key];
                        keysToDelete.push(key);
                    }
                }
            }

            if (Object.keys(updatedProduct).length > 0) {
                const unsetOp = {};
                keysToDelete.forEach(k => unsetOp[k] = "");
                
                bulkOps.push({
                    updateOne: {
                        filter: { _id: product._id },
                        update: { 
                            $set: updatedProduct,
                            $unset: unsetOp
                        }
                    }
                });
            }
        }

        if (bulkOps.length > 0) {
            console.log(`Running ${bulkOps.length} bulk updates...`);
            // Run in chunks if too large
            const chunkSize = 500;
            for (let i = 0; i < bulkOps.length; i += chunkSize) {
                const chunk = bulkOps.slice(i, i + chunkSize);
                await mongoose.connection.db.collection('products').bulkWrite(chunk);
                console.log(`Updated chunk ${i / chunkSize + 1}`);
            }
            console.log('Finished fixing casing.');
        } else {
            console.log('No updates needed.');
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

fixCasing();
