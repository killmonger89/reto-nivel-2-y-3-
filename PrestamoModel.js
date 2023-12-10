const mongoose = require('mongoose');

const prestamoSchema = new mongoose.Schema({
  idMaterial: String,
  pesoGramos: Number,
});

const Prestamo = mongoose.model('Prestamo', prestamoSchema);

module.exports = Prestamo;