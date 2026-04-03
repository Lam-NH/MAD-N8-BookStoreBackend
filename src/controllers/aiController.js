const { GoogleGenerativeAI } = require('@google/generative-ai');
const supabase = require('../config/supabase');
const fs = require('fs');

// Khởi tạo Google Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Sử dụng mô hình Gemini 1.5 Flash siêu tốc độ và miễn phí
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

const aiController = {
  // --------------------------------------------------------
  // 1. TÌM KIẾM BẰNG GIỌNG NÓI (Voice Search)
  // --------------------------------------------------------
  searchByVoice: async (req, res) => {
    try {
      if (!req.file) throw new Error("Không tìm thấy file âm thanh!");

      // Đọc file âm thanh từ dạng vật lý sang chuỗi Base64
      const audioData = Buffer.from(fs.readFileSync(req.file.path)).toString("base64");
      const mimeType = req.file.mimetype; // VD: audio/mp4, audio/wav

      // Xóa file tạm ngay lập tức để nhẹ server
      fs.unlinkSync(req.file.path);

      const prompt = "Hãy nghe đoạn âm thanh này và chuyển nó thành văn bản. Chỉ trả về đúng câu nói đó, không thêm bất kỳ từ ngữ nào khác, không dùng dấu ngoặc kép.";
      
      const audioPart = {
        inlineData: { data: audioData, mimeType }
      };

      // Gửi cả Text (prompt) và Audio lên Gemini
      const result = await model.generateContent([prompt, audioPart]);
      const keyword = result.response.text().trim();

      // Dùng văn bản dịch được để tìm sách
      const { data: books, error } = await supabase
        .from('Book')
        .select('*, BookImages(imageURL)')
        .ilike('title', `%${keyword}%`);

      if (error) throw error;

      res.status(200).json({ recognizedText: keyword, results: books });
    } catch (error) {
      // Nhớ xóa file tạm nếu có lỗi xảy ra
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      res.status(500).json({ error: error.message });
    }
  },

  // --------------------------------------------------------
  // 2. TÌM KIẾM BẰNG HÌNH ẢNH (Image Search)
  // --------------------------------------------------------
  searchByImage: async (req, res) => {
    try {
      if (!req.file) throw new Error("Không tìm thấy file hình ảnh!");

      // Lấy chuỗi Base64 trực tiếp từ RAM (do dùng memoryStorage ở middleware)
      const base64Image = req.file.buffer.toString('base64');
      const mimeType = req.file.mimetype; // VD: image/jpeg, image/png

      const prompt = "Bạn là hệ thống nhận diện sách. Hãy đọc tên cuốn sách trong bức ảnh này. Chỉ trả về duy nhất một chuỗi là tên sách, không giải thích gì thêm.";
      
      const imagePart = {
        inlineData: { data: base64Image, mimeType }
      };

      const result = await model.generateContent([prompt, imagePart]);
      let bookTitle = result.response.text().trim();

      // Xử lý chuỗi để tìm kiếm SQL hiệu quả hơn (VD: Xóa dấu chấm câu thừa)
      bookTitle = bookTitle.replace(/[\n\r".]/g, '');

      // Truy vấn Database
      const { data: books, error } = await supabase
        .from('Book')
        .select('*, BookImages(imageURL)')
        .ilike('title', `%${bookTitle}%`);

      if (error) throw error;

      res.status(200).json({ ai_detected_title: bookTitle, results: books });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // --------------------------------------------------------
  // 3. CHATBOT RAG TRỢ LÝ ẢO
  // --------------------------------------------------------
  chatbot: async (req, res) => {
    const { userMessage } = req.body;
    
    try {
      // Bước 1: Kéo một số sách từ CSDL lên làm "Kiến thức" cho Bot (Context)
      // Để nâng cao, sau này bạn có thể dùng pgvector thay cho select random
      const { data: contextBooks } = await supabase
        .from('Book')
        .select('title, price, description')
        .limit(5); // Tạm thời lấy 5 cuốn bất kỳ
      
      const booksString = JSON.stringify(contextBooks);

      // Bước 2: Chế tạo Lời nhắc hệ thống (System Prompt) siêu mạnh
      const prompt = `
        BỐI CẢNH: Bạn là một nhân viên tư vấn bán sách cực kỳ nhiệt tình, thân thiện và chuyên nghiệp của ứng dụng Bookstore.
        KHO SÁCH HIỆN CÓ: ${booksString}
        
        NHIỆM VỤ CỦA BẠN: 
        1. Trả lời câu hỏi của khách hàng: "${userMessage}"
        2. Dựa vào tâm trạng hoặc nhu cầu của khách trong câu hỏi, hãy khéo léo giới thiệu sách có trong KHO SÁCH HIỆN CÓ ở trên.
        3. Tuyệt đối không tự bịa ra sách không có trong kho.
        4. Trả lời ngắn gọn, xuống dòng rõ ràng, sử dụng emoji cho sinh động.
      `;

      // Bước 3: Gửi cho Gemini xử lý
      const result = await model.generateContent(prompt);
      const reply = result.response.text();

      res.status(200).json({ reply: reply });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = aiController;
