module.exports = (...roles) => {
  return (req, res, next) => {
    // Pastikan req.user sudah diisi oleh middleware auth sebelumnya
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: 'Akses ditolak, token tidak valid atau user tidak teridentifikasi' });
    }

    // Periksa apakah role user termasuk dalam role yang diizinkan
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Akses ditolak, role tidak sesuai' });
    }

    next();
  };
};