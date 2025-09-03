import request from 'supertest';
import app from '../video'

describe('GET /test',()=>{
    test("should respond with 200",async()=>{
        const response = await request(app).get("/test").send();
        expect(response.statusCode).toBe(200);
    })
    test("should respond with json",async()=>{
        const response = await request(app).get("/test").send();
        expect(response.headers['content-type']).toEqual(expect.stringContaining("json"));
    })
});

describe('GET /', () => {
    test('debería responder con 200', async() => {
        const response = await request(app).get("/").send();
        expect(response.statusCode).toBe(200);
    })
    test("debería responde con la página de la portada", async () =>{
        const response = await request(app).get("/").send();
        expect(response.headers['content-type']).toEqual(expect.stringContaining("html"));
    })
});


describe('GET /canvas', () => {
    test('debería responder con 200', async() => {
        const response = await request(app).get("/canvas").send();
        expect(response.statusCode).toBe(200);
    })
    test("debería responde con la página del lienzo", async () =>{
        const response = await request(app).get("/canvas").send();
        expect(response.headers['content-type']).toEqual(expect.stringContaining("html"));
    })
});

describe('POST /login', () => {
    describe("Dado nombre y contraseña", ()=>{
        test("debería responde con status code 302 Found", async () =>{
            const response = await request(app).post("/login").send({
                user_email: "Antonio",
                user_password: "contrasenia"

            })
            expect(response.statusCode).toBe(302);
        })
        test("debería responder con redirección", async () =>{
            const response = await request(app).post("/login").send({
                user_email: "Antonio",
                user_password: "contrasenia"
            })
            expect(response.text).toBe("Found. Redirecting to /seguridad");
        })

    })
    describe("Dado nombre incorrecto y contraseña", ()=>{
        test("debería responde con status code 401 no autorizado", async () =>{
            const response = await request(app).post("/login").send({
                user_email: "noexiste",
                user_password: "contrasenia"

            })
            expect(response.statusCode).toBe(401);
        })
        test("debería responder con redirección", async () =>{
            const response = await request(app).post("/login").send({
                user_email: "noexiste",
                user_password: "contrasenia"
            })
            expect(response.headers['content-type']).toEqual(expect.stringContaining("html"));
        })

    })

    describe("Dado nombre y contraseña incorrecto", ()=>{
        test("debería responde con status code 401 no autorizado", async () =>{
            const response = await request(app).post("/login").send({
                user_email: "Antonio",
                user_password: "contraseniafalsa"

            })
            expect(response.statusCode).toBe(401);
        })
        test("debería responder con redirección", async () =>{
            const response = await request(app).post("/login").send({
                user_email: "Antonio",
                user_password: "contraseniafalsa"
            })
            expect(response.headers['content-type']).toEqual(expect.stringContaining("html"));
        })

    })

    describe("Dado contraseña y no nombre", ()=>{
        test("debería responde con status code 401", async () =>{
            const response = await request(app).post("/login").send({
                user_email: "Antonio",
                user_password: undefined

            })
            expect(response.statusCode).toBe(401);
        })
        test("debería responder con redirección", async () =>{
            const response = await request(app).post("/login").send({
                user_email: "Antonio",
                user_password: undefined

            })
            expect(response.headers['content-type']).toEqual(expect.stringContaining("html"));
        })

    })
    describe("Dado contraseña y no nombre", ()=>{
        test("debería responde con status code 401", async () =>{
            const response = await request(app).post("/login").send({
                user_email: undefined,
                user_password: "contrasenia"

            })
            expect(response.statusCode).toBe(401);
        })
        test("debería responder con redirección", async () =>{
            const response = await request(app).post("/login").send({
                user_email: undefined,
                user_password: "contrasenia"
            })
            expect(response.headers['content-type']).toEqual(expect.stringContaining("html"));
        })

    })
    describe("Si no se da nombre y contraseña", ()=>{
        test("debería responde con status 401", async () =>{
            const response = await request(app).post("/login").send({
                user_mail_address: undefined,
                user_password: undefined

            })
            expect(response.statusCode).toBe(401);
        })
        test("debería responder con texto", async () =>{
            const response = await request(app).post("/login").send({
                user_mail_address: undefined,
                user_password: undefined

            })
            expect(response.headers['content-type']).toEqual(expect.stringContaining("html"));
        })
        
    })
});

describe('GET /logout', () => {
    describe("Yendo a la página de inicio de usuario", ()=>{
        test("debería responde con status code 302", async () =>{
            const response = await request(app).get("/logout").send();
            expect(response.statusCode).toBe(302);
        })
    })
    describe("Nos da la página de seguridad con el inicio de sesión", ()=>{
        test("debería responder con render", async () =>{
            const response = await request(app).get("/logout").send();
            expect(response.text).toBe("Found. Redirecting to /seguridad");
        })
    })
});

describe('GET /muestra3', () => {
    describe("Accediendo a la galería", ()=>{
        test("debería responde con status code 200", async () =>{
            const response = await request(app).get("/muestra3").send();
            expect(response.statusCode).toBe(200);
        })
        test("debería responde con la página html con los resultados", async () =>{
            const response = await request(app).get("/muestra3").send();
            expect(response.headers['content-type']).toEqual(expect.stringContaining("html"));
        })
    })
});

describe('POST /muestrabusqueda', () => {
    describe("Dada etiqueta", ()=>{
        test("debería responde con status code 200", async () =>{
            const response = await request(app).post("/muestrabusqueda").send({
                etiquetasbuscar : 'cara,ojo'
            })
            expect(response.statusCode).toBe(200);
        })
        test("debería responde con la página html con los resultados", async () =>{
            const response = await request(app).post("/muestrabusqueda").send({
                etiquetasbuscar : 'cara,ojo'
            })
            expect(response.headers['content-type']).toEqual(expect.stringContaining("html"));
        })

    })
});

describe('GET /totalAdmin', () => {
    describe("Accediendo a la galería", ()=>{
        test("debería responde con status code 302", async () =>{
            const response = await request(app).get("/totalAdmin").send();
            expect(response.statusCode).toBe(302);
        })
        test("debería responde con la página html con los resultados", async () =>{
            const response = await request(app).get("/totalAdmin").send();
            expect(response.text).toBe("Found. Redirecting to /muestra3");
        })
    })
});

describe('POST /borravid', () => {
    describe("Dado id de video", ()=>{
        test("debería responde con status code 302", async () =>{
            const response = await request(app).post("/borravid").send({
                idvideoborrar : '333.mp4'
            })
            expect(response.statusCode).toBe(302);
        })
        test("debería responder con redirección a /totalAdmin", async () =>{
            const response = await request(app).post("/borravid").send({
                idvideoborrar : '333.mp4'
            })
            expect(response.text).toBe("Found. Redirecting to /totalAdmin");
        })
    })
});

describe('POST /upload', () => {
    describe("Con id, nombre, etiquetas, no privado", ()=>{
        test("Añade video con status code 302", async () =>{
            const response = await request(app).post("/upload").send({
                botonform : 'Subir!',
                usuario : 'Antonio',
                vidid : 333,
                vidname : 'video.pm4',
                etiquetas : 'cara,ojo',
                privadocheck : 0
            })
            expect(response.statusCode).toBe(302);
        })
        test("Borra video con status code 302", async () =>{
            const response = await request(app).post("/upload").send({
                botonform : 'Borrar',
                usuario : 'Antonio',
                vidid : 333,
                vidname : 'video.pm4',
                etiquetas : 'cara,ojo',
                privadocheck : 0
            })
            expect(response.statusCode).toBe(302);
        })

    })
    describe("Con id, nombre, etiquetas, no privado", ()=>{
        test("debería responder con redirección al subir", async () =>{
            var usuractual = 'Antonio';
            const response = await request(app).post("/upload").send({
                botonform : 'Subir!',
                usuario : usuractual,
                vidid : 333,
                vidname : 'video.pm4',
                etiquetas : 'cara,ojo',
                privadocheck : 0
            })
            expect(response.text).toBe("Found. Redirecting to /usuario/"+usuractual);
        })
        test("debería responder con redirección al borrar", async () =>{
            var usuractual = 'Antonio';
            const response = await request(app).post("/upload").send({
                botonform : 'Borrar',
                usuario : usuractual,
                vidid : 333,
                vidname : 'video.pm4',
                etiquetas : 'cara,ojo',
                privadocheck : 0
            })
            expect(response.text).toBe("Found. Redirecting to /usuario/"+usuractual);
        })
    })
});

describe('GET /usuario/:nombre', () => {
    describe("Dado usuario existente: ", ()=>{
        const usuario = "Antonio";
        test("debería responde con status code 200", async () =>{
            const response = await request(app).get("/usuario/"+usuario).send();
            expect(response.statusCode).toBe(200);
        })
        test("debería responde con redirección a seguridad", async () =>{
            const response = await request(app).get("/usuario/"+usuario).send();
            expect(response.headers['content-type']).toEqual(expect.stringContaining("html"));
        })

    })
    describe("Dado usuario no existente en la base de datos: ", ()=>{
        const usuario = "Romualdo";
        test("debería responde con status code 302", async () =>{
            const response = await request(app).get("/usuario/"+usuario).send();
            expect(response.statusCode).toBe(302);
        })
        test("debería responde con redirección a seguridad", async () =>{
            const response = await request(app).get("/usuario/"+usuario).send();
            expect(response.text).toBe("Found. Redirecting to /seguridad");
        })

    })
});

describe('GET /preview/:id/:nombre', () => {
    describe("Dado una id y un nombre: ", ()=>{
        const id = 333;
        const nombre = "video.mp4";
        test("debería responde con status code 200", async () =>{
            const response = await request(app).get("/preview/"+id+"/"+nombre).send();
            expect(response.statusCode).toBe(200);
        })
        test("debería responde con render a página de preview", async () =>{
            const response = await request(app).get("/preview/"+id+"/"+nombre).send();
            expect(response.headers['content-type']).toEqual(expect.stringContaining("html"));
        })

    })

});



describe('POST /creausr', () => {
    describe("Con nombre y contraseña nueva", ()=>{
        test("Encuentra la página de inicio de usuario", async () =>{
            const response = await request(app).post("/creausr").send({
                user_email : 'Ejemplo',
                user_password : 'contra',
            })
            expect(response.statusCode).toBe(200);
        })
        test("Redirige a la página de usuario", async () =>{
            const response = await request(app).post("/creausr").send({
                user_email : 'Ejemplo',
                user_password : 'contra',
            })
            expect(response.headers['content-type']).toEqual(expect.stringContaining("html"));
        })
    })
    describe("Con nombre repetido", ()=>{
        test("Recibe mensaje de error", async () =>{
            const response = await request(app).post("/creausr").send({
                user_email : "Antonio",
                user_password : "aaa",
            })
            expect(response.statusCode).toBe(200);
        })
        test("Muestra mensaje de error", async () =>{
            const response = await request(app).post("/creausr").send({
                user_email : "Antonio",
                user_password : "aaa",
            })
            expect(response.headers['content-type']).toEqual(expect.stringContaining("html"));
        })
    })
    describe("Sin nombre ni contraseña", ()=>{
        test("Recibe mensaje de error", async () =>{
            const response = await request(app).post("/creausr").send({
                user_email : undefined,
                user_password : undefined,
            })
            expect(response.statusCode).toBe(200);
        })
        test("Muestra mensaje de error", async () =>{
            const response = await request(app).post("/creausr").send({
                user_email : undefined,
                user_password : undefined,
            })
            expect(response.text).toBe('introduce mail y contraseña');
        })
    })
});

describe('GET /seguridad', () => {
    describe("Yendo a la página de inicio de usuario", ()=>{
        test("debería responde con status code 200", async () =>{
            const response = await request(app).get("/seguridad").send();
            expect(response.statusCode).toBe(200);
        })
    })
    describe("Nos renderiza la página de inicio de usuario para identificarnos o ir al perfil", ()=>{
        test("debería responder con render", async () =>{
            const response = await request(app).get("/seguridad").send();
            expect(response.headers['content-type']).toEqual(expect.stringContaining("html"));
        })
    })
    describe("Nos da la página de seguridad con el inicio de sesión", ()=>{
        test("debería responder con render", async () =>{
            const response = await request(app).get("/seguridad").send();
            expect(response.text).toEqual(expect.stringContaining('Inicia sesión en HopBlog'));
        })
    })
});
