import http from 'http';
import url from 'url';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';
import { dirname } from 'path';
import express from 'express';
import cors from 'cors';
import multer from 'multer';

import {getFrames, getFramesbyId, insertarFrame, getImgbyId, getImgbyTitulo} from './funciones_sql.js';

import ffmpegStatic from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import { type } from 'os';
ffmpeg.setFfmpegPath(ffmpegStatic);


const app = express();
const origin = ""

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


app.get('/notes', async (req,res) => {
    const notes = await getFrames()
    console.log("base de datos: " + notes);
    res.send(notes);
});

app.get('/notes/:id', async (req,res) => {
    const id = req.params.id
    const notes = await getFramesbyId(id)
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

    const frame = insertarFrame(id_rand,"animacion_insert", inBase64Format);
    console.log("base de datos actualizada: " + frame);

    
    
});

app.get('/creavideo', async (req,res) => {
    const id = req.params.id
    const notes = await getImgbyTitulo("animacion_insert");
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
