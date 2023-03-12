
const { json } = require('express');
const sql = require('mssql'); //requerir sql 
const conexion = require('../database/db'); //requerir la conexion a la base de datos



//cconuslta para obtener los datos de la tabla clientes 
 async function getClientes(req, res) {
    try {
    const pool = await conexion(); //conexion a la base de datos
    const result = await pool
    .request()
    .query('SELECT * FROM clientes'); //consulta para obtener los datos de la tabla clientes
    console.log(`Se han encontrado ${result.recordset.length} clientes.`); //mostramos el numero de clientes encontrados
     res.render('clientes', { clientes: result.recordset} );  //renderizamos la vista clientes y enviamos los datos de la consulta en la variable clientes
//imprimimos el resultado de la consulta en la consola  
    console.log(result.recordset);  


    } catch (err) {
      console.error(`Error al buscar los clientes: ${err}`); //mostramos el error en caso de que exista 
      sql.close(); //cerramos la conexion
  } 
 }
  
  // eliminar un cliente por parametro @id  
  async function deleteCliente(req, res) {
    const id = req.params.id;
    try { 
      const pool = await conexion();
     await pool
      .request() 
      .input('id', id)         
      .query('DELETE FROM clientes WHERE id = @id'); 
      console.log(`Se ha eliminado el cliente con ID ${id}.`);
      sql.close();
      res.redirect('/clientes');  
    } catch (err) {
      console.error(`Error al eliminar el cliente con ID ${id}: ${err}`);
      sql.close();
    }
  }

  //consulta par ainsertar un nuevo cliente con parametros @nombre, @RTN, @telefono, @direccion, @fecha 
  async function insertCliente(req, res) { 
    const { nombre, rtn, telefono, direccion, fecha } = req.body; 
    try {
      const pool = await conexion();
       await pool.request()
      .input('Nombre', sql.VarChar, nombre)
      .input('RTN', sql.VarChar, rtn)
      .input('Telefono', sql.Int, telefono)
      .input('Direccion', sql.VarChar, direccion)
      .input('Fecha', sql.Date, fecha)
      .query('INSERT INTO clientes (Nombre, RTN, Telefono, Direccion, fecha) VALUES (@nombre, @rtn, @telefono, @direccion, @fecha)');
      console.log(`Se ha insertado el cliente ${nombre}.`);
      sql.close();
      res.redirect('/clientes');  
    } catch (err) {
      console.error(`Error al insertar el cliente ${nombre}: ${err}`);
      sql.close();
    }   
  }

  //consulta poara actualizar un cliente por parametro @id  
  async function updateCliente(req, res) {
    const id = req.params.id; 
    const { nombre, rtn, telefono, direccion, fecha } = req.body;
    try {
      const pool = await conexion();
      const result = await pool.request()
      .input('id', id)
      .input('Nombre', sql.VarChar, nombre)
      .input('RTN', sql.VarChar, rtn)
      .input('Telefono', sql.Int, telefono)
      .input('Direccion', sql.VarChar, direccion)
      .input('fecha', sql.Date, fecha)
      .query('UPDATE clientes SET Nombre = @nombre, RTN = @rtn, Telefono = @telefono, Direccion = @direccion, fecha = @fecha WHERE id = @id');
      console.log(`Se ha actualizado el cliente con ID ${id}.`);
      res.redirect('/clientes');
      sql.close();
    } catch (err) {
      console.error(`Error al actualizar el cliente con ID ${id}: ${err}`);
      sql.close();
    }

  }

 
  async function editcliente(req, res) {      
    const id = req.params.id;
    try {
      const pool = await conexion();
      const result = await pool.request()
      .input('id', id)
      .query('SELECT * FROM clientes WHERE id = @id');
      var fecha = result.recordset[0].fecha; 
      var fecha2 = fecha.toISOString().slice(0,10); //convertimos la fecha a formato ISO
      result.recordset[0].fecha = fecha2; 

      res.json(result.recordset[0]); //enviamos los datos del cliente en formato json 
      sql.close();
    } catch (err) {
      console.error(`Error al buscar el cliente con ID ${id}: ${err}`);
      sql.close();
    }
  }





module.exports = {getClientes,deleteCliente,insertCliente,updateCliente,editcliente };