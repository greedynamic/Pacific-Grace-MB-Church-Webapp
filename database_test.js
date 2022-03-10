const mongoose = require('mongoose');
require('dotenv').config();
describe('User CRUD',() => {
    let connection;
    let database;
    const users = mongoose.model("test_"+process.env.COLLECTION,mongoose.Schema({
        name: String,
        email: String
    }));

    beforeAll(async () => {
        connection = await mongoose.connect('postgres://localhost:5000/test_'+process.env.DATABASE,{useNewUrlParser: true, useUnifiedTopology: true });
        db = mongoose.connection;
        const collection = process.env.COLLECTION;
        await db.createCollection(collection);
    });

    afterAll(async () => {
        const collection = "test_"+process.env.COLLECTION;
        await db.dropCollection(collection);
        await db.dropDatabase();
        await db.close();
        await connection.close();
    });
    
    test("Add User POST /signup",async () => {
        const response = await users.create({
            name: process.env.USER_NAME,
            email: process.env.USER_EMAIL
        });
        await response.save();
        expect(response.name).toBe(process.env.USER_NAME);
    });

    test("All users GET /database", async () => {
        const response = await users.find({});
        expect(response.length).toBeGreaterThan(0);

    });

    // test("Update User PUT /users/:id", async () => {
    //     const response = await users.updateOne({name: process.env.USER_NAME},{email: process.env.USER_EMAIL_ALT});
    //     expect(response.ok).toBeTruthy();
    // });

    // test("User update is correct", async () => {
    //     const responseTwo = await users.findOne({name: process.env.USER_NAME});
    //     expect(responseTwo.email).toBe(process.env.USER_EMAIL_ALT);
    // });

    // test("Delete User DELETE /users/:id", async() => {
        
    //     const response = await users.deleteOne({name: process.env.USER_NAME});
    //     expect(response.ok).toBe(1);
    // });

});