const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  nama: { 
    type: String, 
    required: true 
  },
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: [
      'superadmin',   // 1. Manajemen user & konfigurasi IT
      'admin',        // 2. Kontrol inventaris pusat & validasi data
      'operator',     // 3. Eksekusi input data transaksi lapangan
      'manager',      // 4. Kepala Gudang / Monitoring Laporan
      'procurement',  // 5. Pembelian bahan baku & pantau reorder point
      'qc'            // 6. Quality Control / Pemeriksa barang cacat
    ], 
    default: 'operator' 
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);