import mysql from 'mysql2'

import dotenv from 'dotenv'
dotenv.config()

//var file = 'https://img.freepik.com/psd-gratis/primer-plano-caballo-aislado_23-2151388163.jpg?w=360';
var file = './frames2/frame1.png'
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
export async function getFrames() {
    const [rows] = await pool.query("SELECT * FROM frames2")
    return rows
}

const result = await getFrames();

//console.log(result);
/*
export async function getFramesbyId(id) {
  const [rows] = await pool.query(`
    SELECT * 
    FROM frames2
    WHERE id = ?
    `,[id])
  return rows
}

export async function getImgbyId(id) {
  const [rows] = await pool.query(`
    SELECT frame 
    FROM frames2
    WHERE id = ?
    `,[id])
  return rows
}

export async function getImgbyTitulo(titulo) {
  const [rows] = await pool.query(`
    SELECT frame 
    FROM frames2
    WHERE titulo = ?
    `,[titulo])
  return rows
}

export async function insertarFrame(id,titulo,img) {
await pool.query(`
  INSERT INTO frames2(id,titulo,frame)
  VALUES(?,?,?)
  `,[id,titulo,img])  
}*/


export async function getImgIDbyId(id) {
  const [rows] = await pool.query(`
    SELECT frame 
    FROM framesid
    WHERE id_animacion = ?
    `,[id])
  return rows
}

export async function insertarFrameID(id,ida,titulo,img) {
await pool.query(`
  INSERT INTO framesid(id,id_animacion,titulo,frame)
  VALUES(?,?,?,?)
  `,[id,ida,titulo,img])  
}

export async function deleteIMGID(id) {
  const [rows] = await pool.query(`
    DELETE 
    FROM framesid
    WHERE id_animacion = ?
    `,[id])
  return rows
}


/*
export async function insertaVideo(id,au,vid) {
await pool.query(`
  INSERT INTO videos2(id,autor,urlvideo)
  VALUES(?,?,?)
  `,[id,au,vid])  
}

export async function getVidbyUrl(dire) {
  const [rows] = await pool.query(`
    SELECT * 
    FROM videos3
    WHERE urltitulo = ?
    `,[dire])
  return rows
}

export async function getVidbyAutor(aut) {
  const [rows] = await pool.query(`
    SELECT urlvideo 
    FROM videos2
    WHERE autor = ?
    `,[aut])
  return rows
}

export async function insertaVideo3(id,au,vid,et,priv) {
await pool.query(`
  INSERT INTO videos3(id,autor,urltitulo,etiquetas,privado)
  VALUES(?,?,?,?,?)
  `,[id,au,vid,et,priv])  
}

export async function deleteIMG(titl) {
  const [rows] = await pool.query(`
    DELETE 
    FROM frames2
    WHERE titulo = ?
    `,[titl])
  return rows
}

*/
export async function getUsuario(nic) {
  const [rows] = await pool.query(`
    SELECT * 
    FROM usuarios
    WHERE nick = ?
    `,[nic])
  return rows
}

export async function insertaUsuario(nc,ct) {
await pool.query(`
  INSERT INTO usuarios(nick,rol,contrasenia)
  VALUES(?,'usuario',?)
  `,[nc,ct])  
}

export async function insertaVideoID(id,au,vid,et,priv) {
await pool.query(`
  INSERT INTO videosId(id,autor,urltitulo,etiquetas,privado)
  VALUES(?,?,?,?,?)
  `,[id,au,vid,et,priv])  
}

export async function getVidIDbyUrl(dire) {
  const [rows] = await pool.query(`
    SELECT * 
    FROM videosId
    WHERE id = ?
    `,[dire])
  return rows
}

export async function deleteVidIDbyUrl(dire) {
  const [rows] = await pool.query(`
    DELETE 
    FROM videosId
    WHERE id = ?
    `,[dire])
  return rows
}

export async function getTituloIDbyUrl(dire) {
  const [rows] = await pool.query(`
    SELECT urltitulo 
    FROM videosId
    WHERE id = ?
    `,[dire])
  return rows
}

/*
esto es peligroso el usar directamente la variable por el tema de inyección de código a nuestra base de datos
    SELECT * 
    FROM frames
    WHERE id = ${id}
si usamos un valor unique y queremos buscarlo por ese, deberíamos devolver rows[0]
*/

//const frames = await insertarFrame(0,'prueba1',archivo)
//const frames = await getFramesbyId(0)
//console.log("usuario ",0," : ", frames)

/*
export default class Prueba{
  pruebaexpo(){
    console.log("funcion de sql");
  }
}


//module.exports = { pruebaexpo };





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
