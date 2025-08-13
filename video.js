import express from 'express';
import fs, { readFile } from 'fs';
import {getImgIDbyId,insertarFrameID,getFramesbyId, deleteIMGID, getUsuario, insertaVideo, insertaVideo3, deleteIMG,getImgbyTitulo, getVidbyAutor, getVidbyUrl} from './funciones_sql.js';

const app = express();

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


app.get('/muestra2', async (req,res) => {
    const images = await fs.promises.readdir('public/vids')
    /*      <a href="/">Home</a>
        ${images.map(i=>`<video width="320" height="240" controls> <source src="/videoV2.mp4" type="video/mp4">
            Your browser does not support the video tag.
        </video> `)}*/
    //ojo con href, si queremos usar estilo css quitamos el public/css, usamos directamente la carpeta  

    //        <h1>Hi User, Welcome ${session.user_email} </h1>


    //console.log("vidreos: " + images);
    //vidreos: video.mp4,video6ago.mp4,videoV2.mp4,videoV3.mp4
    //let notes = await getVidbyUrl("./" + images[2]); //es el de pos 2
    //console.log("resul: " + JSON.stringify(notes[0]["id"]));
    let newvidreos = [];
    for (let i = 0; i < images.length; i++) {
        let nomv =images[i];
        let notes = await getVidbyUrl(nomv); 
        if(notes.length > 0){
            //console.log("resul: " + JSON.stringify(notes[0]));
            newvidreos.push(nomv);
        }
    }

    //if(req.session.user_email){
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
            <aside>
            <p>The Epcot center is a theme park at Walt Disney World Resort featuring exciting attractions, international pavilions, award-winning fireworks and seasonal special events.</p>
            </aside>


            ${images.map(i=>`<video width="320" height="240" controls>            
                <source src="/vids/${i}" type="video/mp4">
                Your browser does not support the video tag.
            </video> `).join('') }

        </body>
        </html>
        `
        return res.send(HTML_ARCH);
    //}else{
    //    console.log("EEEEEEEEEEEEEEEE LOGEATE");
    //    res.redirect('seguridad');
    //}

});

app.get('/muestra3', async (req,res) => {
    const images = await fs.promises.readdir('public/vids')
    let newvidreos = [];
    for (let i = 0; i < images.length; i++) {
        let nomv =images[i];
        let notes = await getVidbyUrl(nomv); 
        if(notes.length > 0){
            //console.log("resul: " + JSON.stringify(notes[0]));
            newvidreos.push(nomv);
        }
    }
                //<div id='contienevideo'>${i} 
    let HTML_ARCH = `
            ${images.map(i=>`
                <span id='contienevideo'> ${i}
                <video width="640" height="480" controls>
                <source src="/vids/${i}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
            </span> `).join('') }
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
            //console.log("resul: " + JSON.stringify(notes[0]));
            let etiqetasvideo = JSON.stringify(notes[0]["etiquetas"]);
            for (let i = 0; i < etiquetas.length; i++) {
                if(etiqetasvideo.search(etiquetas[i]) != -1){
                    videosfiltrados.push(nomv)
                }
                let autoractual = notes[0]["autor"];

                if( autoractual == etiquetas[i] ){
                    videosfiltrados.push(nomv);
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


export default app;