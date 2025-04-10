import http from 'http';
import url from 'url';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';
import { dirname } from 'path';
import express from 'express';

const app = express();

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
app.get('/',(req,res) => {
    console.log("holaa");
    //res.status(200);
    //res.sendFile(__dirname + "/" + "styles.css");
    res.render('index');
    //podríamos enviar variables al html si hacemos res.render('index', {text: "World"}) y luego en el html Hello <%= text %>
    //res.sendFile(path.join(__dirname,'/index.html'));
});

app.listen(port, () => {
    console.log("Conectado");
    console.log(`Server is running on server http://${portname}:${port}`);
});
