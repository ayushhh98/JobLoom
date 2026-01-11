const http = require('http');

console.log('Testing Jooble Search with keyword: "java"...');

const data = JSON.stringify({
    keywords: 'java',
    location: 'Mumbai'
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
                console.log(`Success! Found ${json.count} jobs for "java" in "Mumbai".`);
                // List first 3 jobs
                if (json.data && json.data.length > 0) {
                    console.log('\nTop 3 Results:');
                    json.data.slice(0, 3).forEach((job, i) => {
                        console.log(`${i + 1}. ${job.title} (${job.location}) - ${job.company}`);
                    });
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
