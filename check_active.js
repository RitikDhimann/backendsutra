import axios from 'axios';

const check = async () => {
    try {
        const res = await axios.get('http://localhost:5000/api/banner/active');
        console.log("Active Banner:", res.data);
    } catch (err) {
        console.error("Error:", err.message);
    }
};

check();
