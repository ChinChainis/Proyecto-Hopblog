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

import {getImgIDbyId,insertarFrameID,getFramesbyId, deleteIMGID, getUsuario, insertaVideo, insertaVideo3, deleteIMG,getImgbyTitulo, getVidbyAutor, getVidbyUrl} from './funciones_sql.js';

import ffmpegStatic from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import { type } from 'os';
ffmpeg.setFfmpegPath(ffmpegStatic);

const app = express();


const upload = multer({dest: 'frames/'})

app.use(session({
    secret : '12345689',//clave cualquiera
    resave : true,
    saveUninitialized : true
}));




app.get('/test',(req,res) =>{
    res.send({}); //--> expect(response.headers['content-type']).toEqual(expect.stringContaining("json"));
})

app.get('/',(req,res) => {
    res.render('portada');
});

app.get('/canvas',(req,res) => {
    //console.log("index cargado");
    //res.status(200);
    //res.sendFile(__dirname + "/" + "styles.css");
    //res.sendStatus(200); --- OK

    //res.render('index');
    return res.status(200).render('index');
    //podríamos enviar variables al html si hacemos res.render('index', {text: "World"}) y luego en el html Hello <%= text %>
    //res.sendFile(path.join(__dirname,'/index.html'));
});



app.get('/creausuario',(req,res) => {
    res.render('creausuario',{session: req.session});
});

app.post('/creausr', express.urlencoded({ extended: false }),async (req,res) =>{
    var user_mail_address = req.body.user_email;
    var user_password = req.body.user_password;
    console.log("fueraaa",user_mail_address );
    if(user_mail_address && user_password){

        //const notes = await insertaUsuario(user_mail_address,user_password);
        //console.log("contrasenia: ",notes[0].contrasenia);
        const notes = await getUsuario(user_mail_address);

        console.log(notes);
        if(notes.length > 0){
            console.log("Nombre de usuario ya usado");
            res.redirect('/creausuario');
            
        }else{
            const notes2 = await insertaUsuario(user_mail_address,user_password);
            req.session.user_email = user_mail_address;
            res.redirect('/creausuario');
        }
    }else{
        res.send('introduce mail y contraseña');
        res.end();
    }

});



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
    //console.log(req.session);
    res.render('index', { session : req.session });
});

app.post('/login', express.urlencoded({ extended: false }),async (req,res) =>{
    var user_mail_address = req.body.user_email;
    var user_password = req.body.user_password;
    //console.log("fueraaa",user_mail_address );
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


app.get('/muestra3', async (req,res) => {
    const images = await fs.promises.readdir('public/vids')
    let newvidreos = [];
    for (let i = 0; i < images.length; i++) {
        let nomv =images[i];
        let notes = await getVidbyUrl(nomv); 
        if(notes.length > 0){
            let privado = notes[0]["privado"];
            let autoractual = notes[0]["autor"];
            if(privado == 0){
                newvidreos.push(nomv);
            }
            if(privado == 1 && req.session.user_email == autoractual){
                newvidreos.push(nomv);
            }
            //console.log("resul: " + JSON.stringify(notes[0]));
        }
    }
                //<div id='contienevideo'>${i} 
    let HTML_ARCH = `
            ${newvidreos.map(i=>`
                <div id='contienevideo'> 
                    <h3>${i}</h3>
                    <video width="640" height="480" controls>
                    <source src="/vids/${i}" type="video/mp4">
                    Your browser does not support the video tag.
                    </video>
                </div> `).join('') }
        `

    res.render('galeria', {images:HTML_ARCH});

});

app.post('/muestrabusqueda', express.urlencoded({ extended: false }),async (req,res) => {
    let etiquetas = req.body.etiquetasbuscar.split(',');
    const images = await fs.promises.readdir('public/vids')
    let newvidreos = [];
    let videosfiltrados = [];
    for (let i = 0; i < images.length; i++) {
        let nomv =images[i];
        let notes = await getVidbyUrl(nomv); 
        if(notes.length > 0){
            let privado = notes[0]["privado"];
            let autoractual = notes[0]["autor"];

            //console.log("resul: " + JSON.stringify(notes[0]));
            let etiqetasvideo = JSON.stringify(notes[0]["etiquetas"]);
            for (let i = 0; i < etiquetas.length; i++) {
                if(etiqetasvideo.search(etiquetas[i]) != -1){
                    if(privado == 0){
                        videosfiltrados.push(nomv);
                    }
                    if(privado == 1 && req.session.user_email == autoractual){
                        videosfiltrados.push(nomv);
                    }
                }

                if( autoractual == etiquetas[i] ){
                    if(privado == 0){
                        videosfiltrados.push(nomv);
                    }
                }
            };
            //si es privado no se enseña a menos que el autor sea el mismo que el session.user
            //console.log(etiqetasvideo);
            //newvidreos.push(nomv);
        }
    }

    let videosfiltrados2 = videosfiltrados.filter((item, index) => videosfiltrados.indexOf(item) === index);


    let HTML_ARCH = `
            ${videosfiltrados2.map(i=>`
                <span id='contienevideo'> ${i}
                <video width="640" height="480" controls>
                <source src="/vids/${i}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
            </span> `).join('') }
        `

    res.render('galeria', {images:HTML_ARCH});

});


app.get('/usuario/:nombre', async (req,res) => {
    const images = await fs.promises.readdir('public/vids')

    console.log("vidreos: " + images);

    let newvidreos = [];
    for (let i = 0; i < images.length; i++) {
        let nomv =images[i];
        let notes = await getVidbyUrl(nomv); 
        if(notes.length > 0){

           if( notes[0]["autor"] == req.session.user_email ){
                newvidreos.push(nomv);
            }
        }
    }

    if(req.session.user_email){
        let HTML_ARCH = `
                ${newvidreos.map(i=>`
                    <div id='contienevideo'>${i}          
                    <video width="640" height="480" controls>
                    <source src="/vids/${i}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
                </div> `).join('') }
            `

        res.render('galeria', {images:HTML_ARCH});
    }else{
        console.log("EEEEEEEEEEEEEEEE LOGEATE");
        res.redirect('/seguridad');
    }

});

app.get('/preview/:id/:nombre', async (req,res) => {
    //var name = 'anima2.mp4';
    let name = req.params.nombre + '.mp4';
    let id = Math.round(req.params.id);
    //console.log('dentro preview: ',name);
    res.render('preenviado', {name:name,idanim:id});

});


app.post('/upload', express.urlencoded({ extended: false }),async (req,res) =>{
    var etiquetas = req.body.etiquetas;
    var privado = req.body.privadocheck;
    let listaetiq = etiquetas.split(',');
    let nomvid = req.body.vidname;
    let idvid = req.body.vidid;
    console.log("nombre: ", nomvid);
    console.log("uploadd: ",etiquetas, " privado: ", privado);
    console.log("boton: ",req.body.botonform);
    if(req.body.botonform == 'Subir!'){
        let id_rand = Math.floor(Math.random() * (10000 - 1000) + 1000);

        if(privado!='ok'){
            console.log("no es privado");
            const vid = insertaVideo3(idvid,'Antonio', nomvid,etiquetas,false);
        }else{
            console.log("es privado");
            const vid = insertaVideo3(idvid,'Antonio', nomvid,etiquetas,true);
        }
    }else{
        //let nomog = nomvid.split('.')
        const foldPath = './public/vids';
        let nomvidsolo = nomvid.split('.')[0];
        fs.readdir(foldPath, function(err, files) {

        const txtFiles = files.filter(el => path.dirname(el) === nomvid);
        console.log(txtFiles);
            //for (let i = 0; i < txtFiles.length; i++) {
                let filePath = foldPath + "/" + nomvid;
                console.log("filepath: ",filePath);
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error(`Error removing file: ${err}`);
                        return;
                    }

                    console.log(`File ${filePath} has been successfully removed.`);
                });
            //}
        });
        const vid = deleteIMGID(idvid);
        //console.log(vid);
    }



    res.redirect('/'); //tmp
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

});

app.get('/notes/:id', async (req,res) => {
    //ej http://127.0.0.1:3000/notes/id:2
    const id = req.params.id
    const notes = await getFramesbyId(id)
    console.log("uaaaaa" + id);
    console.log("base de datos: " + notes);
    res.send(notes);
});



app.post("/frames/:id/:nombre", upload.single('file'), (req,res)=>{
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', origin);

    const nom = req.params.nombre;
    const id_ani = req.params.id;

    console.log("dentro creavideo:" + id_ani);

    console.log("dentro server " + req.body  ); // <== Receives: [ 'A', 42, false ]
    var inBase64Format  = JSON.stringify(req.body )

    console.log("dentro server parte principio " + inBase64Format.slice(1,2)); 
    let numframe = inBase64Format.slice(1,2);

    let base64Image = inBase64Format.split(';base64,').pop();   
    
    //let r = Math.floor((Math.random())*1000)+100;
    let id_rand = Math.random() * (10000 - 1000) + 1000;

    var buff = Buffer.from(base64Image).toString("base64");

    const frame = insertarFrameID(id_rand,id_ani,nom, inBase64Format);
    console.log("base de datos actualizada: " + frame);

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

    console.log("dentro creavideo:" + id_ani);

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
        .saveToFile('public/vids/'+nom+'.mp4')
        .on('progress', (progress) => {
            if (progress.percent) {
            console.log(`Processing: ${Math.floor(progress.percent)}% done`);
            }
        })
        .on('end', () => {
            console.log('FFmpeg con nombre has finished.');
            //res.redirect('/preview');            
        })
        .on('error', (error) => {
            console.error(error);
        });
    //res.render('preenviado');
    //res.send(notes);

});


export default app;