const mongoose = require('mongoose');

const precioSchema = new mongoose.Schema({
  codigo: String,
  precio: Number,
});

const PrecioModel = mongoose.model('Precio', precioSchema);

module.exports = PrecioModel;