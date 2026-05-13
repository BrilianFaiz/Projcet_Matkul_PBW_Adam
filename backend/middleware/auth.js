const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  let token = req.header('Authorization')?.replace('Bearer ', '');
  
  // bersihkan tanda kutip kalau ada
  if (token) token = token.replace(/'/g, "").trim();

  if (!token) {
    return res.status(401).json({ message: 'Akses ditolak, token tidak ada' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token tidak valid' });
  }
};