const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

exports.generateCertificate = async (student) => {
    try {
        const templatePath = path.join(__dirname, 'certificateTemplate.html');
        let htmlContent = fs.readFileSync(templatePath, 'utf8');

        // Replace placeholders
        htmlContent = htmlContent.replace('{{name}}', student.name);
        htmlContent = htmlContent.replace('{{course}}', student.course);
        htmlContent = htmlContent.replace('{{date}}', new Date().toLocaleDateString());
        htmlContent = htmlContent.replace('{{certificateId}}', student.certificateId);

        // Calculate output path
        const fileName = `${student.certificateId}.pdf`;
        const outputDir = path.join(__dirname, '../public/certificates');

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const outputPath = path.join(outputDir, fileName);

        // Generate PDF
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        await page.pdf({
            path: outputPath,
            format: 'A4',
            landscape: true,
            printBackground: true
        });

        await browser.close();

        // Return the public URL
        return `/certificates/${fileName}`;

    } catch (err) {
        console.error('PDF Generation Error:', err);
        throw err;
    }
};
