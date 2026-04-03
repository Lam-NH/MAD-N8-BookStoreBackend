const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { diskUpload, memoryUpload } = require('../middlewares/upload');

router.post('/voice-search', diskUpload.single('audio'), aiController.searchByVoice);
router.post('/image-search', memoryUpload.single('image'), aiController.searchByImage);
router.post('/chatbot', aiController.chatbot);

module.exports = router;