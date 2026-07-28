const axios = require("axios");

const sendEmail = async (options) => {
    try {
        const response = await axios.post(
            "https://api.brevo.com/v3/smtp/email",
            {
                sender: {
                    name: "BlockEdu",
                    email: "harshithaallumalli004@gmail.com" // Must be a verified sender in Brevo
                },
                to: [
                    {
                        email: options.email
                    }
                ],
                subject: options.subject,
                textContent: options.message
            },
            {
                headers: {
                    "api-key": process.env.BREVO_API_KEY,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("✅ Email sent successfully");
        console.log(response.data);
    } catch (err) {
        console.error("❌ Brevo API Error:");
        if (err.response) {
            console.error(err.response.data);
        } else {
            console.error(err.message);
        }
        throw err;
    }
};

module.exports = sendEmail;
