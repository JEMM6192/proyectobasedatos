
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
          mantenimientos[i].Fecha_Ingreso = mantenimientos[i].Fecha_Ingreso ? mantenimientos[i].Fecha_Ingreso.toISOString().slice(0, 10) : ''; //formato de fecha para que se muestre en el input date del formulario
          mantenimientos[i].Fecha_Salida = mantenimientos[i].Fecha_Salida ? mantenimientos[i].Fecha_Salida.toISOString().slice(0, 10) : '';
          mantenimientos[i].Proximo_Mantenimiento = mantenimientos[i].Proximo_Mantenimiento ? mantenimientos[i].Proximo_Mantenimiento.toISOString().slice(0, 10) : '';
          mantenimientos[i].Cambio_Repuesto = mantenimientos[i].Cambio_Repuesto ? mantenimientos[i].Cambio_Repuesto.toISOString().slice(0, 10) : '';
      }
        const empleados = empleadosResult.recordset;
        const proximomantenimiento = proximomantenimientoresult.recordset;

       
        for (let i = 0; i < proximomantenimiento.length; i++) {
          proximomantenimiento[i].Proximo_Mantenimiento = proximomantenimiento[i].Proximo_Mantenimiento ? proximomantenimiento[i].Proximo_Mantenimiento.toISOString().slice(0, 10) : '';
        }

      
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
    console.log(fecha_salida);
    console.log(fecha_ingreso);

    try {
        const fotoNombre = req.file.originalname.replace(/\s/g, ''); // Eliminar espacios en blanco del nombre de la imagen
        const fotoRuta = req.file.path.replace(/\s/g, ''); // Eliminar espacios en blanco de la ruta de la imagen
        const pool = await conexion();
        await pool.request()
        .input('id_cliente', sql.Int, id_cliente)
        .input('id_Empleado', sql.Int, id_empleado) 
        .input('id_Vehiculo', sql.Int, id_vehiculo)
        .input('Tipo_Mantenimiento', sql.VarChar, tipo_mantenimiento)
        .input('Descripcion_Servicio', sql.VarChar, descripcion_servicio)
        .input('Fecha_Ingreso', sql.Date, fecha_ingreso)
        .input('Fecha_Salida', sql.Date, fecha_salida || null)
        .input('Estado', sql.VarChar, estado)
        .input('Proximo_Mantenimiento', sql.Date, proximo_mantenimiento || null)
        .input('Cambio_Repuesto', sql.Date, cambio_repuesto || null)
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
      mantenimiento.Fecha_Ingreso = mantenimiento.Fecha_Ingreso ? mantenimiento.Fecha_Ingreso.toISOString().slice(0, 10) : '';
      mantenimiento.Fecha_Salida = mantenimiento.Fecha_Salida ? mantenimiento.Fecha_Salida.toISOString().slice(0, 10) : '';
      mantenimiento.Proximo_Mantenimiento = mantenimiento.Proximo_Mantenimiento ? mantenimiento.Proximo_Mantenimiento.toISOString().slice(0, 10) : '';
      mantenimiento.Cambio_Repuesto = mantenimiento.Cambio_Repuesto ? mantenimiento.Cambio_Repuesto.toISOString().slice(0, 10) : '';

   
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
        .input('Fecha_Salida', sql.Date, fecha_salida  || null)
        .input('Estado', sql.VarChar, estado)
        .input('Proximo_Mantenimiento', sql.Date, proximo_mantenimiento || null)
        .input('Cambio_Repuesto', sql.Date, cambio_repuesto || null)
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
  
    const id_registro = req.params.id;
    try {
      const fotoNombre = req.file.originalname.replace(/\s/g, '');
      console.log(fotoNombre); 
      const fotoRuta = req.file.path.replace(/\s/g, '');
      const pool = await conexion();
      await pool.request()
        .input('id_Registro', id_registro)
        .input('FotoNombre', sql.VarChar, fotoNombre)
        .input('FotoRuta', sql.VarChar, fotoRuta)
        .query('UPDATE mantenimientos SET FotoNombre = @fotoNombre, FotoRuta = @fotoRuta WHERE id_Registro = @id_registro');
      console.log("mantenimiento actualizado"); 
    } catch (error) {
      res.send(error.message);
      console.log(error.message);
    }
  }

  //funcion para obtener los mantenimientos de un cliente en especifico y el nombre del usuario   
  const getMantenimientocliente = async (req, res) => {
   
    const id = req.params.id;
    try {
      const pool = await conexion();
      const [mantenimientosResult, infousuario] = await Promise.all([
        pool.request().input('id_cliente', id).query('SELECT * FROM mantenimientos WHERE id_cliente = @id_cliente'),
        pool.request().input('id_cliente', id).query('SELECT nombre_usuario FROM usuarios WHERE id_cliente = @id_cliente'), 
      ]);
      const mantenimiento = mantenimientosResult.recordset;

      //formatear las fechas de los mantenimientos
      mantenimiento.forEach(mantenimiento => {
        mantenimiento.Fecha_Ingreso = mantenimiento.Fecha_Ingreso ? mantenimiento.Fecha_Ingreso.toISOString().slice(0, 10) : '';
        mantenimiento.Fecha_Salida = mantenimiento.Fecha_Salida ? mantenimiento.Fecha_Salida.toISOString().slice(0, 10) : '';
        mantenimiento.Proximo_Mantenimiento = mantenimiento.Proximo_Mantenimiento ? mantenimiento.Proximo_Mantenimiento.toISOString().slice(0, 10) : '';
        mantenimiento.Cambio_Repuesto = mantenimiento.Cambio_Repuesto ? mantenimiento.Cambio_Repuesto.toISOString().slice(0, 10) : '';
      });



      const usuario = infousuario.recordset[0];
      console.log(usuario);
      res.render('mantenimientosclientes', { mantenimiento, usuario});
    } catch (error) {
      res.send(error.message);
      console.log(error.message);
    }
  }

const getMantenimientoEmpleado = async (req, res) => {
    const id = req.params.id;
    try {
      const pool = await conexion();
      const [mantenimientosResult, infousuario] = await Promise.all([
        pool.request().input('id_Empleado', id).query('SELECT * FROM mantenimientos WHERE id_Empleado = @id_Empleado'),
        pool.request().input('id_empleado', id).query('SELECT nombre_usuario FROM usuarios WHERE id_empleado = @id_empleado'),
      ]);
      const mantenimiento = mantenimientosResult.recordset;

      //formatear las fechas de los mantenimientos
      mantenimiento.forEach(mantenimiento => {
        mantenimiento.Fecha_Ingreso = mantenimiento.Fecha_Ingreso ? mantenimiento.Fecha_Ingreso.toISOString().slice(0, 10) : '';
        mantenimiento.Fecha_Salida = mantenimiento.Fecha_Salida ? mantenimiento.Fecha_Salida.toISOString().slice(0, 10) : '';
        mantenimiento.Proximo_Mantenimiento = mantenimiento.Proximo_Mantenimiento ? mantenimiento.Proximo_Mantenimiento.toISOString().slice(0, 10) : '';
        mantenimiento.Cambio_Repuesto = mantenimiento.Cambio_Repuesto ? mantenimiento.Cambio_Repuesto.toISOString().slice(0, 10) : '';
      });



      const usuario = infousuario.recordset[0];
      console.log(usuario);
      res.render('mantenimientosempleados', { mantenimiento, usuario });
    } catch (error) {
      res.send(error.message);
      console.log(error.message);
    }
  }

  const UpdateMantenimientoEmpleado = async (req, res) => {
    const {id_empleado, tipo_mantenimiento, descripcion_servicio, fecha_salida, estado, proximo_mantenimiento, cambio_repuesto } = req.body;
    const id_registro = req.params.id;
    try {
      const pool = await conexion();
      await pool.request()
        .input('id_Registro', id_registro)
        
        .input('Tipo_Mantenimiento', sql.VarChar, tipo_mantenimiento)
        .input('Descripcion_Servicio', sql.VarChar, descripcion_servicio)
        .input('Fecha_Salida', sql.Date, fecha_salida || null)
        .input('Estado', sql.VarChar, estado)
        .input('Proximo_Mantenimiento', sql.Date, proximo_mantenimiento || null)
        .input('Cambio_Repuesto', sql.Date, cambio_repuesto || null)
        .query('UPDATE mantenimientos SET  Tipo_Mantenimiento = @tipo_mantenimiento, Descripcion_Servicio = @descripcion_servicio, Fecha_Salida = @fecha_salida, Estado = @estado, Proximo_Mantenimiento = @proximo_mantenimiento, Cambio_Repuesto = @cambio_repuesto WHERE id_Registro = @id_registro');
      res.redirect('/mantenimientosempleados/'+ id_empleado);
      console.log("mantenimiento actualizado");
    } catch (error) {
      res.send(error.message);
      console.log(error.message);
    }
  }


//exportar las funciones
module.exports = { getMantenimientos ,insertMantenimiento, editMantenimiento, updateMantenimiento , deleteMantenimiento,updateFoto,getMantenimientocliente , getMantenimientoEmpleado, UpdateMantenimientoEmpleado}
