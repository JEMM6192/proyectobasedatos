
const sql = require('mssql');


 const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    server: 'localhost', 

    database: process.env.DB_NAME,
    
    
    options: {
      trustServerCertificate: true// change to true for local dev / self-signed certs
      
    }
  } 
 /*  var config = {
    "user": 'JULIO-PC',
    "password": 'password',
    "server": 'JULIO-PC',
    "database": 'prueba',
    "port": 1433, // make sure to change port
    "dialect": "mssql",
    "dialectOptions": {
        "instanceName": "SERVER_ESPEJO"
    }
}; */
//conexion a la base de datos con async await

 const conexion = async () => {          
  try {
    const pool= await sql.connect(config); 
    console.log('Conectado a la base de datos');
    return pool; 
  } catch (err) {
    console.error('Error al conectar a la base de datos:', err);
  }
}

module.exports = conexion;  