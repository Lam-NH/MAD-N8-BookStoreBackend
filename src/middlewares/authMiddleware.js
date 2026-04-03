const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Vui lòng đăng nhập để truy cập tính năng này." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bookstore_secret_dev');
    req.user = decoded; // VD: { customerID, email }
    next();
  } catch (error) {
    res.status(401).json({ message: "Phiên đăng nhập đã hết hạn hoặc không hợp lệ." });
  }
};

module.exports = authMiddleware;
