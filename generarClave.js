// funciones.js
const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const PrecioModel = require('./PrecioModel');
const Prestamo = require('./PrestamoModel')
const cors = require('cors');

const authService = express();

authService.use(cors());
authService.use(bodyParser.json());

// Secret key para firmar y verificar tokens (deberías guardar esto de manera segura)
const secretKey = 'NACIONALMDP';

// Función para generar una clave única usando SHA-256
const generarClaveSHA256 = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * @swagger
 * /generar-token:
 *   post:
 *     summary: Genera un token de autenticación.
 *     description: Genera un token de autenticación válido para acceder a rutas protegidas.
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

authService.post('/generar-token', (req, res) => {
  const { usuario, contraseña } = req.body;

  // Verificar credenciales (esto debería ser más seguro en un entorno de producción)
  if (usuario === 'usuario' && contraseña === 'contrasena') {
    // Generar un token con información del usuario
    const token = jwt.sign({ usuario }, secretKey, { expiresIn: '1h' });
    // Generar una clave única para este usuario usando SHA-256
    const claveUnica = generarClaveSHA256(usuario);

    res.json({ token, claveUnica });
  } else {
    res.status(401).json({ error: 'Credenciales incorrectas' });
  }
});

// Middleware para verificar el token en las peticiones
const verificarToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: 'Acceso no autorizado. Falta el token.' });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.usuario = decoded.usuario; // Puedes almacenar información del usuario en req para usarla posteriormente
    next();
  });
};

/**
 * @swagger
 * /calcular-prestamo:
 *   post:
 *     summary: Calcula el monto de préstamo para un material
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idMaterial: 
 *                 type: string
 *               pesoGramos: 
 *                 type: number
 *     responses:
 *       200:
 *         description: Éxito. Devuelve el monto del préstamo.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 montoPrestamo:
 *                   type: number
 *       400:
 *         description: Error de solicitud. Material no válido.
 */
// Ruta protegida con el middleware de autenticación
authService.post('/calcular-prestamo', verificarToken, async (req, res) => {
  try {
    const { idMaterial, pesoGramos } = req.body;

    // Consultar el precio desde MongoDB Atlas
    const precioPorMaterial = await PrecioModel.findOne({ materialId: idMaterial });

    if (!precioPorMaterial) {
      return res.status(400).json({ error: 'Material no encontrado en la base de datos' });
    }

    const precioGramo = precioPorMaterial.precio;
    const montoPrestamo = (pesoGramos * precioGramo) * 0.8;

    // Guardar los datos en MongoDB Atlas
    const nuevoPrestamo = new Prestamo({ idMaterial, pesoGramos, montoPrestamo });
    await nuevoPrestamo.save();

    res.json({ montoPrestamo });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error interno del servidor');
  }
});

const PORT = process.env.PORT || 3000;

const server = authService.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

// Configurando un temporizador para cerrar el servidor después de 10 minutos (ajusta según tus necesidades)
const tiempoDeEjecucionEnMilisegundos = 15 * 60 * 1000; // 15 minutos
setTimeout(() => {
  server.close(() => {
    console.log('Servidor cerrado después del tiempo de ejecución especificado.');
  });
}, tiempoDeEjecucionEnMilisegundos);

//module.exports = {authService};
module.exports = authService;