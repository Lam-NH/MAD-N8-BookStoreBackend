const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'bookstore_secret_dev';

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const authController = {
  register: async (req, res) => {
    const { email, password, confirmPassword } = req.body;
    if (password !== confirmPassword) return res.status(400).json({ message: "Mật khẩu xác nhận không khớp" });

    try {
      const { data: existingUser } = await supabase.from('Customer').select('customerID').eq('email', email).maybeSingle();
      if (existingUser) return res.status(400).json({ message: "Email đã được sử dụng" });

      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Khắc phục lỗi Sequence ID của Postgres bằng cách tự tạo ID tự tăng
      const { data: maxIdRecord } = await supabase.from('Customer')
        .select('customerID')
        .order('customerID', { ascending: false })
        .limit(1)
        .maybeSingle();
      const newCustomerId = (maxIdRecord && maxIdRecord.customerID) ? maxIdRecord.customerID + 1 : 1;

      const { data: newUser, error } = await supabase.from('Customer')
        .insert([{ customerID: newCustomerId, email, password: hashedPassword, fullName: email.split('@')[0], joinDay: new Date(), phoneNumber: "" }])
        .select().single();
      if (error) throw error;

      // Sinh OTP
      const otpCode = generateOTP();
      const expiredAt = new Date(Date.now() + 5 * 60000); // 5 mins
      await supabase.from('OTP').insert([{ otpCode, idCustomer: newUser.customerID, expiredAt }]);

      console.log(`[MÔ PHỎNG EMAIL TỚI ${email}] Mã OTP xác nhận đăng ký của bạn là: ${otpCode}`);

      res.status(201).json({ message: "Đăng ký thành công. Đã gửi OTP vào email." });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  login: async (req, res) => {
    const { email, password } = req.body;
    try {
      const { data: user } = await supabase.from('Customer').select('*').eq('email', email).maybeSingle();
      if (!user) return res.status(400).json({ message: "Email hoặc mật khẩu không đúng" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: "Email hoặc mật khẩu không đúng" });

      const token = jwt.sign({ customerID: user.customerID, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      res.status(200).json({ 
        message: "Đăng nhập thành công", 
        token, 
        user: { customerID: user.customerID, email: user.email, fullName: user.fullName } 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  forgotPassword: async (req, res) => {
    const { email } = req.body;
    try {
      const { data: user } = await supabase.from('Customer').select('customerID').eq('email', email).maybeSingle();
      if (!user) return res.status(404).json({ message: "Không tìm thấy email này" });

      const otpCode = generateOTP();
      const expiredAt = new Date(Date.now() + 5 * 60000);
      await supabase.from('OTP').insert([{ otpCode, idCustomer: user.customerID, expiredAt }]);

      console.log(`[MÔ PHỎNG EMAIL TỚI ${email}] Mã OTP khôi phục mật khẩu của bạn là: ${otpCode}`);
      
      res.status(200).json({ message: "Mã OTP đã được gửi đến email của bạn" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  verifyOtp: async (req, res) => {
    const { email, otpCode } = req.body;
    try {
      const { data: user } = await supabase.from('Customer').select('customerID').eq('email', email).maybeSingle();
      if (!user) return res.status(404).json({ message: "Email không tồn tại" });

      const { data: otpRecords, error } = await supabase.from('OTP')
        .select('*')
        .eq('idCustomer', user.customerID)
        .order('expiredAt', { ascending: false })
        .limit(1);

      if (error || !otpRecords || otpRecords.length === 0) return res.status(400).json({ message: "Không tìm thấy mã OTP" });
      
      const latestOtp = otpRecords[0];
      if (latestOtp.otpCode !== otpCode) return res.status(400).json({ message: "Mã OTP không chính xác" });
      if (new Date(latestOtp.expiredAt) < new Date()) return res.status(400).json({ message: "Mã OTP đã hết hạn" });

      // Trả về một mã token ngắn hạn để sử dụng cho lần đổi pass kế tiếp (Flow Quên mật khẩu)
      const resetToken = jwt.sign({ customerID: user.customerID, email, isReset: true }, JWT_SECRET, { expiresIn: '15m' });

      res.status(200).json({ message: "Xác thực OTP thành công", resetToken });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  changePassword: async (req, res) => {
    const { oldPassword, newPassword, confirmPassword, resetToken } = req.body;
    if (newPassword !== confirmPassword) return res.status(400).json({ message: "Mật khẩu xác nhận không khớp" });

    try {
      let customerId;
      if (resetToken) {
        // Luồng đổi pass từ Quên Mật Khẩu (Đã verify OTP trước đó)
        const decoded = jwt.verify(resetToken, JWT_SECRET);
        if (!decoded.isReset) return res.status(400).json({ message: "Token không hợp lệ để đổi mật khẩu" });
        customerId = decoded.customerID;
      } else {
        // Luồng đổi pass khi đang đăng nhập (Trong trang cá nhân Profile)
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ message: "Vui lòng đăng nhập để đổi mật khẩu" });
        
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        customerId = decoded.customerID;

        const { data: user } = await supabase.from('Customer').select('password').eq('customerID', customerId).single();
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: "Mật khẩu cũ không chính xác" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await supabase.from('Customer').update({ password: hashedPassword }).eq('customerID', customerId);

      res.status(200).json({ message: "Cập nhật mật khẩu thành công!" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = authController;