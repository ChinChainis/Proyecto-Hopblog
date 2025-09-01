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
import app from './video.js'

import {getImgIDbyId,insertarFrameID} from './funciones_sql.js';

import ffmpegStatic from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import { type } from 'os';
ffmpeg.setFfmpegPath(ffmpegStatic);


//const app = express();
var router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const upload = multer({dest: 'frames/'})
const origin = "";


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



//const staticPath = path.join(__dirname,'../views');

//app.use(express.static(staticPath));

var portname = '0.0.0.0';
var port = process.env.PORT || 3000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine','ejs');
//si usamos pug, sustituye ejs por pug

app.use(express.static(path.join(__dirname,'public')));
app.use( express.json() ); // <== Make sure we can handle JSON data from the client




app.post("/frames/:id/:nombre", upload.single('file'), (req,res)=>{
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', origin);

    const nom = req.params.nombre;
    const id_ani = req.params.id;

    //let variablestr = JSON.stringify(req.body.listf);


    var inBase64Format  = JSON.stringify(req.body )

    let numframe = inBase64Format.slice(1,2);

    let base64Image = inBase64Format.split(';base64,').pop();   
    
    //let r = Math.floor((Math.random())*1000)+100;
    let id_rand = Math.random() * (1000000 - 100000) + 100000;

    var buff = Buffer.from(base64Image).toString("base64");

    const frame = insertarFrameID(id_rand,id_ani,nom, inBase64Format);
    //console.log("base de datos actualizada: " + frame);
    res.end;
});



app.get('/creavideo/:id/:nombre',async (req,res) => {
    res.setHeader('Access-Control-Allow-Origin', origin);
    const foldPath = './frames2';

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
    });



    let id_ani_prev = req.params.id;
    const id_ani = Math.round(id_ani_prev);

    const nom = req.params.nombre;


    const notes = await getImgIDbyId(id_ani);
    console.log("base de datos: " + notes.length);
    for (let i = 0; i < notes.length; i++) {
        let numtemp = JSON.stringify(notes[i]).split(',');
        let numframe = numtemp[0].slice(11,);

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
        .saveToFile('public/vids/'+id_ani+'.mp4')
        .on('progress', (progress) => {
            if (progress.percent) {
            console.log(`Processing: ${Math.floor(progress.percent)}% done`);
            }
        })
        .on('end', () => {
            console.log('FFmpeg con nombre has finished.');
            //res.redirect('/preview/',id_ani,'/',nom);            
        })
        .on('error', (error) => {
            console.error(error);
        });
    //res.render('preenviado');
    //res.send(notes);

});



app.listen(port, () => {
    console.log("Conectado");
    console.log(`Server is running on server http://${portname}:${port}`);
});
