const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

// Route for chat completion
router.post('/', chatbotController.getChatResponse);

module.exports = router;
