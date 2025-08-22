import request from 'supertest';
import app from '../video'

describe('GET /video',()=>{
    test("should respond with 200",async()=>{
        const response = await request(app).get("/test").send();
        //console.log(response);
        expect(response.statusCode).toBe(200);
    })
    test("should respond with json",async()=>{
        const response = await request(app).get("/test").send();
        //console.log(response);
        expect(response.headers['content-type']).toEqual(expect.stringContaining("json"));
    })
});

describe('GET /', () => {
    test('should respond with 200', async() => {
        const response = await request(app).get("/").send();
        //console.log(response);
        expect(response.statusCode).toBe(200);
        //expect(response.body).toBeInstanceOf(HTML);
    })
});


describe('GET /canvas', () => {
    test('should respond with 200', async() => {
        const response = await request(app).get("/canvas").send();
        expect(response.statusCode).toBe(200);
        //expect(response.body).toBeInstanceOf(HTML);
    })
});

/*
describe('POST /muestrabusqueda',()=>{
    test("should respond with 200",async()=>{
        const response = await request(app).get("/test").send();
        console.log(response);
        expect(response.statusCode).toBe(200);
    })
    test("should respond with 200",async()=>{
        const response = await request(app).get("/test").send();
        //console.log(response);
        expect(response.headers['content-type']).toEqual(expect.stringContaining("json"));
    })
});*/


describe('POST /login', () => {
    describe("Dado nombre y contraseña", ()=>{
        test("debería responde con status code 302 Found", async () =>{
            const response = await request(app).post("/login").send({
                user_email: "Antonio",
                user_password: "contrasenia"

            })
            //console.log('test con parametros: ',response);
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
    describe("Dado contraseña y no nombre", ()=>{
        test("debería responde con status code 401", async () =>{
            const response = await request(app).post("/login").send({
                user_email: "Antonio",
                user_password: undefined

            })
            //console.log('test con parametros: ',response);
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
            //console.log('test con parametros: ',response);
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
            //console.log(response);
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


describe('POST /muestrabusqueda', () => {
    describe("Dada etiqueta", ()=>{
        test("debería responde con status code 200", async () =>{
            const response = await request(app).post("/muestrabusqueda").send({
                etiquetasbuscar : 'cara,ojo'
            })
            expect(response.statusCode).toBe(200);
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
            console.log(response);
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
            console.log(response);
            expect(response.statusCode).toBe(302);
        })
    })
});
