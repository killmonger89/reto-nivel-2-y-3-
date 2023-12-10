
const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const bodyParser = require('body-parser');
const axios = require('axios');
const mongoose = require('mongoose');
const PrecioModel = require('./PrecioModel');
const authService = require('./generarClave');
const Prestamo = require('./PrestamoModel')
const app = express();
// Conectar a MongoDB Atlas (reemplaza la URL con tus propias credenciales)
mongoose.connect('mongodb+srv://cenmrc:Cesar1989@cluster0.i4b3eia.mongodb.net/PreciosxMaterial?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

/**
 * @swagger
 * /generar-token:
 *   post:
 *     summary: Llamada al endpoint '/generar-token' del servicio de autenticación.
 *     description: Realiza una solicitud para generar un token de autenticación.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               usuario:
 *                 type: string
 *               contraseña:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token generado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 claveUnica:
 *                   type: string
 *       401:
 *         description: Credenciales incorrectas.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */


axios.post('http://localhost:3000/generar-token', {
  usuario: 'usuario',
  contraseña: 'contrasena',
})
  .then(response => {
    const { token, claveUnica } = response.data;
    axios.defaults.headers.common['Authorization'] = token;
    console.log('Token:', token);
    console.log('Clave única:', claveUnica);

    const valoresIniciales = [
      { materialId: '001', precio: 1500.00 },
      { materialId: '002', precio: 1000.00 },
      { materialId: '003', precio: 800.00 },
      { materialId: '004', precio: 500.00 },
      { materialId: '005', precio: 300.00 },
      { materialId: '006', precio: 200.00 },
      { materialId: '007', precio: 100.00 },
    ];

    // Insertar valores iniciales en la base de datos
Prestamo.insertMany(valoresInicialesPrestamos, (err) => {
  if (err) {
    console.error('Error al insertar valores iniciales de préstamos:', err);
  } else {
    console.log('Valores iniciales de préstamos insertados en la base de datos.');
  }
  });

    axios.post('http://localhost:3000/calcular-prestamo', {
      idMaterial: '001',
      pesoGramos: 5,
    })
      .then(response => {
        const { montoPrestamo } = response.data;
        console.log('Monto del préstamo:', montoPrestamo);
      })
      .catch(error => {
        console.error('Error al llamar a la ruta protegida:', error.message);
      });
  })
  .catch(error => {
    console.error('Error al llamar al endpoint:', error.message);
  });


  const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'NMPVal API',
        version: '1.0.0',
        description: 'Documentación de la API para NMPVal',
      },
    },
    apis: ['./generarClave.js', './PrestamoModel.js', './PrecioModel.js'],  // Ruta de archivos a documentar
  };
  
  const specs = swaggerJsdoc(options);
  authService.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

 
