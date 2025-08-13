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


describe('GET /canvas', () => {
    test('should respond with 500', async() => {
        const response = await request(app).get("/canvas").send();
        expect(response.statusCode).toBe(500);
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
        test("debería responde con status code 200", async () =>{
            const response = await request(app).post("/login").send({
                user_mail_address: "Antonio",
                user_password: "contrasenia"

            })
            //expect(response.body.user_email).toBeDefined()
            expect(response.statusCode).toBe(200);
        })

    })
    describe("Si no se da nombre y contraseña", ()=>{
        
    })
});
