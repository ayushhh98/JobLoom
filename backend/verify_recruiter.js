const http = require('http');
const fs = require('fs');

const data = JSON.stringify({
    name: "Recruiter Tester",
    email: `recruiter_${Date.now()}@example.com`,
    password: "password123",
    role: "employer",
    mobile: "9876543210",
    companyName: "Test Corp",
    companyDetails: {
        hiringFor: "company",
        employees: "11-50",
        designation: "HR Manager",
        pincode: "110001",
        address: "123 Tech Park"
    }
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

console.log('Sending Recruiter Registration request...');

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
                log += '\nSUCCESS: Recruiter Token found in response body!\n';
                log += 'Token: ' + json.token + '\n';
                log += 'User Role: ' + json.user.role + '\n';

                if (json.user.role === 'employer') {
                    log += 'ROLE CHECK: PASSED (employer)\n';
                } else {
                    log += 'ROLE CHECK: FAILED (expected employer)\n';
                }

            } else {
                log += '\nFAILURE: No token in response body\n';
            }
        } catch (e) {
            log += 'Could not parse response JSON\n';
        }

        fs.writeFileSync('recruiter_check.log', log);
        console.log("Check complete. See recruiter_check.log");
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
    fs.writeFileSync('recruiter_check.log', `Request Error: ${e.message}`);
});

req.write(data);
req.end();
