const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Ambil token dari header Authorization
  let token = req.header('Authorization')?.replace('Bearer ', '');
  
  // Bersihkan tanda kutip jika tidak sengaja terselip dari frontend
  if (token) {
    token = token.replace(/'/g, "").trim();
  }

  // Jika token kosong setelah dibersihkan
  if (!token) {
    return res.status(401).json({ message: 'Akses ditolak, token tidak ditemukan' });
  }

  try {
    // Verifikasi token menggunakan secret key dari .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Simpan data user hasil decode ke object request (req.user)
    req.user = decoded;
    
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token tidak valid atau telah kedaluwarsa' });
  }
};