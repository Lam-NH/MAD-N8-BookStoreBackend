const supabase = require('../config/supabase');

const checkoutDataController = {
  // Trả về danh sách voucher khả dụng
  getVouchers: async (req, res) => {
    try {
      const currentDate = new Date().toISOString();
      const { data, error } = await supabase.from('Voucher')
        .select('*')
        .gt('usageLimit', 0)
        .gte('expiryDate', currentDate);
        
      if (error) throw error;
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Trả về danh sách phương thức vận chuyển
  getShipments: async (req, res) => {
    try {
      const { data, error } = await supabase.from('Shipment').select('*');
      
      if (error) throw error;
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Kiểm tra tính hợp lệ voucher và trả về số tiền cuối cùng
  validateVoucher: async (req, res) => {
    const { voucherCode, totalAmount } = req.body;
    
    try {
      const { data: voucher, error } = await supabase.from('Voucher')
        .select('*')
        .eq('code', voucherCode)
        .single();
        
      if (error || !voucher) return res.status(404).json({ isValid: false, message: "Voucher không tồn tại" });
      
      if (voucher.usageLimit <= 0) return res.status(400).json({ isValid: false, message: "Voucher đã hết lượt sử dụng" });
      if (new Date(voucher.expiryDate) < new Date()) return res.status(400).json({ isValid: false, message: "Voucher đã hết hạn" });
      if (totalAmount < voucher.minOrderValue) return res.status(400).json({ isValid: false, message: `Đơn hàng chưa đạt giá trị tối thiểu ${voucher.minOrderValue}` });
      
      // Tính toán discount
      let discount = 0;
      if (voucher.type === 'PERCENT') { // Giả định type là 'PERCENT' hoặc 'FIXED'
        discount = (totalAmount * voucher.discountValue) / 100;
      } else {
        discount = voucher.discountValue; 
      }
      
      const finalAmount = Math.max(0, totalAmount - discount);
      
      res.status(200).json({
        isValid: true,
        voucherInfo: voucher,
        originalAmount: totalAmount,
        discountAmount: discount,
        finalAmount: finalAmount
      });
      
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = checkoutDataController;
