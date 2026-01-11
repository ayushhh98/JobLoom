const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
    // Use Gmail Service
    // IMPORTANT: You must use an "App Password" if you have 2-Factor Authentication enabled.
    // 1. Go to Google Account > Security > 2-Step Verification > App passwords
    // 2. Generate a new password and paste it below.
    const transporter = nodemailer.createTransport({
        pool: true,
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // use TLS
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        },
    });

    // Send email
    try {
        const info = await transporter.sendMail({
            from: '"JobLoom Support" <noreply@jobloom.com>',
            to: options.email,
            subject: options.subject,
            text: options.message, // Plain-text version
            html: options.html,    // HTML version
        });

        console.log("Email sent: %s", info.messageId);
    } catch (error) {
        console.error("Error sending email:", error);
        // Fallback: Log the content so you can still verify in dev
        console.log("--------------------------------");
        console.log("FALLBACK EMAIL LOG:");
        console.log("To:", options.email);
        console.log("Message:", options.message);
        console.log("--------------------------------");
    }
};

module.exports = sendEmail;