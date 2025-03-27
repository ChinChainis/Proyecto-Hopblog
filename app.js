/*const http = require('http')
const fs = require('fs')
const port = 3000

//server http://localhost:3000/
const server = http.createServer(function(req,res){
    res.writeHead(200,{'Content-Type':'text/html'})

    fs.readFile('index.html',function(error,data){
        if(error){
            res.writeHead(404)
            res.write('Error: fichero no encontrado')
        }else{
            app.use(express.static('styles.css'))
            res.write(data)
        }
        res.end()
    })
})

server.listen(port,function(error){
    if (error){
        console.log("Error en listen",error)
    }else{
        console.log("Server en port " + port)
    }
})*/
var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');

const mimetypes = {
    'html': 'text/html',
    'css': 'text/css',
    'js': 'text/javascript',
    'png': 'image/png',
    'jpeg': 'image/jpeg',
    'jpg': 'image/jpg'
};

var portname = '127.0.0.1';
var port = '3000';

http.createServer((req, res) => {
    var myuri = url.parse(req.url).pathname;
    var filename = path.join(process.cwd(), unescape(myuri));
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
        var mimeType = mimetypes[path.extname(filename).split('.').reverse()[0]];
        res.writeHead(200, {
            "Content-Type": mimeType
        });
        var filestream = fs.createReadStream(filename);
        filestream.pipe(res);
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