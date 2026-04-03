const supabase = require('../config/supabase');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'bookstore_secret_dev';

const reviewController = {
  // Lấy tất cả comment của cuốn sách
  getReviewsByBook: async (req, res) => {
    const { bookId } = req.params;
    try {
      const { data, error } = await supabase.from('Review')
        .select('*, Customer(fullName)')
        .eq('idBook', bookId)
        .order('reviewID', { ascending: false });
      
      if (error) throw error;
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Gửi đánh giá
  addReview: async (req, res) => {
    const { bookId, rating, comment } = req.body;
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Vui lòng đăng nhập để gửi đánh giá" });
    
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      
      const { error } = await supabase.from('Review')
        .insert([{ idBook: bookId, idCustomer: decoded.customerID, rating, comment }]);
        
      if (error) throw error;
      res.status(201).json({ message: "Đã gửi đánh giá thành công" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};
module.exports = reviewController;
