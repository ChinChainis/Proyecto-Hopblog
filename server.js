import http from 'http';
import url from 'url';
import { fileURLToPath } from 'url';
import fs, { readFile } from 'fs';
import path from 'path';
import { dirname } from 'path';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import session from 'express-session';


import {getFrames, getFramesbyId, insertarFrame, getUsuario, insertaVideo, getImgbyTitulo, getVidbyAutor, getVidbyUrl} from './funciones_sql.js';

import ffmpegStatic from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import { type } from 'os';
ffmpeg.setFfmpegPath(ffmpegStatic);


const app = express();
const origin = "";
var router = express.Router();

//CORS
//https://es.stackoverflow.com/questions/618761/error-de-cors-en-nodejs-con-react
//https://mufazmi.medium.com/solving-cors-issues-in-your-node-js-application-836506e63871
/*const corsOptions = {
    credentials: true,
    origin: ['http://127.0.0.1:3000/'] // Whitelist the domains you want to allow
};

app.use(cors(corsOptions)); // Use the cors middleware with your options
*/
app.use(cors());

function loginRequired(req, res, next) {
  if (!req.session.passport || !req.session.passport.user)
    return res.status(401).json({status: 'Please log in'});
  return next();
}



const upload = multer({dest: 'frames/'})

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//const staticPath = path.join(__dirname,'../views');

//app.use(express.static(staticPath));

var portname = '127.0.0.1';
var port = '3000';

app.set('views', path.join(__dirname, 'views'));
app.set('view engine','ejs');
//si usamos pug, sustituye ejs por pug

app.use(express.static(path.join(__dirname,'public')));
app.use( express.json() ); // <== Make sure we can handle JSON data from the client


app.use(session({
    secret : '12345689',//clave cualquiera
    resave : true,
    saveUninitialized : true
}));

app.get('/seguridad',(req,res) => {
    res.render('seguridad',{session: req.session});
    /*req.session.usuario = "Antonio";
    req.session.rol = "Admin";
    req.session.visitas = req.session.visitas ? ++req.session.visitas : 1 ;

    res.send(`el usuario <strong>${req.session.usuario}</strong> de rango 
        <strong>${req.session.rol}</strong> ha visitado 
        <strong>${req.session.visitas}</strong> veces.` );*/
});

app.get('/seguridadresul',(req,res) => {
    console.log(req.session);
    res.render('index', { session : req.session });
});

app.post('/login', express.urlencoded({ extended: false }),async (req,res) =>{
    var user_mail_address = req.body.user_email;
    var user_password = req.body.user_password;
    console.log("fueraaa",user_mail_address );
    if(user_mail_address && user_password){
        //console.log("aaaa",user_mail_address);
        //res.redirect("/");
        const notes = await getUsuario(user_mail_address);
        //console.log("contrasenia: ",notes[0].contrasenia);

        console.log(notes);
        if(notes.length > 0){
            if( user_password == notes[0].contrasenia ){
                req.session.user_email = notes[0].nick ;
                res.redirect('seguridad');
            }else{
                console.log("contraseña incorrecta");
                res.redirect('seguridad');
            }
            
        }else{
            console.log("usuario incorrecto");
            res.redirect('seguridad');
        }
    }else{
        res.send('introduce mail y contraseña');
        res.end();
    }

});

app.get('/logout',function(request,response,next){
    request.session.destroy();
    response.redirect("seguridad");
})


var contador = null

app.get('/',(req,res) => {
    contador = 0
    //console.log("index cargado");
    //res.status(200);
    //res.sendFile(__dirname + "/" + "styles.css");
    res.render('index');
    //podríamos enviar variables al html si hacemos res.render('index', {text: "World"}) y luego en el html Hello <%= text %>
    //res.sendFile(path.join(__dirname,'/index.html'));
});

app.get('/muestra', async (req,res) => {
    /*fs.readFile( 
        "./videoV2.mp4", 'base64', 
        (err, base64Image) => { 
            // 2. Create a data URL 
            const dataUrl = `data:video/mp4;base64, ${base64Image}` 
            return res.send('<video width="320" height="240" controls> <source src=${dataUrl} type="video/mp4"> Your browser does not support the video tag. </video>'); 
        } 
    ); */
    res.render('preview');

});

app.get('/muestra2', async (req,res) => {
    const images = await fs.promises.readdir('public/vids')
    /*      <a href="/">Home</a>
        ${images.map(i=>`<video width="320" height="240" controls> <source src="/videoV2.mp4" type="video/mp4">
            Your browser does not support the video tag.
        </video> `)}*/
    //ojo con href, si queremos usar estilo css quitamos el public/css, usamos directamente la carpeta  

    //        <h1>Hi User, Welcome ${session.user_email} </h1>


    console.log("vidreos: " + images);
    //vidreos: video.mp4,video6ago.mp4,videoV2.mp4,videoV3.mp4
    //let notes = await getVidbyUrl("./" + images[2]); //es el de pos 2
    //console.log("resul: " + JSON.stringify(notes[0]["id"]));

    for (let i = 0; i < images.length; i++) {
        let nomv =images[i];
        if(nomv == "videoV2.mp4"){
            let notes = await getVidbyUrl("./" + nomv); //es el de pos 2
            console.log("resul: " + JSON.stringify(notes[0]["id"]));
        }
    }

    if(req.session.user_email){
        const HTML_ARCH = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
            <link href="/css/style.css" type="text/css" rel="stylesheet">
            <!--esto resuelve la falta de favicon ico-->
            <link rel="shortcut icon" href="#">
        </head>
        <body>
            <h2>Animaciones</h2>
            <div class="indice">
                <a href="/">Inicio </a>
                <a href="/seguridad">Perfil </a>
                <a href="">Usuarios</a> 
                <a href="/muestra2">Galería</a> 
            </div>



            ${images.map(i=>`<video width="320" height="240" controls>            
                <source src="/vids/${i}" type="video/mp4">
                Your browser does not support the video tag.
            </video> `).join('') }

        </body>
        </html>
        `
        return res.send(HTML_ARCH);
    }else{
        console.log("EEEEEEEEEEEEEEEE LOGEATE");
        res.redirect('seguridad');
    }

});

app.get('/preview', async (req,res) => {
    var name = 'Frogberto2.mp4';
    res.render('preenviado', {name:name});

});





app.get('/bajavideo', async (req,res) => {
    const id = req.params.id
    const notes = await getVidbyAutor("prueba");
    console.log("base de datos: " + JSON.stringify(notes).split(':"').pop().slice('',-3));
    let urltemp = JSON.stringify(notes).split(':"').pop().slice('',-3);

    const head = {
        'Content-Type': 'video/mp4',
    };

    /*res.writeHead(200, head);
    fs.createReadStream(urltemp).pipe(res);*/
    const bitmap = fs.readFileSync(urltemp);
    const buf = new Buffer(bitmap);
    fs.writeFile('./pruebaVod.mp4', buf,function(err) {
        console.log(err);
    });
    //console.log("base de datos: " + Buffer.from(notes, 'binary').toString('base64'));

    /*
    const buf = new Buffer(notes);
    //let vid = base64Image.split(';base64,').pop();
    
    //res.setHeader('Content-Length', myFile.length);
    res.write(buf, 'binary');
   
    //var buf = notes.toString('base64');
    /*fs.writeFile('./pruebaVod.mp4', buf,function(err) {
        console.log(err);
    });*/

});

app.get('/video', async (req,res) => {
    //res.render('preview');
    const videoPath = './videoV2.mp4'; // Path to your video file
    const bitmap = fs.readFileSync(videoPath);
    const buf = new Buffer(bitmap);
    let id_rand = Math.floor(Math.random() * (10000 - 1000) + 1000);
    const vid = insertaVideo(id_rand,"prueba", videoPath);
    //console.log("base de datos actualizada: " + buf);

    //const file = fs.createReadStream(videoPath).pipe(res);
    /*const readimagem = fs.readFileSync(videoPath);
    const imagemBase64 = Buffer.from(readimagem).toString('base64');
    console.log("archivo: " + JSON.stringify(imagemBase64));
    let stringy = JSON.stringify(imagemBase64)*/
    /*let id_rand = Math.floor(Math.random() * (10000 - 1000) + 1000);
    let bitmap = fs.readFileSync(videoPath, {encoding: 'base64'});*/
    /*let buf = new Buffer(bitmap);
    var file = new Blob(
        [buf],
        {"type" : "video\/mp4"});
    var bufferBase64 = new Buffer( file, 'binary' ).toString('base64');*/
    //const vid = insertaVideo(id_rand,"prueba", bitmap);
    //console.log("base de datos actualizada: " + vid);


    /*const videoPath = './videoV2.mp4'; // Path to your video file
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = end - start + 1;
        const file = fs.createReadStream(videoPath, { start, end });
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': 'video/mp4',
        };

        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
        };

        res.writeHead(200, head);
        fs.createReadStream(videoPath).pipe(res);
    }    */
});


app.get('/notes', async (req,res) => {
    const foldPath = './borrar';

    fs.readdir(foldPath, function(err, files) {
    const txtFiles = files.filter(el => path.extname(el) === '.png');
    console.log(txtFiles);
        for (let i = 0; i < txtFiles.length; i++) {
            let filePath = foldPath + "/" + txtFiles[i];
            console.log(filePath);
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error(`Error removing file: ${err}`);
                    return;
                }

                console.log(`File ${filePath} has been successfully removed.`);
            });
        }
    })
    /*
    fs.unlink(filePath, (err) => {
    if (err) {
        console.error(`Error removing file: ${err}`);
        return;
    }

    console.log(`File ${filePath} has been successfully removed.`);
    });*/
    /*const notes = await getFrames()
    console.log("base de datos: " + notes);
    res.send(notes);*/
});

app.get('/notes/:id', async (req,res) => {
    //ej http://127.0.0.1:3000/notes/id:2
    const id = req.params.id
    const notes = await getFramesbyId(id)
    console.log("uaaaaa" + id);
    console.log("base de datos: " + notes);
    res.send(notes);
});

app.post("/frames", upload.single('file'), (req,res)=>{
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', origin);

    console.log("dentro server " + req.body  ); // <== Receives: [ 'A', 42, false ]
    var inBase64Format  = JSON.stringify(req.body )

    console.log("dentro server parte principio " + inBase64Format.slice(1,2)); 
    let numframe = inBase64Format.slice(1,2);

    let base64Image = inBase64Format.split(';base64,').pop();   
    
    //let r = Math.floor((Math.random())*1000)+100;
    let id_rand = Math.random() * (10000 - 1000) + 1000;

    var buff = Buffer.from(base64Image).toString("base64");

    const frame = insertarFrame(id_rand,"animacion_insert_8jul_2", inBase64Format);
    console.log("base de datos actualizada: " + frame);

});


app.post("/frames/:nombre", upload.single('file'), (req,res)=>{
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', origin);

    const nom = req.params.nombre;

    console.log("dentro server " + req.body  ); // <== Receives: [ 'A', 42, false ]
    var inBase64Format  = JSON.stringify(req.body )

    console.log("dentro server parte principio " + inBase64Format.slice(1,2)); 
    let numframe = inBase64Format.slice(1,2);

    let base64Image = inBase64Format.split(';base64,').pop();   
    
    //let r = Math.floor((Math.random())*1000)+100;
    let id_rand = Math.random() * (10000 - 1000) + 1000;

    var buff = Buffer.from(base64Image).toString("base64");

    const frame = insertarFrame(id_rand,nom, inBase64Format);
    console.log("base de datos actualizada: " + frame);

});


app.get('/creavideo', async (req,res) => {
    res.setHeader('Access-Control-Allow-Origin', origin);

    const id = req.params.id
    const notes = await getImgbyTitulo("animacion_insert_8jul_2");
    console.log("base de datos: " + notes.length);
    for (let i = 0; i < notes.length; i++) {
        let numframe = JSON.stringify(notes[i]).slice(11,12);

        let base64Image = JSON.stringify(notes[i]).split(';base64,').pop();
        console.log("BUFF: " + numframe);
        fs.writeFile('./frames2/frame'+numframe+'.png', base64Image, {encoding: 'base64'}, function(err) {
            console.log('File created');
        });
    }

    ffmpeg()

        .input('frames2/frame%01d.png')
        .inputOptions('-framerate', '10')
        .videoCodec('libx264')
        .saveToFile('videoV3.mp4')
        .on('progress', (progress) => {
            if (progress.percent) {
            console.log(`Processing: ${Math.floor(progress.percent)}% done`);
            }
        })
        .on('end', () => {
            console.log('FFmpeg has finished.');
        })
        .on('error', (error) => {
            console.error(error);
        });
    //res.send(notes);
});


app.get('/creavideo/:nombre', async (req,res) => {
    res.setHeader('Access-Control-Allow-Origin', origin);

    const nom = req.params.nombre;
    const notes = await getImgbyTitulo(nom);
    console.log("base de datos: " + notes.length);
    for (let i = 0; i < notes.length; i++) {
        let numframe = JSON.stringify(notes[i]).slice(11,12);

        let base64Image = JSON.stringify(notes[i]).split(';base64,').pop();
        console.log("BUFF: " + numframe);
        fs.writeFile('./frames2/frame'+numframe+'.png', base64Image, {encoding: 'base64'}, function(err) {
            console.log('File created');
        });
    }

    ffmpeg()

        .input('frames2/frame%01d.png')
        .inputOptions('-framerate', '10')
        .videoCodec('libx264')
        .saveToFile(nom+'.mp4')
        .on('progress', (progress) => {
            if (progress.percent) {
            console.log(`Processing: ${Math.floor(progress.percent)}% done`);
            }
        })
        .on('end', () => {
            console.log('FFmpeg has finished.');
        })
        .on('error', (error) => {
            console.error(error);
        });
    //res.send(notes);
});


// Handle POST request from client:
app.post("/frames_ant", upload.single('file'), (req,res)=>{
    console.log("dentro server " + req.body  ); // <== Receives: [ 'A', 42, false ]
    var inBase64Format  = JSON.stringify(req.body )
    //var inBase64Format  = btoa(req.body )
    /*var stringreq = toString(req.body)
    var buff = Buffer.from(inBase64Format).toString("base64");*/
    //console.log("contadoooor : " + contador)
    //contador += 1

    console.log("dentro server parte principio " + inBase64Format.slice(1,2)); 
    let numframe = inBase64Format.slice(1,2);

    let base64Image = inBase64Format.split(';base64,').pop();
    //console.log("BUFF: " + buff)
    //let r = (Math.random() + 1).toString(36).substring(7)
    let r = Math.floor((Math.random())*1000)+100;

    fs.writeFile('./frames2/frame'+numframe+'.png', base64Image, {encoding: 'base64'}, function(err) {
        console.log('File created');
    });
    
    ffmpeg()

    .input('frames2/frame%01d.png')
    .inputOptions('-framerate', '10')
    .videoCodec('libx264')
    .saveToFile('videoV3.mp4')
    .on('progress', (progress) => {
        if (progress.percent) {
        console.log(`Processing: ${Math.floor(progress.percent)}% done`);
        }
    })
    .on('end', () => {
        console.log('FFmpeg has finished.');
    })
    .on('error', (error) => {
        console.error(error);
  });

    res.status(200).json({ received: req.body });
});

app.listen(port, () => {
    console.log("Conectado");
    console.log(`Server is running on server http://${portname}:${port}`);
});
