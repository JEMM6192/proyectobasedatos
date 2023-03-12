const multer=require('multer'); // Importamos multer
 
function uploadimage(){
    const storage = multer.diskStorage({ 
        destination: 'Imagenes', // Ruta donde se guardan los archivos
        filename: (req, file, cb)=>{ // Nombre del archivo 
            let nuevonombre = file.originalname.replace(/\s/g, ''); // Eliminamos los espacios en blanco
            let nombreCortado = nuevonombre.split('.')[0];//obtyene el nombre del archivo antes del punto
            let extencion = nuevonombre.slice(nuevonombre.lastIndexOf('.')); // Obtenemos la extención del archivo
            cb(null, nombreCortado + '-' + Date.now() + extencion); // Guardamos el archivo con el nombre original y le concatenamos la fecha actual
        }
    })

    const upload = multer({storage: storage}).single('foto'); // Nombre del campo del formulario 
    return upload; // Retornamos la función upload
}

module.exports = uploadimage; 