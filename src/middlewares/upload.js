const multer = require('multer');

// Dùng diskStorage cho file âm thanh (cần file vật lý cho Whisper)
const diskUpload = multer({ dest: 'uploads/' });

// Dùng memoryStorage cho hình ảnh (Base64 xử lý trên RAM nhanh hơn)
const memoryUpload = multer({ storage: multer.memoryStorage() });

module.exports = { diskUpload, memoryUpload };