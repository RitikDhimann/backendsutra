import axios from 'axios';

const checkAll = async () => {
    try {
        const res = await axios.get('http://localhost:5000/api/banner');
        console.log("All Banners:", JSON.stringify(res.data, null, 2));
    } catch (err) {
        console.error("Error:", err.message);
    }
};

checkAll();
