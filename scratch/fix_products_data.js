import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function fixData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        
        const rawProducts = await mongoose.connection.db.collection('products').find({}).toArray();
        console.log(`Found ${rawProducts.length} raw rows`);

        const productsByHandle = {};

        for (const row of rawProducts) {
            const handle = row.Handle || row.handle || `unknown-${row._id}`;
            
            if (!productsByHandle[handle]) {
                productsByHandle[handle] = {
                    title: row.Title || row.title || 'Untitled Product',
                    handle: handle,
                    description: row['Body (HTML)'] || row.description || '',
                    vendor: row.Vendor || row.vendor || 'Surprise Sutra',
                    productCategory: row['Product Category'] || row.productCategory || '',
                    type: row.Type || row.type || '',
                    tags: row.Tags ? (typeof row.Tags === 'string' ? row.Tags.split(',').map(t => t.trim()) : row.Tags) : [],
                    published: row.Published === true || row.Published === 'TRUE' || row.published === true,
                    images: [],
                    variants: [],
                    status: row.Status || row.status || 'active'
                };
            }

            // Add Image if present
            if (row['Image Src'] || row.imageSrc) {
                productsByHandle[handle].images.push({
                    src: row['Image Src'] || row.imageSrc,
                    position: row['Image Position'] || productsByHandle[handle].images.length + 1
                });
            }

            // Add Variant if it has variant info
            if (row['Variant Price'] !== undefined || row.price !== undefined) {
                productsByHandle[handle].variants.push({
                    sku: row['Variant SKU'] || row.sku || null,
                    price: Number(row['Variant Price'] || row.price || 0),
                    inventoryQty: Number(row['Variant Inventory Qty'] || row.inventoryQty || 0),
                    option1: row['Option1 Value'] || row.option1 || null,
                });
            }
        }

        const finalProducts = Object.values(productsByHandle);
        console.log(`Grouped into ${finalProducts.length} products`);

        // Clear and re-insert or update
        // We'll create a new collection 'products_fixed' and then rename
        await mongoose.connection.db.collection('products_fixed').insertMany(finalProducts);
        
        await mongoose.connection.db.collection('products').rename('products_backup_' + Date.now());
        await mongoose.connection.db.collection('products_fixed').rename('products');

        console.log('Successfully fixed and grouped products.');
        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

fixData();
