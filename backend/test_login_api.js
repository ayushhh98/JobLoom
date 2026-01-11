const axios = require('axios');

const login = async () => {
    try {
        const res = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'sandilyaayush98@gmail.com',
            password: '9895497140'
        });
        console.log('Response status:', res.status);
        console.log('Response data:', JSON.stringify(res.data, null, 2));
    } catch (err) {
        console.error('Error:', err.response ? err.response.data : err.message);
    }
};

login();
