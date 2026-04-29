import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function checkDatabases() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        const admin = mongoose.connection.db.admin();
        const dbs = await admin.listDatabases();
        console.log('Databases:', dbs.databases.map(db => db.name));
        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkDatabases();
