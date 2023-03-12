const express = require('express')
const router = express.Router()
//requerir sql
const sql = require('mssql')   
const multer=require('multer');


//requerir la conexion a la base de datos

const clientesadmin = require('../controllers/clientes')
const vehiculosadmin = require('../controllers/vehiculos')
const empleadosadmin = require('../controllers/empleados')
const mantenimientosadmin = require('../controllers/mantenimientos')
const indexadmin = require('../controllers/index')
const uploadimage = require('../controllers/subirimagen')



router.use('/Imagenes', express.static('Imagenes')); 


router.get('/cliente', (req, res)=>{
    res.redirect('/clientes')  
})





router.get('/clientes', clientesadmin.getClientes)  //ruta para mostrar los clientes
router.get('/eliminarcliente/:id', clientesadmin.deleteCliente) //ruta para eliminar un cliente por parametro @id
router.post('/insertarcliente', clientesadmin.insertCliente) //ruta para insertar un nuevo cliente      
router.post('/actualizarcliente/:id', clientesadmin.updateCliente) //ruta para actualizar un cliente por parametro @id
router.get('/editarcliente/:id', clientesadmin.editcliente) //ruta para editar un cliente por parametro @id

router.get('/vehiculos', vehiculosadmin.getVehiculos)  //ruta para mostrar los vehiculos
router.post('/insertarvehiculo', vehiculosadmin.insertVehiculo) //ruta para insertar un nuevo vehiculo
router.get('/eliminarvehiculo/:id', vehiculosadmin.deleteVehiculo) //ruta para eliminar un vehiculo por parametro @id
router.get('/editarvehiculo/:id', vehiculosadmin.editVehiculo) //ruta para editar un vehiculo por parametro @id
router.post('/actualizarvehiculo/:id', vehiculosadmin.updateVehiculo) //ruta para actualizar un vehiculo por parametro @id


router.get('/empleados', empleadosadmin.getEmpleados)  //ruta para mostrar los empleados
router.get('/editarEmpleado/:id', empleadosadmin.editEmpleado) //ruta para editar un empleado por parametro @id
router.post('/insertarEmpleado', empleadosadmin.insertEmpleado) //ruta para insertar un nuevo empleado
router.get('/eliminarEmpleado/:id', empleadosadmin.deleteEmpleado) //ruta para eliminar un empleado por parametro @id
router.post('/actualizarEmpleado/:id', empleadosadmin.updateEmpleado) //ruta para actualizar un empleado por parametro @id


router.get('/mantenimientos', mantenimientosadmin.getMantenimientos)  //ruta para mostrar los mantenimientos
router.post('/insertarMantenimiento',uploadimage(), mantenimientosadmin.insertMantenimiento) //ruta para insertar un nuevo mantenimiento
router.get('/eliminarMantenimiento/:id', mantenimientosadmin.deleteMantenimiento) //ruta para eliminar un mantenimiento por parametro @id
router.get('/editarMantenimiento/:id', mantenimientosadmin.editMantenimiento) //ruta para editar un mantenimiento por parametro @id
router.post('/actualizarMantenimiento/:id', mantenimientosadmin.updateMantenimiento) //ruta para actualizar un mantenimiento por parametro @id

router.get('/',  indexadmin.getDashboard)  //ruta para tener el conteo de registros y los manteniemientos en progreso



module.exports = router;