import http from 'http';
import url from 'url';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';
import { dirname } from 'path';
import express from 'express';
import cors from 'cors';
import multer from 'multer';

//import prueba from './funciones_sql.js';

import ffmpegStatic from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import { type } from 'os';
ffmpeg.setFfmpegPath(ffmpegStatic);


const app = express();
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

// Handle POST request from client:
app.post("/frames", upload.single('file'), (req,res)=>{
    console.log("dentro server " + req.body ); // <== Receives: [ 'A', 42, false ]
    var inBase64Format  = JSON.stringify(req.body )
    //var inBase64Format  = btoa(req.body )
    /*var stringreq = toString(req.body)
    var buff = Buffer.from(inBase64Format).toString("base64");*/
    console.log("contadoooor : " + contador)
    contador += 1
    let base64Image = inBase64Format.split(';base64,').pop();
    //console.log("BUFF: " + buff)
    //let r = (Math.random() + 1).toString(36).substring(7)
    let r = Math.floor((Math.random())*1000)+100;

    fs.writeFile('./frames2/frame_'+contador+'.png', base64Image, {encoding: 'base64'}, function(err) {
        console.log('File created');
    });

    ffmpeg()
    //https://ffmpeg.org/ffmpeg.html
    //ffmpeg -i foo.avi -r 1 -s WxH -f image2 foo-%03d.jpeg
    //same format as c printf https://www.geeksforgeeks.org/c-program-list-files-sub-directories-directory/
    // FFmpeg expects your frames to be named like frame-001.png, frame-002.png, etc.
    .input('frames2/frame_%01d.png')

    // Tell FFmpeg to import the frames at 10 fps
    .inputOptions('-framerate', '10')

    // Use the x264 video codec
    .videoCodec('libx264')

    // Use YUV color space with 4:2:0 chroma subsampling for maximum compatibility with
    // video players
    .outputOptions('-pix_fmt', 'yuv420p')

    // Output file
    .saveToFile('videoV3.mp4')

    // Log the percentage of work completed
    .on('progress', (progress) => {
        if (progress.percent) {
        console.log(`Processing: ${Math.floor(progress.percent)}% done`);
        }
    })

    // The callback that is run when FFmpeg is finished
    .on('end', () => {
        console.log('FFmpeg has finished.');
    })

    // The callback that is run when FFmpeg encountered an error
    .on('error', (error) => {
        console.error(error);
  });



    //fs.writeFileSync("new-path.jpeg", buff);

    /*var jsonContent = JSON.parse(req.body);
    var buff = Buffer.from(jsonContent).toString("base64");*/
    //prueba.pruebaexpo();
    //res.render('index');
    /*var data = req.body.toString() ;
    var datasplit = data.split(',')[1].trim();
    console.log("datasplit: "+datasplit);

    const imageBuffer = Buffer.from(datasplit,'base64');
    console.log("imageBuffer: "+imageBuffer);

    fs.write('frame.png', imageBuffer).then(() => {
        console.log("imagen salvada");
    }).catch((err) => {
        console.log(err);
    });*/

    res.status(200).json({ received: req.body }); // Send back a confirmation response
});

app.listen(port, () => {
    console.log("Conectado");
    console.log(`Server is running on server http://${portname}:${port}`);
});
