const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    tanggal: String,
    barang: String,
    stage: String,
    in: Number,
    out: Number
});

module.exports = mongoose.model('User', UserSchema);