import http from 'http';
import url from 'url';
import fs from 'fs';
import path from 'path';

import ffmpegStatic from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
ffmpeg.setFfmpegPath(ffmpegStatic);


const mimetypes = {
    'html': 'text/html',
    'css': 'text/css',
    'js': 'text/javascript',
    'png': 'image/png',
    'jpeg': 'image/jpeg',
    'jpg': 'image/jpg',
    'video':'video/mp4'
};

var portname = '127.0.0.1';
var port = '3000';

http.createServer((req, res) => {
    //myuri para filtrar url según palabra clave, /video pillar video, probar para llamar funciones de node
    //mapper o controler
    //si la url es http://127.0.0.1:3000/index.html , pilla /index.html
    var myuri = url.parse(req.url).pathname;
    var filename = path.join(process.cwd(), unescape(myuri));
    //al hacerle slice 1, quita la / de /index.html
    console.log("myuri; "+myuri.slice(1));
    //con split lo separamos por el punto, teniendo así la extensión
    let partesuri = myuri.split(".");
    let extension = partesuri[1];
    console.log("extension; "+extension);


    console.log('File you are looking for is:' + filename);
    var loadFile;

    try {
        loadFile = fs.lstatSync(filename);
    } catch (error) {
        res.writeHead(404, {
            "Content-Type": 'text/plain'
        });
        res.write('404 Internal Error');
        res.end();
        return;
    }


    if (loadFile.isFile()) {
        if(extension=='mp4'){
            //http://127.0.0.1:3000/video.mp4
            ffmpeg()

            // FFmpeg expects your frames to be named like frame-001.png, frame-002.png, etc.
            .input('frames/frame%01d.png')

            // Tell FFmpeg to import the frames at 10 fps
            .inputOptions('-framerate', '10')

            // Use the x264 video codec
            .videoCodec('libx264')

            // Use YUV color space with 4:2:0 chroma subsampling for maximum compatibility with
            // video players
            .outputOptions('-pix_fmt', 'yuv420p')

            // Output file
            .saveToFile('video.mp4')

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
  


            let vid = myuri.slice(1);
    
            //salta error si no se puede acceder al archivo
            //crear un video con un id único, en html dar la direccion del video y se descarga ahí
            fs.access(vid,fs.constants.F_OK,err => {
                console.log(`${vid} ${err ? "no existe":"existe"}`);
            });
    
            fs.readFile(vid,function(err,content){
                if(err){
                    res.writeHead(404,{"content-type":"txt/html"});
                    res.end("<h1>No existe video</h1>");
                }else{
                    res.writeHead(200,{"Content-type":"video/mp4"});
                    res.end(content);
                }
            });
        }else try{         //hacemos el try catch para salvar el error de crasheo de cuando intentamos acceder al video de forma bruta en  la url
            var mimeType = mimetypes[path.extname(filename).split('.').reverse()[0]];
            res.writeHead(200, {
                "Content-Type": mimeType
            });
            var filestream = fs.createReadStream(filename);
            filestream.pipe(res);
        } catch (error) {
            res.writeHead(404, {
                "Content-Type": 'text/plain'
            });
            res.write('404 Server Crash');
            res.end();
            return;
        }

        
    } else if (loadFile.isDirectory()) {
        res.writeHead(302, {
            'Location': 'index.html'
        });
        res.end();
    } else {
        res.writeHead(500, {
            "Content-Type": 'text/plain'
        });
        res.write('500 Internal Error');
        res.end();
    }

}).listen(port, portname, () => {
    console.log("Conectado");
    console.log(`Server is running on server http://${portname}:${port}`);
});