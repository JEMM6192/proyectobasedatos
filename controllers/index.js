
const { json } = require('express');
const sql = require('mssql'); 
const conexion = require('../database/db'); 

//funcion para contar los registros de la tabla mantenimientos, la cantidad de clientes, la cantidad de vehiculos y la cantidad de empleados y los mantenimientos en progreso
const getDashboard = async (req, res) => {
    try {
        const pool = await conexion();
        const [mantenimientosResult, clientesResult, vehiculosResult, empleadosResult,  EnprogresoResult] = await Promise.all([
            pool.request().query("SELECT COUNT(*) AS mantenimientos FROM mantenimientos"),
            pool.request().query("SELECT COUNT(*) AS clientes FROM clientes"),
            pool.request().query("SELECT COUNT(*) AS vehiculos FROM vehiculos"),
            pool.request().query("SELECT COUNT(*) AS empleados FROM empleados"),
            pool.request().query("SELECT mantenimientos.FotoRuta, vehiculos.Marca FROM vehiculos  JOIN mantenimientos ON vehiculos.id_vehiculo = mantenimientos.id_Vehiculo WHERE mantenimientos.Estado = 'En progreso'"),
        ]);
        const mantenimientos = mantenimientosResult.recordset;
        const clientes = clientesResult.recordset;
        const vehiculos = vehiculosResult.recordset;
        const empleados = empleadosResult.recordset;
        const Enprogreso = EnprogresoResult.recordset;
        res.render('index', {mantenimientos, clientes, vehiculos, empleados, Enprogreso});
      
        console.log(`Se han encontrado ${EnprogresoResult.recordset.length} mantenimientos en progreso.`);
        

    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};

//exportar las funciones
module.exports = { getDashboard }   