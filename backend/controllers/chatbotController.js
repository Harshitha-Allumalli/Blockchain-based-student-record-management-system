const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");

const systemInstruction = `You are an AI Assistant for the 'Blockchain-Based Student Record Management System' (BlockEdu).
Your primary role is to:
1. Answer user questions about this project.
2. Explain blockchain concepts in simple language (e.g., Smart Contracts, SHA-256 hashing, Ethereum, Ganache, MetaMask, Truffle, Solidity, Web3.js, MongoDB).
3. Guide users on how to use the application.
   - Admins: Guide them on adding student records.
   - Students: Guide them on viewing and downloading their records.
   - Verifiers: Guide them on verifying certificates.
4. Answer FAQs related to the project.
5. Provide step-by-step guidance when users face errors.
6. Respond in clear, simple English, but you may also provide Telugu support if the user asks for it or writes in Telugu.
7. You must ONLY answer questions related to this project, blockchain, and related technologies. Do not answer off-topic questions.
8. Do not mention that you are an AI developed by Google. You are a custom assistant for BlockEdu.
`;

const getChatResponse = async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: "Gemini API key is missing. Please configure GEMINI_API_KEY in the backend .env file." });
        }

        const model = genAI.getGenerativeModel({ 
            model: "gemini-flash-latest",
            systemInstruction: systemInstruction 
        });

        // Format history for Gemini API
        // Gemini expects: { role: "user" | "model", parts: [{ text: "..." }] }
        const formattedHistory = (history || []).map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        const chat = model.startChat({
            history: formattedHistory,
        });

        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        res.status(200).json({ response: responseText });
    } catch (error) {
        console.error("Chatbot API Error:", error);
        res.status(500).json({ error: "Failed to fetch response from AI Assistant.", details: error.message });
    }
};

module.exports = {
    getChatResponse
};
