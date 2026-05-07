const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  nama: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'operator'], default: 'operator' }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);