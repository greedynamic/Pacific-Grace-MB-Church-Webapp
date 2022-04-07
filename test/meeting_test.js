const chai = require('chai')
const request = chai.request
const expect = chai.expect
const should = chai.should()
const chaiHttp = require('chai-http')
const server = require('../index')

chai.use(chaiHttp)

describe('/login', () => {
    it('should GET login page', (done) => {
        chai.request(server)
            .get("/login")
            .end((err, res) => {
                res.should.have.status(200)
                res.should.to.be.html;
                done();
            })
    })
    it('should POST regular user login', (done) => {~
        chai.request(server)
            .post("/login")
            .send({'email':'tester@gmail.com', 'password':'testing1'})
            .redirects(0)
            .end((err,res) => {
                res.should.have.status(302);
                res.should.redirectTo("/")
                done();
            }) 
    })
    it('should POST admin user login', (done) => {
        chai.request(server)
            .post("/login")
            .send({'email':'peterpark@gmail.com', 'password':'peterpark'})
            .redirects(0)
            .end((err,res) => {
                res.should.have.status(302);
                res.should.redirectTo("/")
                done();
            }) 
    })
    it('should fail login in user on POST request', (done) => {
        chai.request(server)
            .post("/login")
            .send({'email':'invalid@gmail.com', 'password':'invalid'})
            .end((err,res) => {
                res.should.have.status(200);
                res.should.to.be.html;
                done();
            }) 
    })
})

describe('/meeting', () => {
    it('should GET meeting page', (done) => {
        chai.request(server)
            .get("/meeting")
            .end((err, res) => {
                res.should.have.status(200)
                res.should.to.be.html;
                done();
            })
    })
    it('should GET meeting code page', (done) => {
        chai.request(server)
            .get("/meeting/code")
            .end((err, res) => {
                res.should.have.status(200)
                res.should.to.be.html;
                done();
            })
    })
    // it('should GET meeting public redirect', (done) => {
    //     chai.request(server)
    //         .get("/meeting/public")
    //         .redirects(0)
    //         .end((err, res) => {
    //             res.should.have.status(200)
    //             done();
    //         })
    // })
    // it('should GET meeting private redirect', (done) => {
    //     chai.request(server)
    //         .get("/meeting/private")
    //         .redirects(0)
    //         .end((err, res) => {
    //             res.should.have.status(302)
    //             done();
    //         })
    // })
    it('should GET a unique meeting room page', (done) => {
        chai.request(server)
            .get('/meeting/room/:room')
            .end((err,res) => {
                res.should.have.status(200)
                res.should.to.be.html;
                done();
            })
    })
    
})