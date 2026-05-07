const mongoose = require('mongoose');

const TransaksiSchema = new mongoose.Schema({
  tanggal: String,
  barang: String,
  stage: String,
  in: Number,
  out: Number
}, { timestamps: true });

module.exports = mongoose.model('Transaksi', TransaksiSchema);