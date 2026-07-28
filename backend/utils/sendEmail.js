const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create a test account if no credentials are provided
    let transporter;
    
    if (process.env.SMTP_HOST) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    } else if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        // Simple Gmail fallback
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: {
                rejectUnauthorized: false,
            },
            family: 4
        });
    } else {
        // Fallback to console log for demo mode
        transporter = {
            sendMail: async (mailOptions) => {
                console.log('\n====================================================');
                console.log('✉️  DEMO EMAIL SENT (No SMTP Configured in .env)');
                console.log('To:      ', mailOptions.to);
                console.log('Subject: ', mailOptions.subject);
                console.log('----------------------------------------------------');
                console.log(mailOptions.text);
                console.log('====================================================\n');
            }
        };
    }

    const mailOptions = {
        from: `BlockEdu <${process.env.EMAIL_USER || 'noreply@blockedu.com'}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (err) {
        console.error('📧 Email Error:', err.message);
        throw err;
    }
};

module.exports = sendEmail;
