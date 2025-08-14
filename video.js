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

import {getImgIDbyId,getTituloIDbyUrl,getVidIDbyUrl,getFramesbyId, deleteIMGID, getUsuario, insertaVideo, insertaVideo3, deleteIMG,getImgbyTitulo, getVidbyAutor, getVidbyUrl, insertaVideoID} from './funciones_sql.js';

import ffmpegStatic from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import { type } from 'os';
ffmpeg.setFfmpegPath(ffmpegStatic);

const app = express();


const upload = multer({dest: 'frames/'})

const origin = "";


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
        let notes = await getVidIDbyUrl(nomv); 
        if(notes.length > 0){
            let privado = notes[0]["privado"];
            let nombrevid = notes[0]["urltitulo"];
            let autoractual = notes[0]["autor"];
            if(privado == 0){
                newvidreos.push([nomv,nombrevid]);
            }
            if(privado == 1 && req.session.user_email == autoractual){
                newvidreos.push([nomv,nombrevid]);
            }
        }
    }

    let HTML_ARCH = `
            ${newvidreos.map(i=>`
                <div id='contienevideo'> 
                    <h3>${ i[1] }</h3>
                    <video width="640" height="480" controls>
                    <source src="/vids/${i[0]}" type="video/mp4">
                    Your browser does not support the video tag.
                    </video>
                </div> `).join('') }
        `

    res.render('galeria', {images:HTML_ARCH});

});

app.post('/muestrabusqueda', express.urlencoded({ extended: false }),async (req,res) => {
    let etiquetas = req.body.etiquetasbuscar.split(',');
    const images = await fs.promises.readdir('public/vids')
    let videosfiltrados = [];
    for (let i = 0; i < images.length; i++) {
        let nomv =images[i];
        let notes = await getVidIDbyUrl(nomv); 
        console.log("resul: " + nomv + ' ' + JSON.stringify(notes[0]));

        if(notes.length > 0){
            let privado = notes[0]["privado"];
            let autoractual = notes[0]["autor"];
            let nombrevid = notes[0]["urltitulo"];
            let etiqetasvideo = JSON.stringify(notes[0]["etiquetas"]);
            for (let i = 0; i < etiquetas.length; i++) {
                if(etiqetasvideo.search(etiquetas[i]) != -1){
                    if(privado == 0){
                        videosfiltrados.push([nomv,nombrevid]);
                    }
                    if(privado == 1 && req.session.user_email == autoractual){
                        videosfiltrados.push([nomv,nombrevid]);
                    }
                }

                if( autoractual == etiquetas[i] ){
                    if(privado == 0){
                        videosfiltrados.push([nomv,nombrevid]);
                    }
                }
            };
            //si es privado no se enseña a menos que el autor sea el mismo que el session.user
            //console.log(etiqetasvideo);
            //newvidreos.push(nomv);
        }
    }
    console.log(videosfiltrados);


    let videosfiltrados2 = videosfiltrados.filter((item, index) => videosfiltrados.indexOf(item) === index);


    let HTML_ARCH = `
            ${videosfiltrados2.map(i=>`
                <span id='contienevideo'> ${i[1]}
                <video width="640" height="480" controls>
                <source src="/vids/${i[0]}" type="video/mp4">
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
        let notes = await getVidIDbyUrl(nomv); 
        if(notes.length > 0){
            let nombrevid = notes[0]["urltitulo"];
           if( notes[0]["autor"] == req.session.user_email ){
                newvidreos.push([nomv,nombrevid]);
            }
        }
    }

    if(req.session.user_email){
        let HTML_ARCH = `
                ${newvidreos.map(i=>`
                    <div id='contienevideo'>${i[1]}          
                    <video width="640" height="480" controls>
                    <source src="/vids/${i[0]}" type="video/mp4">
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
            const vid = insertaVideoID(idvid,'Antonio', nomvid,etiquetas,false);
        }else{
            console.log("es privado");
            const vid = insertaVideoID(idvid,'Antonio', nomvid,etiquetas,true);
        }
    }else{
        //let nomog = nomvid.split('.')
        const foldPath = './public/vids';
        let nomvidsolo = nomvid.split('.')[0];
        fs.readdir(foldPath, function(err, files) {

        const txtFiles = files.filter(el => path.dirname(el) === nomvid);
        console.log(txtFiles);
            //for (let i = 0; i < txtFiles.length; i++) {
                let filePath = foldPath + "/" + idvid +'.mp4';
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


export default app;