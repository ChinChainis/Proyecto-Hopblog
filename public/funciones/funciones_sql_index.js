import mysql from 'mysql2'

import dotenv from 'dotenv'
dotenv.config()

var file = 'https://img.freepik.com/psd-gratis/primer-plano-caballo-aislado_23-2151388163.jpg?w=360';
/*fetch(file)
  .then(function(response) {
    return response.blob()
  })
  .then(function(blob) {
    // here the image is a blob
  });*/





//vamos a usar variables de entorno para que se adapte a la máquina 
// y no gusta codificar directamente esto en el código, además por temas de seguridad oculta información sensible
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB
}).promise()

//al devolver, normalmente la query devuelve el array, así que necesitamos el primer array de datos
//y lo metemos en un async para que no dependa del tiempo de llamada
async function getFrames() {
    const [rows] = await pool.query("SELECT * FROM frames")
    return rows
}

async function getFramesbyId(id) {
    const [rows] = await pool.query(`
      SELECT * 
      FROM frames
      WHERE id = ?
      `,[id])
    return rows
}

async function insertarFrame(id,titulo,img) {
  await pool.query(`
    INSERT INTO frames(id,titulo,frame)
    VALUES(?,?,?)
    `,[id,titulo,img])  
}


document.getElementById('btn-sql').addEventListener("click", function(e) {
  console.log("eooo");
  let downloadLink = document.createElement('a');
  downloadLink.setAttribute('download', 'canvas.png');
  var canvas = document.querySelector('canvas');
  canvas.toBlob(blob => {
    let url = URL.createObjectURL(blob);
    console.log('url: '+url);
    //downloadLink.setAttribute('href', url);
    //downloadLink.click();
  });
});


/*
esto es peligroso el usar directamente la variable por el tema de inyección de código a nuestra base de datos
      SELECT * 
      FROM frames
      WHERE id = ${id}
si usamos un valor unique y queremos buscarlo por ese, deberíamos devolver rows[0]
*/

//const frames = await insertarFrame(0,'prueba1',archivo)
//console.log(frames)

/*
var archivo = null;

fetch(file).then(res => res.blob()).then(blob =>{
  archivo = blob;
  //console.log('archivo: '+archivo.type);
}).then(()=>{
  console.log('archivo '+archivo);
  const frames = insertarFrame(0,'prueba1',archivo)
  //console.log(frames)
});  


console.log('fuera ' + archivo)*/