
const { json } = require('express');
const sql = require('mssql');
const conexion = require('../database/db'); 
const fs = require('fs');
//obtener los mantenimientos de la base de datos y los empleados
const getMantenimientos = async (req, res) => {
    id_Registro = req.params.id;
    try {

        const pool = await conexion();
        const [mantenimientosResult, empleadosResult ] = await Promise.all([
            pool.request().query("SELECT * FROM mantenimientos"),
            pool.request().query("SELECT * FROM empleados"),
          ]);
        const mantenimientos = mantenimientosResult.recordset;
        const empleados = empleadosResult.recordset;
      
        res.render('mantenimientos', {mantenimientos, empleados});
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};

//insertar un nuevo mantenimiento y subir la imagen
const insertMantenimiento = async (req, res) => {
    const { id_cliente,id_empleado,id_vehiculo, tipo_mantenimiento,descripcion_servicio,fecha_ingreso, fecha_salida,estado, proximo_mantenimiento, cambio_repuesto} = req.body;
    
    try {
        const fotoNombre = req.file.originalname.replace(/\s/g, ''); 
        const fotoRuta = req.file.path.replace(/\s/g, '');
        const pool = await conexion();
        await pool.request()
        .input('id_cliente', sql.Int, id_cliente)
        .input('id_Empleado', sql.Int, id_empleado) 
        .input('id_Vehiculo', sql.Int, id_vehiculo)
        .input('Tipo_Mantenimiento', sql.VarChar, tipo_mantenimiento)
        .input('Descripcion_Servicio', sql.VarChar, descripcion_servicio)
        .input('Fecha_Ingreso', sql.Date, fecha_ingreso)
        .input('Fecha_Salida', sql.Date, fecha_salida)
        .input('Estado', sql.VarChar, estado)
        .input('Proximo_Mantenimiento', sql.Date, proximo_mantenimiento)
        .input('Cambio_Repuesto', sql.Date, cambio_repuesto)
        .input('FotoNombre', sql.VarChar, fotoNombre)
        .input('FotoRuta', sql.VarChar, fotoRuta)
        .query('INSERT INTO mantenimientos (id_cliente,id_Empleado,id_Vehiculo,Tipo_Mantenimiento,Descripcion_Servicio,Fecha_Ingreso,Fecha_Salida,Estado,Proximo_Mantenimiento,Cambio_Repuesto,FotoNombre,FotoRuta) VALUES (@id_cliente,@id_empleado,@id_vehiculo,@tipo_mantenimiento,@descripcion_servicio,@fecha_ingreso,@fecha_salida,@estado,@proximo_mantenimiento,@cambio_repuesto,@fotoNombre,@fotoRuta)');
        res.redirect('/mantenimientos');
        console.log("mantenimiento insertado"); 
    } catch (error) {
       res.send(error.message);
       console.log(error.message);
    }
}


//eliminar un mantenimiento y la imagen
const deleteMantenimiento = async (req, res) => {
    console.log("hola");
    const id_registro = req.params.id_Registro;
    console.log(id_registro);
    
    try {
      const pool = await conexion();
      const result = await pool.request()
        .input('id_Registro', id_registro)
        .query('SELECT FotoRuta FROM mantenimientos WHERE id_Registro = @id_registro');
      const fotoRuta = result.recordset[0].FotoRuta; // Obtener la ruta de la imagen del mantenimiento a eliminar
      console.log(fotoRuta);
      fs.unlink(fotoRuta); // Eliminar la imagen del servidor mediante su ruta 
      await pool.request()
        .input('id_Registro', id_registro)
        .query('DELETE FROM mantenimientos WHERE id_Registro = @id_registro');
      res.redirect('/mantenimientos');
      console.log("mantenimiento eliminado"); 
    } catch (error) {
      res.send(error.message);
      console.log(error.message);
    }
  }
//exportar las funciones
module.exports = { getMantenimientos ,insertMantenimiento, deleteMantenimiento}
