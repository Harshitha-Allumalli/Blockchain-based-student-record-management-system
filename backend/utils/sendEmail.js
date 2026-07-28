const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    try {
        console.log("========== SMTP Configuration ==========");
        console.log("SMTP_HOST:", process.env.SMTP_HOST);
        console.log("SMTP_PORT:", process.env.SMTP_PORT);
        console.log("SMTP_USER:", process.env.SMTP_USER);
        console.log("========================================");

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: false, // Use true only with port 465
            requireTLS: true,

            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },

            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 10000,

            tls: {
                rejectUnauthorized: false
            }
        });

        // Verify SMTP connection
        await transporter.verify();
        console.log("✅ SMTP connection verified successfully.");

        const mailOptions = {
            from: '"BlockEdu" <harshithaallumalli004@gmail.com>',
            to: options.email,
            subject: options.subject,
            text: options.message,
        };

        const info = await transporter.sendMail(mailOptions);

        console.log("✅ Email sent successfully.");
        console.log("Message ID:", info.messageId);

        return info;

    } catch (err) {
        console.error("❌ Email Error:");
        console.error(err);

        throw err;
    }
};

module.exports = sendEmail;
