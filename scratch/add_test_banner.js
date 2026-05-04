import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
    text: String,
    link: String,
    isActive: Boolean,
    backgroundColor: String,
    textColor: String,
    image: String
});

const Banner = mongoose.model('Banner', bannerSchema);

async function addSampleBanner() {
    try {
        await mongoose.connect('mongodb+srv://rdhiman0744_db_user:XyrCHo3Bq6GBkzZo@cluster0.inlgpw3.mongodb.net/SurpriseSutra?appName=Cluster0');
        console.log("Connected to MongoDB");

        // Deactivate existing banners
        await Banner.updateMany({}, { isActive: false });

        const sampleBanner = new Banner({
            text: "Welcome to Surprise Sutra! 🎉 Get 10% OFF on your first order.",
            link: "/diy-kits",
            isActive: true,
            backgroundColor: "#c73020",
            textColor: "#ffffff",
            image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=1000"
        });

        await sampleBanner.save();
        console.log("Sample banner added successfully");
        process.exit(0);
    } catch (err) {
        console.error("Error adding sample banner:", err);
        process.exit(1);
    }
}

addSampleBanner();
