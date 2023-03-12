
const { json } = require('express');
const sql = require('mssql'); //requerir sql 
const conexion = require('../database/db'); //requerir la conexion a la base de datos

//cconuslta para obtener los datos de la tabla vehiculos
async function getVehiculos(req, res) {
    try {
        const pool = await conexion(); //conexion a la base de datos
        const result = await pool
        .request()
        .query('SELECT * FROM vehiculos'); //consulta para obtener los datos de la tabla vehiculos
        console.log(`Se han encontrado ${result.recordset.length} vehiculos.`); //mostramos el numero de vehiculos encontrados
        res.render('vehiculos', { vehiculos: result.recordset });  //renderizamos la vista vehiculos y enviamos los datos de la consulta en la variable vehiculos
        //imprimimos el resultado de la consulta en la consola  
        console.log(result.recordset);
    } catch (err) {
        console.error(`Error al buscar los vehiculos: ${err}`); //mostramos el error en caso de que exista 
        sql.close(); //cerramos la conexion
    }
    }   

    //funcion para insertar un nuevo vehiculo
    async function insertVehiculo(req, res) {
    const { id_cliente, marca, modelo,anio, tipo_vehiculo, color, placa, motor} = req.body;
   
    try {
        const pool = await conexion(); //conexion a la base de datos
        await pool.request()
        .input('id_cliente', sql.Int, id_cliente)
        .input('Marca', sql.VarChar, marca)
        .input('Modelo', sql.VarChar, modelo)
        .input('Anio', sql.Int, anio)
        .input('Tipo_vehiculo', sql.VarChar, tipo_vehiculo) 
        .input('Color', sql.VarChar, color)
        .input('Placa', sql.VarChar, placa)
        .input('Motor', sql.VarChar, motor)
        .query('INSERT INTO vehiculos (id_cliente, Marca, Modelo, Anio, Tipo_vehiculo, Color, Placa, Motor) VALUES (@id_cliente, @marca, @modelo, @anio, @tipo_vehiculo, @color, @placa, @motor)'); //consulta para insertar un nuevo vehiculo
        console.log(`Se ha insertado un nuevo vehiculo.`); //mostramos el numero de vehiculos encontrados
        res.redirect('/vehiculos');  
    } catch (err) { 
        console.error(`Error al insertar el vehiculo: ${err}`); //mostramos el error en caso de que exista  
        sql.close();  
    }
    }

    //funcion para eliminar un vehiculo por parametro @id
    async function deleteVehiculo(req, res) {       
    const id_vehiculo = req.params.id;
    console.log(id_vehiculo );  
    try {
        const pool = await conexion(); //conexion a la base de datos
        await pool   
        .request()
        .input('id_vehiculo', id_vehiculo)
        .query('DELETE FROM vehiculos WHERE id_vehiculo = @id_vehiculo'); //consulta para eliminar un vehiculo por parametro @id
        console.log(`Se ha eliminado el vehiculo con id: ${id_vehiculo}`); //mostramos el numero de vehiculos encontrados
        res.redirect('/vehiculos');  //redireccionamos a la vista vehiculos 

    } catch (err) {
        console.error(`Error al eliminar el vehiculo: ${err}`); //mostramos el error en caso de que exista
        sql.close(); //cerramos la conexion
    }
    }

    //funcion para editar un vehiculo por parametro @id
    async function editVehiculo(req, res) {
    const id_vehiculo = req.params.id; 
    try {
        const pool = await conexion(); //conexion a la base de datos
        const result = await pool   
        .request()
        .input('id_vehiculo', id_vehiculo)
        .query('SELECT * FROM vehiculos WHERE id_vehiculo = @id_vehiculo'); 
        res.json(result.recordset[0]);  //enviamos los datos de la consulta en formato json
    } catch (err) {
        console.error(`Error al buscar vehiculo ${id_vehiculo} : ${err}`); //mostramos el error en caso de que exista        
        sql.close(); //cerramos la conexion
    }
    }   

//actualizamos los datos de un vehiculo por parametro @id
    async function updateVehiculo(req, res) {
    const id_vehiculo = req.params.id;  
    const { id_cliente, marca, modelo,anio, tipo_vehiculo, color, placa, motor} = req.body;
    try {
        const pool = await conexion(); //conexion a la base de datos
        await pool
        .request()
        .input('id_vehiculo', id_vehiculo)
        .input('id_cliente', sql.Int, id_cliente)
        .input('Marca', sql.VarChar, marca)
        .input('Modelo', sql.VarChar, modelo)
        .input('Anio', sql.Int, anio)
        .input('Tipo_vehiculo', sql.VarChar, tipo_vehiculo)
        .input('Color', sql.VarChar, color)
        .input('Placa', sql.VarChar, placa)
        .input('Motor', sql.VarChar, motor)
        .query('UPDATE vehiculos SET id_cliente = @id_cliente, Marca = @marca, Modelo = @modelo, Anio = @anio, Tipo_vehiculo = @tipo_vehiculo, Color = @color, Placa = @placa, Motor = @motor WHERE id_vehiculo = @id_vehiculo'); 
        console.log(`Se ha actualizado el vehiculo con id: ${id_vehiculo}`); //mostramos el numero de vehiculos encontrados
        res.redirect('/vehiculos');  //redireccionamos a la vista vehiculos
    } catch (err) {
        console.error(`Error al actualizar el vehiculo ${id_vehiculo} : ${err}`); //mostramos el error en caso de que exista
        sql.close(); 
    
    }
}



    //exportamos las funciones para poder usarlas en otros archivos
    module.exports = {getVehiculos, insertVehiculo, deleteVehiculo, editVehiculo,updateVehiculo}