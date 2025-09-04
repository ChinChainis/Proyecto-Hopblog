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

import {insertaUsuario,getVidIDbyUrl, deleteIMGID, getUsuario, deleteVidIDbyUrl, insertaVideoID} from './funciones_sql.js';

import ffmpegStatic from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import { type } from 'os';
ffmpeg.setFfmpegPath(ffmpegStatic);

const app = express();


const upload = multer({dest: 'frames/'})

const origin = "";
app.set('view engine','ejs');
app.use( express.json() ); // <== Make sure we can handle JSON data from the client



app.use(session({
    secret : '12345689',
    resave : false,
    saveUninitialized : true
}));




app.get('/test',(req,res) =>{
    res.send({}); //--> expect(response.headers['content-type']).toEqual(expect.stringContaining("json"));
})

app.get('/',(req,res) => {
    res.status(200).render('portada');

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
    res.render('creausuario',{session: req.session,usurrepe : 0});
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
            res.render('creausuario',{session: '',usurrepe : 1});
            
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

app.post('/login', express.urlencoded({ extended: true }),async (req,res) =>{
    const {user_email,user_password } = req.body;
    var fallolog = 0;
    var user_mail_address = user_email;
    //var passwd = user_password;
    if(user_mail_address && user_password){
        //res.redirect("/");
        const notes = await getUsuario(user_mail_address);

        if(notes.length > 0){
            if( user_password == notes[0].contrasenia ){
                req.session.user_email = notes[0].nick ;
                
                res.redirect(302,'/seguridad');
                //res.write('todo correcto');
            }else{
                res.status(401);
                res.render('seguridad',{session:'ERRORCONT'});
            }
            
        }else{
            //res.send('usuario incorrecto');
                res.status(401);
                res.render('seguridad',{session:'ERROR'});            
        }
    }else{
        res.status(401);
        res.render('seguridad',{session:''});

    }

});

app.get('/logout',function(request,response,next){
    request.session.destroy();
    response.redirect("/seguridad");
})


app.get('/muestra3', async (req,res) => {
    const images = await fs.promises.readdir('public/vids');
    let newvidreos = [];
    for (let i = 0; i < images.length; i++) {
        let nomv =images[i];
        let notes = await getVidIDbyUrl(nomv); 
        if(notes.length > 0){
            let privado = notes[0]["privado"];
            let nombrevid = notes[0]["urltitulo"];
            let autoractual = notes[0]["autor"];
            if(privado == 0){
                newvidreos.push([nomv,nombrevid,autoractual]);
            }
            if(privado == 1 && req.session.user_email == autoractual){
                newvidreos.push([nomv,nombrevid,autoractual]);
            }
        }
    }

    let rolusr = '';

    if(req.session.user_email){
        const aut = await getUsuario(req.session.user_email);
        rolusr = aut[0]["rol"];
    }

    let HTML_ARCH = `
            ${newvidreos.map(i=>`
                <div id='contienevideo'> 
                    <h3 id="titulovideo">${ i[1] } de ${ i[2] }</h3>
                    <video width="600" height="300" controls>
                    <source src="/vids/${i[0]}" type="video/mp4">
                    Your browser does not support the video tag.
                    </video>
                </div> `).join('') }
        `

    res.render('galeria',{session: req.session,images:HTML_ARCH,rolactual:rolusr});

});

app.get('/totalAdmin', async (req,res) => {
    const buscaadmin = await getUsuario(req.session.user_email);

    if(buscaadmin.length > 0){
        if(buscaadmin[0]["rol"] == "administrador"){
            const images = await fs.promises.readdir('public/vids')
            let newvidreos = [];
            for (let i = 0; i < images.length; i++) {
                let nomv =images[i];
                let notes = await getVidIDbyUrl(nomv); 
                if(notes.length > 0){
                    let privado = notes[0]["privado"];
                    let nombrevid = notes[0]["urltitulo"];
                    let autoractual = notes[0]["autor"];
                    let etiqprivado = '';
                    if(privado == 1){
                        etiqprivado="PRIVADO->";
                    }
                    newvidreos.push([nomv,nombrevid,autoractual,etiqprivado]);

                }
            }

            let HTML_ARCH = `
                    ${newvidreos.map(i=>`
                        <div id='contienevideo'> 
                            <h3 id="titulovideo"> <span id="privavideo"> ${ i[3] } </span> ${ i[1] } de ${ i[2] }</h3>
                            <div id="contenedorvideo">
                                <video width="600" height="300" controls>
                                <source src="/vids/${i[0]}" type="video/mp4">
                                Your browser does not support the video tag.
                                </video>
                                <form method="post" action="/borravid">
                                    <input type="hidden" id="idvideoborrar" name="idvideoborrar" value=${i[0]}>
                                    <input type="submit" class="btn btn-primary" id="borraboton" value="" title="Borrar video" name="botonborrar" />
                                </form>
                            </div>
                        </div> `).join('') }
                `

            res.render('galeria',{session: req.session,images:HTML_ARCH,rolactual:'administrador'});
        }else{
            res.redirect('/muestra3');
        }
    }else{
        res.redirect('/muestra3');
    }


});

app.post('/borravid', express.urlencoded({ extended: false }),async (req,res) => {
    //93786 | Antonio | caradiente.mp4  | cara,susto,dientes |       0 
    let nomvid = req.body.idvideoborrar.split('.');
    const vidaborrar = await getVidIDbyUrl(nomvid[0]);
    const ordenborra = await deleteVidIDbyUrl(nomvid[0]);
    res.redirect('/totalAdmin');

            //let nomog = nomvid.split('.')
    const foldPath = './public/vids';
    fs.readdir(foldPath, function(err, files) {

        const txtFiles = files.filter(el => path.dirname(el) === nomvid);
            //for (let i = 0; i < txtFiles.length; i++) {
        let filePath = foldPath + "/" + nomvid[0] + ".mp4";
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
    const vid = deleteIMGID(nomvid[0]);
});


app.post('/muestrabusqueda', express.urlencoded({ extended: false }),async (req,res) => {
    var etq = req.body.etiquetasbuscar;
    var etiquetas = etq.split(',');
    const images = await fs.promises.readdir('public/vids')
    let videosfiltrados = [];
    for (let i = 0; i < images.length; i++) {
        let nomv =images[i];
        let notes = await getVidIDbyUrl(nomv); 

        if(notes.length > 0){
            let privado = notes[0]["privado"];
            let autoractual = notes[0]["autor"];
            let nombrevid = notes[0]["urltitulo"];
            let etiqetasvideo = JSON.stringify(notes[0]["etiquetas"]);
            for (let i = 0; i < etiquetas.length; i++) {
                if(etiqetasvideo.search(etiquetas[i]) != -1){
                    if(privado == 0){
                        videosfiltrados.push([nomv,nombrevid,autoractual]);
                    }
                    if(privado == 1 && req.session.user_email == autoractual){
                        videosfiltrados.push([nomv,nombrevid,autoractual]);
                    }
                }

                if( autoractual == etiquetas[i] ){
                    if(privado == 0){
                        videosfiltrados.push([nomv,nombrevid,autoractual]);
                    }
                }
            };
            //si es privado no se enseña a menos que el autor sea el mismo que el session.user

        }
    }

    let rolusr = '';

    if(req.session.user_email){
        const aut = await getUsuario(req.session.user_email);
        rolusr = aut[0]["rol"];
    }

    let videosfiltrados2 = videosfiltrados.filter((item, index) => videosfiltrados.indexOf(item) === index);


    let HTML_ARCH = `
            ${videosfiltrados2.map(i=>`
                <span id='contienevideo'> <h3 id="titulovideo">${ i[1] } de ${ i[2] }</h3>
                <video width="600" height="300" controls>
                <source src="/vids/${i[0]}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
            </span> `).join('') }
        `

    res.render('galeria', {session: req.session,images:HTML_ARCH,rolactual:rolusr});

});


app.get('/usuario/:nombre', async (req,res) => {
    const images = await fs.promises.readdir('public/vids')
    let name = req.params.nombre;

    const aut = await getUsuario(name);


    let newvidreos = [];
    for (let i = 0; i < images.length; i++) {
        let nomv =images[i];
        let notes = await getVidIDbyUrl(nomv); 
        if(notes.length > 0){
            let nombrevid = notes[0]["urltitulo"];
            let autoractual = notes[0]["autor"];
            if( notes[0]["autor"] == name && notes[0]["privado"] == 0){
                    newvidreos.push([nomv,nombrevid,autoractual]);
                }
                else if( name == req.session.user_email && notes[0]["privado"] == 1 && notes[0]["autor"] == name){
                    newvidreos.push([nomv,nombrevid,autoractual]);
                }else if( name != req.session.user_email && notes[0]["privado"] == 1 && notes[0]["autor"] == name && aut[0]["rol"] == "administrador"){
                    newvidreos.push([nomv,nombrevid,autoractual]);
                }
        }
    }


    if(aut.length > 0){
        let rolusr = '';

        if(aut[0]["rol"] == "administrador"){
            rolusr = aut[0]["rol"];
        }


        let HTML_ARCH = `
                ${newvidreos.map(i=>`
                    <div id='contienevideo'>
                    <h3 id="titulovideo">${ i[1] } de ${ i[2] }</h3>         
                    <video width="600" height="300" controls>
                    <source src="/vids/${i[0]}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
                </div> `).join('') }
            `

        res.render('galeria', {session: req.session,images:HTML_ARCH,rolactual:rolusr});
    }else{
        console.log("USUARIO SIN IDENTIFICAR");
        res.redirect('/seguridad');
    }
});

app.get('/preview/:id/:nombre', async (req,res) => {
    //var name = 'anima2.mp4';
    let name = req.params.nombre + '.mp4';
    let id = Math.round(req.params.id);
    res.render('preenviado', {name:name,idanim:id,session: req.session});

});


app.post('/upload', express.urlencoded({ extended: false }),async (req,res) =>{
    var etiquetas = req.body.etiquetas;
    var privado = req.body.privadocheck;
    let listaetiq = etiquetas.split(',');
    let nomvid = req.body.vidname;
    let idvid = req.body.vidid;
    let autorvid = req.body.usuario;

    if(req.body.botonform == 'Subir!'){
        let id_rand = Math.floor(Math.random() * (10000 - 1000) + 1000);

        if(privado!='ok'){
            console.log("no es privado"); 
            //const vid = insertaVideoID(idvid,'Antonio', nomvid,etiquetas,false);
            const vid = insertaVideoID(idvid,autorvid, nomvid,etiquetas,false);
        }else{
            console.log("es privado");
            //const vid = insertaVideoID(idvid,'Antonio', nomvid,etiquetas,true);
            const vid = insertaVideoID(idvid,req.session.user_email, nomvid,etiquetas,true);
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
        const ordenborra = await deleteVidIDbyUrl(idvid);
    }


    let direccion = '/usuario/'+autorvid;
    res.redirect(direccion);
});



export default app;