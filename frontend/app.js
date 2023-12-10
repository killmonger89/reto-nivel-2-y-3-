// Archivo app.js (frontend/app.js)

// Archivo app.js (frontend/app.js)

let token; // Variable global para almacenar el token

function generarToken() {
    return fetch('http://localhost:3000/generar-token', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        usuario: 'usuario',
        contraseña: 'contrasena',
      }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.token) {
          token = data.token; // Almacena el token globalmente
          console.log('Token generado:', token);
          console.log('Clave única:', data.claveUnica);
        } else {
          console.error('Error al generar token:', data.error);
        }
      })
      .catch(error => {
        console.error('Error al generar token:', error);
      });
  }
  
  function calcularPrestamo() {
    // Si no hay un token almacenado, generarlo automáticamente
    if (!token) {
      console.log('Generando token automáticamente...');
      generarToken().then(() => {
        console.log('Token generado. Llamando a calcular-préstamo...');
        llamarCalcularPrestamo();
      });
    } else {
      console.log('Token ya almacenado. Llamando a calcular-préstamo...');
      // Si ya hay un token almacenado, llamar directamente a calcular-prestamo
      llamarCalcularPrestamo();
    }
  }

function llamarCalcularPrestamo() {
  // Obtenemos los valores ingresados por el usuario
  const idMaterial = document.getElementById('idMaterial').value;
  const pesoGramos = document.getElementById('pesoGramos').value;

  // Verificamos que se hayan ingresado valores
  if (!idMaterial || !pesoGramos) {
    console.error('Por favor, complete todos los campos.');
    return;
  }

  // Ahora, puedes usar el token global en la solicitud calcular-préstamo
  fetch('http://localhost:3000/calcular-prestamo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${token}`, // Usa el token almacenado
    },
    body: JSON.stringify({
      idMaterial,
      pesoGramos: parseInt(pesoGramos), // Convertir a número
    }),
  })
    .then(response => response.json())
    .then(data => {
      console.log('Monto del préstamo:', data.montoPrestamo);
       if (data.montoPrestamo == undefined){
        document.getElementById('montoPrestamo').value = 'Material no Registrado';
      }else{
        document.getElementById('montoPrestamo').value = data.montoPrestamo;
      }
    })
    .catch(error => {
      console.error('Error al calcular préstamo:', error);
    });
}

