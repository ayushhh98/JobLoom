const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const dir = path.join(__dirname, 'public', 'uploads', 'templates');
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

// Create sample data matching our new schema
const data = [
    {
        "Name": "Enter Name",
        "Email": "name@example.com",
        "Course": "Advanced Web Development",
        "Roll Number": "WEB23001",
        "Year": "2024",
        "Certificate Type": "Training Completion",
        "Company Name": "JobLoom Tech"
    },
    {
        "Name": "Enter Name",
        "Email": "jane@example.com",
        "Course": "UI/UX Design Masterclass",
        "Roll Number": "UI23045",
        "Year": "2024",
        "Certificate Type": "Internship",
        "Company Name": "Creative Studios"
    }
];

const ws = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Students");

const filePath = path.join(dir, 'student-template.xlsx');
XLSX.writeFile(wb, filePath);

console.log('Template created at:', filePath);
