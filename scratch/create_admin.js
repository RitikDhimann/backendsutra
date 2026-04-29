import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: { type: String, required: true },
    role: { type: String, default: 'user' }
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        
        const existing = await User.findOne({ email: 'tempadmin@gmail.com' });
        if (existing) {
            await User.deleteOne({ email: 'tempadmin@gmail.com' });
        }

        const admin = new User({
            name: 'Temp Admin',
            email: 'tempadmin@gmail.com',
            password: 'password123',
            role: 'admin'
        });

        await admin.save();
        console.log('Temp Admin created: tempadmin@gmail.com / password123');
        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

createAdmin();
