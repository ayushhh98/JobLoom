const http = require('http');

const data = JSON.stringify({
    keywords: 'it',
    location: 'India'
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/jobs/external',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        try {
            const json = JSON.parse(body);
            if (json.success) {
                console.log(`Success! Found ${json.count} jobs.`);
                if (json.data && json.data.length > 0) {
                    console.log('Sample Job:', json.data[0].title, 'at', json.data[0].location);
                }
            } else {
                console.log('Failed:', json.error);
            }
        } catch (e) {
            console.log('Raw Body:', body);
        }
    });
});

req.on('error', (error) => {
    console.error('Request Error:', error);
});

req.write(data);
req.end();
