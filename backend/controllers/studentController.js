const Student = require('../models/Student');
const xlsx = require('xlsx');
const Joi = require('joi');

// Validation Schema for each student row
const studentSchema = Joi.object({
    Name: Joi.string().required(),
    RollNo: Joi.string().required(),
    Email: Joi.string().email().required(),
    Course: Joi.string().required(),
    Year: Joi.string().required() // Accepting as string or number
}).unknown(true); // Allow other columns but ignore them

exports.uploadStudents = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload an Excel file' });
        }

        // Read Excel File
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        if (!data || data.length === 0) {
            return res.status(400).json({ success: false, message: 'Excel file is empty' });
        }

        const validStudents = [];
        const errors = [];
        const duplicates = [];

        // Validate and Process Data
        for (let i = 0; i < data.length; i++) {
            const row = data[i];

            // Normalize Keys (Case-insensitive & Variation Mapping)
            // Target Keys: Name, RollNo, Email, Course, Year
            const normalizedRow = {};
            const keys = Object.keys(row);

            keys.forEach(k => {
                const lowerK = k.toLowerCase().trim();
                const val = row[k];

                if (lowerK === 'name' || lowerK === 'student name' || lowerK === 'studentname') normalizedRow['Name'] = val;
                else if (lowerK === 'rollno' || lowerK === 'roll no' || lowerK === 'roll number' || lowerK === 'roll_number' || lowerK === 'roll_no') normalizedRow['RollNo'] = val;
                else if (lowerK === 'email' || lowerK === 'email id' || lowerK === 'emailid') normalizedRow['Email'] = val;
                else if (lowerK === 'course' || lowerK === 'class' || lowerK === 'stream' || lowerK === 'program') normalizedRow['Course'] = val;
                else if (lowerK === 'year' || lowerK === 'batch' || lowerK === 'session') normalizedRow['Year'] = val;
                else normalizedRow[k] = val; // Keep other fields
            });

            const { error, value } = studentSchema.validate(normalizedRow);

            if (error) {
                // If standard validation fails, maybe they mapped incorrectly or missing entirely
                errors.push({ row: i + 2, reason: error.details[0].message + ` (Found keys: ${Object.keys(normalizedRow).join(', ')})`, data: row });
                continue;
            }

            // Check for duplicate in DB
            const existingStudent = await Student.findOne({
                $or: [{ email: value.Email }, { rollNumber: value.RollNo }]
            });

            if (existingStudent) {
                duplicates.push({ row: i + 2, reason: 'Duplicate Email or RollNo', data: row });
                continue;
            }

            // Map Excel columns to DB Schema
            validStudents.push({
                name: value.Name,
                email: value.Email,
                rollNumber: value.RollNo, // Mapping RollNo from Excel to rollNumber in DB
                course: value.Course,
                year: String(value.Year),
                employerId: req.user._id, // Assuming protected route adds req.user
                status: 'Pending',
                certificateId: `CERT-${value.RollNo}-${Date.now()}` // Generate temporary or final unique ID
            });
        }

        // Insert Valid Data
        let insertedCount = 0;
        if (validStudents.length > 0) {
            await Student.insertMany(validStudents);
            insertedCount = validStudents.length;
        }

        res.status(200).json({
            success: true,
            totalRows: data.length,
            inserted: insertedCount,
            failed: errors.length + duplicates.length,
            errors: [...errors, ...duplicates]
        });

    } catch (err) {
        console.error('Upload Error:', err);
        res.status(500).json({ success: false, message: 'Server Error processing file' });
    }
};



exports.getStudents = async (req, res) => {
    try {
        const students = await Student.find({ employerId: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: students.length, data: students });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error fetching students' });
    }
};

exports.createStudent = async (req, res) => {
    try {
        const { name, email, course, year, grade, rollNumber } = req.body;

        // Basic validation
        if (!name || !email || !course) {
            return res.status(400).json({ success: false, message: 'Name, Email and Course are required' });
        }

        // Check for duplicates
        const existingStudent = await Student.findOne({
            $or: [{ email: email }, { rollNumber: rollNumber || 'N/A' }] // Handle optional rollNumber
        });

        if (existingStudent && existingStudent.employerId.toString() === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'Student with this email already exists' });
        }

        // Generate pseudo-rollNumber if missing for uniqueness checks later or use timestamp
        const rNo = rollNumber || `MAN-${Date.now()}`;

        const student = await Student.create({
            name,
            email,
            rollNumber: rNo,
            course,
            year,
            grade, // Optional field
            employerId: req.user._id,
            status: 'Pending',
            certificateId: `CERT-${rNo}-${Date.now()}`
        });

        res.status(201).json({ success: true, data: student });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error creating student' });
    }
};

exports.deleteStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        // Ensure user owns this record
        if (student.employerId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        // Note: Mongoose v6+ uses .deleteOne() or .findByIdAndDelete(), but .remove() is common in older codebases. 
        // Using findByIdAndDelete is safer directly.
        await Student.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, message: 'Student deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error deleting student' });
    }
};

exports.downloadTemplate = async (req, res) => {
    try {
        const wb = xlsx.utils.book_new();
        const wsData = [
            ['Name', 'RollNo', 'Email', 'Course', 'Year'],
            ['John Doe', '12345', 'john@example.com', 'B.Tech', '2026'] // Sample Row
        ];
        const ws = xlsx.utils.aoa_to_sheet(wsData);
        xlsx.utils.book_append_sheet(wb, ws, 'Template');

        const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

        res.set('Content-Disposition', 'attachment; filename="student_upload_template.xlsx"');
        res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Could not generate template' });
    }
};


