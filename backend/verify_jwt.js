const http = require('http');
const fs = require('fs');

const data = JSON.stringify({
    name: "Token Tester Logger",
    email: `tokentest_${Date.now()}@example.com`,
    password: "password123",
    role: "seeker"
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log('Sending request...');

const req = http.request(options, (res) => {
    let log = `STATUS: ${res.statusCode}\n`;
    log += '--- HEADERS ---\n';
    log += JSON.stringify(res.headers, null, 2) + '\n';
    log += '--- BODY ---\n';

    let body = '';
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        body += chunk;
    });
    res.on('end', () => {
        log += body + '\n';
        try {
            const json = JSON.parse(body);
            if (json.token) {
                log += '\nSUCCESS: Token found in response body!\n';
                log += 'Token: ' + json.token + '\n';
                // Verify 2nd step: use token
                verifyToken(json.token, log);
            } else {
                log += '\nFAILURE: No token in response body\n';
                fs.writeFileSync('jwt_check.log', log);
            }
        } catch (e) {
            log += 'Could not parse response JSON\n';
            fs.writeFileSync('jwt_check.log', log);
        }
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
    fs.writeFileSync('jwt_check.log', `Request Error: ${e.message}`);
});

req.write(data);
req.end();

function verifyToken(token, previousLog) {
    let log = previousLog;
    log += '\nVerifying token with /api/auth/me ...\n';
    const options2 = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/me',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };

    const req2 = http.request(options2, (res) => {
        log += `VERIFY STATUS: ${res.statusCode}\n`;
        let body2 = '';
        res.on('data', chunk => body2 += chunk);
        res.on('end', () => {
            log += 'VERIFY BODY: ' + body2 + '\n';
            if (res.statusCode === 200) {
                log += "FINAL RESULT: JWT IMPLEMENTATION IS WORKING PERFECTLY.";
            } else {
                log += "FINAL RESULT: JWT VERIFICATION FAILED.";
            }
            fs.writeFileSync('jwt_check.log', log);
            console.log("Check complete. See jwt_check.log");
        });
    });
    req2.end();
}
