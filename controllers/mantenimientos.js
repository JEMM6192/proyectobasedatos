
const { json } = require('express');
const sql = require('mssql');
const conexion = require('../database/db'); 
const fs = require('fs');
//obtener los mantenimientos de la base de datos y los empleados
const getMantenimientos = async (req, res) => {
    id_Registro = req.params.id;
    try {

        const pool = await conexion();
        const [mantenimientosResult, empleadosResult, proximomantenimientoresult ] = await Promise.all([
            pool.request().query("SELECT * FROM mantenimientos"),
            pool.request().query("SELECT * FROM empleados"),
            pool.request().query("SELECT mantenimientos.FotoRuta, vehiculos.Marca, mantenimientos.Proximo_Mantenimiento FROM vehiculos  JOIN mantenimientos ON vehiculos.id_vehiculo = mantenimientos.id_Vehiculo"),

          ]);
       const mantenimientos = mantenimientosResult.recordset;
      {
       for (let i = 0; i < mantenimientos.length; i++) {
        mantenimientos[i].Fecha_Ingreso = mantenimientos[i].Fecha_Ingreso.toISOString().slice(0, 10);
        mantenimientos[i].Fecha_Salida = mantenimientos[i].Fecha_Salida.toISOString().slice(0, 10);
        mantenimientos[i].Proximo_Mantenimiento= mantenimientos[i].Proximo_Mantenimiento.toISOString().slice(0, 10);
       mantenimientos[i].Cambio_Repuesto = mantenimientos[i].Cambio_Repuesto.toISOString().slice(0, 10);
       }
        const empleados = empleadosResult.recordset;
        const proximomantenimiento = proximomantenimientoresult.recordset;
      
        res.render('mantenimientos', {mantenimientos, empleados, proximomantenimiento});
      }
    }catch(error) {
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
    const id_registro = req.params.id;
    
    try {
      const pool = await conexion();
      const result = await pool.request()
        .input('id_Registro', id_registro)
        .query('SELECT FotoRuta FROM mantenimientos WHERE id_Registro = @id_registro');
      const fotoRuta = result.recordset[0].FotoRuta; // Obtener la ruta de la imagen del mantenimiento a eliminar
      console.log(fotoRuta);
      fs.unlinkSync(fotoRuta); // Eliminar la imagen del servidor mediante su ruta 
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

  //funcion para extraer el mantenimiento por id y mostrarlo en el formulario 
  const editMantenimiento = async (req, res) => {
    const id_registro = req.params.id;
    try {
      const pool = await conexion(); 
      const result = await pool.request()
        .input('id_Registro', id_registro)
        .query('SELECT * FROM mantenimientos WHERE id_Registro = @id_Registro');
      const mantenimiento = result.recordset[0];  
      
      //obtenemos las fechas de los mantenimientos y convertirlas a formato ISO
      result.recordset[0].Fecha_Ingreso = result.recordset[0].Fecha_Ingreso.toISOString().slice(0,10);
      result.recordset[0].Fecha_Salida = result.recordset[0].Fecha_Salida.toISOString().slice(0,10);
      result.recordset[0].Proximo_Mantenimiento = result.recordset[0].Proximo_Mantenimiento.toISOString().slice(0,10);
      result.recordset[0].Cambio_Repuesto = result.recordset[0].Cambio_Repuesto.toISOString().slice(0,10);
    //enviarlos en un json
      res.json(mantenimiento);
    } catch (error) {
      res.send(error.message);
      console.log(error.message);
    }
  }




  //funcion para actualizar el mantenimiento
  const updateMantenimiento = async (req, res) => {
    const { id_cliente,id_empleado,id_vehiculo, tipo_mantenimiento,descripcion_servicio,fecha_ingreso, fecha_salida,estado, proximo_mantenimiento, cambio_repuesto} = req.body;
    const id_registro = req.params.id;
    try {
      const pool = await conexion();
      await pool.request()
      .input('id_Registro',id_registro)
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
        .query('UPDATE mantenimientos SET id_cliente = @id_cliente, id_Empleado = @id_empleado, id_Vehiculo = @id_vehiculo, Tipo_Mantenimiento = @tipo_mantenimiento, Descripcion_Servicio = @descripcion_servicio, Fecha_Ingreso = @fecha_ingreso, Fecha_Salida = @fecha_salida, Estado = @estado, Proximo_Mantenimiento = @proximo_mantenimiento, Cambio_Repuesto = @cambio_repuesto WHERE id_Registro = @id_registro');
      res.redirect('/mantenimientos');
      console.log("mantenimiento actualizado");
    }catch(error) {
      res.send(error.message);    
      console.log(error.message);
    }
  }

  //actualizar solo la imagen del mantenimiento medinate el id en switalert2
  const updateFoto = async (req, res) => {
    const { fotoNombre, fotoRuta } = req.body;
    const id_registro = req.params.id;
    try {
      const pool = await conexion();
      await pool.request()
        .input('id_Registro', id_registro)
        .input('FotoNombre', sql.VarChar, fotoNombre)
        .input('FotoRuta', sql.VarChar, fotoRuta)
        .query('UPDATE mantenimientos SET FotoNombre = @fotoNombre, FotoRuta = @fotoRuta WHERE id_Registro = @id_registro');
      res.redirect('/mantenimientos');
      console.log("mantenimiento actualizado"); 
    } catch (error) {
      res.send(error.message);
      console.log(error.message);
    }
  }

  //funcion para obtener los mantenimientos de un cliente en especifico mediante el id del cliente
  const getMantenimientocliente = async (req, res) => {
    //obtenr la id pasada por la url
    const id = req.params.id;
    try {
      const pool = await conexion();
      const [mantenimientosResult, infousuario] = await Promise.all([
        pool.request().input('id_cliente', id).query('SELECT * FROM mantenimientos WHERE id_cliente = @id_cliente'),
        pool.request().input('id_usuario', id).query('SELECT nombre_usuario FROM usuarios WHERE id_usuario = @id_usuario'), 
      ]);
      const mantenimiento = mantenimientosResult.recordset;
      const usuario = infousuario.recordset[0];
      console.log(usuario);
      res.render('mantenimientosclientes', { mantenimiento, usuario});
    } catch (error) {
      res.send(error.message);
      console.log(error.message);
    }
  }




//exportar las funciones
module.exports = { getMantenimientos ,insertMantenimiento, editMantenimiento, updateMantenimiento , deleteMantenimiento,updateFoto,getMantenimientocliente}
