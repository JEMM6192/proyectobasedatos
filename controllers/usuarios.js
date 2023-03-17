
const { json } = require('express');
const sql = require('mssql'); //requerir sql 
const conexion = require('../database/db'); //requerir la conexion a la base de datos
const bcrypt = require('bcrypt');

//consulta para registrar un nuevo usuario con nombredeusuario contraseña y rol y encriptar la contraseña   
const insertUsuario = async (req, res) => {
    const { nombre_usuario, contraseña, rol, id_cliente, id_empleado} = req.body;
    try {
      const pool = await conexion();
      const hash = await bcrypt.hash(contraseña, 10); // generar hash de la contraseña
      
      let query;
      if(rol === 'Cliente') {
        query = 'INSERT INTO Usuarios (nombre_usuario, contraseña, rol, id_cliente) VALUES (@nombre_usuario, @contraseña, @rol, @id_cliente)';
      } else if(rol === 'Empleado') {
        query = 'INSERT INTO Usuarios (nombre_usuario, contraseña, rol, id_empleado) VALUES (@nombre_usuario, @contraseña, @rol, @id_empleado)';
      } else {
        query = 'INSERT INTO Usuarios (nombre_usuario, contraseña, rol) VALUES (@nombre_usuario, @contraseña, @rol)';
      }
      
      await pool.request() // ejecutar la consulta
        .input('nombre_usuario', sql.VarChar, nombre_usuario)
        .input('contraseña', sql.VarChar, hash) // usar la contraseña cifrada
        .input('rol', sql.VarChar, rol)
        .input('id_cliente', sql.Int, id_cliente)
        .input('id_empleado', sql.Int, id_empleado)
        .query(query);
      res.redirect('/login');
    } catch(error) {
      res.status(500);
      res.send(error.message);
    }
  }

  const login = async (req, res) => {
    const { nombre_usuario, contraseña } = req.body;
    try {
      const pool = await conexion();
      const result = await pool.request()
        .input('nombre_usuario', sql.VarChar, nombre_usuario)
        .query('SELECT * FROM usuarios WHERE nombre_usuario = @nombre_usuario');
      if(result.recordset.length === 0) { // si no hay resultados
        res.status(401);
        res.send('Usuario no encontrado'); 
      } else { // si hay resultados
        const user = result.recordset[0]; // obtener el primer resultado
        const match = await bcrypt.compare(contraseña, user.contraseña); // comparar la contraseña con el hash almacenado
        if(!match) { // si no coinciden
          res.status(401);
          res.send('Contraseña incorrecta');
        } else { // si coinciden
          switch(user.rol) { // redireccionar según el rol
            case 'Administrador':
              res.redirect('/index');
              break;
            case 'Cliente':
              res.redirect('/manteninmientoclientes');
              break;
            case 'Empleado':
              res.redirect('/manteninmientoEmpleados');
              break;
            default:
              res.send('Rol no válido');
              break;
          }
        }
      }
    } catch(error) {
      res.status(500);
      res.send(error.message);
    }
  }

  
  





//exportar las funciones    
module.exports = { insertUsuario ,login};