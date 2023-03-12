
const { json } = require('express');
const sql = require('mssql'); //requerir sql 
const conexion = require('../database/db'); //requerir la conexion a la base de datos

//consulta para mostrar los empleados
async function getEmpleados(req, res) {
    try {
    const pool = await conexion(); //conexion a la base de datos
    const result = await pool
    .request()
    .query('SELECT * FROM empleados'); //consulta para obtener los datos de la tabla empleados
    console.log(`Se han encontrado ${result.recordset.length} empleados.`); 
    res.render('empleados', { empleados: result.recordset } ); 
    } catch (err) {
        console.error(`Error al buscar los empleados: ${err}`); 
        sql.close(); //cerramos la conexion
    }
}
//editar datos de un empleado por parametro @id y mandarlo en un json
async function editEmpleado(req, res) {
    const id_empleado= req.params.id;
    try {
    const pool = await conexion(); //conexion a la base de datos
    const result = await pool
    .request() 
    .input('id_empleado', id_empleado)   
    .query('SELECT * FROM empleados WHERE id_empleado = @id_empleado'); //consulta para obtener los datos de un empleado por parametro @id
    console.log(`Se ha encontrado el empleado con id ${id_empleado}`); //mo
    
    let  fecha_nacimiento = result.recordset[0].fecha_nacimiento; //obtenemos la fecha de nacimiento del empleado
    let fecha2 =fecha_nacimiento.toISOString().slice(0,10); //convertimos la fecha a formato ISO
    result.recordset[0].fecha_nacimiento = fecha2; 
    res.json(result.recordset[0]); //enviamos los datos del empleado en un json
    } catch (err) {
        console.error(`Error al buscar el empleado: ${err}`); //mostramos el error en caso de que exista
        sql.close(); //cerramos la conexion
}   
}           

//agregar un nuevo empleado
async function insertEmpleado(req, res) {
    const {nombre, apellido, dni, telefono, direccion, fecha_nacimiento} = req.body; //obtenemos los datos del formulario
    try {
    const pool = await conexion(); 
   await pool.request()
    .input('Nombre', sql.VarChar, nombre) 
    .input('Apellido', sql.VarChar, apellido) 
    .input('DNI', sql.Int, dni) 
    .input('Telefono', sql.Int, telefono) 
    .input('Direccion', sql.VarChar, direccion) 
    .input('fecha_nacimiento', sql.Date, fecha_nacimiento) 
    .query('INSERT INTO empleados (Nombre, Apellido, DNI, Telefono, Direccion, fecha_nacimiento) VALUES (@nombre, @apellido, @dni, @telefono, @direccion, @fecha_nacimiento)'); //consulta para agregar un nuevo empleado
    console.log(`Se ha agregado el empleado ${nombre} ${apellido}`); //mostramos el nombre y apellido del empleado agregado
    res.redirect('/empleados'); 
    } catch (err) {
        console.error(`Error al agregar el empleado: ${err}`); 
        sql.close(); //cerramos la conexion
    }
}

//eliminamos un empleado por parametro @id
async function deleteEmpleado(req, res) {
    const id_empleado = req.params.id;
    try {
    const pool = await conexion();
    await pool.request()
    .input('id_empleado', id_empleado)
    .query('DELETE FROM empleados WHERE id_empleado = @id_empleado'); //consulta para eliminar un empleado por parametro @id
    console.log(`Se ha eliminado el empleado con id ${id_empleado}`); //mostramos el id del empleado eliminado
    res.redirect('/empleados'); //redireccionamos a la pagina de empleados
    } catch (err) {
        console.error(`Error al eliminar el empleado: ${err}`); //mostramos el error en caso de que exista
        sql.close(); //cerramos la conexion
    }
}

//actualizamos los datos de un empleado por parametro @id
async function updateEmpleado(req, res) {
    const id_empleado = req.params.id;
    const {nombre, apellido, dni, telefono, direccion, fecha_nacimiento} = req.body; //obtenemos los datos del formulario
    try {       
    const pool = await conexion();
    await pool.request()
    .input('id_empleado', id_empleado)
    .input('Nombre', sql.VarChar, nombre)
    .input('Apellido', sql.VarChar, apellido)
    .input('DNI', sql.Int, dni)
    .input('Telefono', sql.Int, telefono)
    .input('Direccion', sql.VarChar, direccion)
    .input('fecha_nacimiento', sql.Date, fecha_nacimiento)
    .query('UPDATE empleados SET Nombre = @nombre, Apellido = @apellido, DNI = @dni, Telefono = @telefono, Direccion = @direccion, fecha_nacimiento = @fecha_nacimiento WHERE id_empleado = @id_empleado'); //consulta para actualizar los datos de un empleado por parametro @id
    console.log(`Se ha actualizado el empleado con id ${id_empleado}`); //mostramos el id del empleado actualizado
    res.redirect('/empleados'); //redireccionamos a la pagina de empleados
    } catch (err) {
        console.error(`Error al actualizar el empleado id ${id_empleado}: ${err}`); //mostramos el error en caso de que exista
        sql.close(); //cerramos la conexion
    }
}

//funcion para contar los empleados
async function countEmpleados(req, res) {
    try {
    const pool = await conexion();  
    const result = await pool
    .request()  
    .query('SELECT COUNT(*) FROM empleados'); //consulta para contar los empleados
    console.log(`Se han encontrado ${result.recordset[0].count} empleados.`); //mostramos la cantidad de empleados
    res.json(result.recordset[0].count); //enviamos la cantidad de empleados en un json
    } catch (err) {
        console.error(`Error al buscar los empleados: ${err}`); //mostramos el error en caso de que exista
        sql.close(); 
    }
}





module.exports = {getEmpleados, editEmpleado, insertEmpleado, deleteEmpleado, updateEmpleado, countEmpleados};
