const chai = require('chai')
const request = chai.request
const expect = chai.expect
const should = chai.should()
const chaiHttp = require('chai-http')
const server = require('../index')

chai.use(chaiHttp)

describe('/signup', () => {
    it('should GET signup page', (done) => {
        chai.request(server)
            .get("/signup")
            .end((err, res) => {
                res.should.have.status(200);
                res.should.be.html;
                done();
            })
    })
    it('should reject invalid input', (done) => {
        chai.request(server)
            .get("/signup")
            .send({'email':'notanemail', 'password':'bad'})
            .end((err, res) => {
                res.should.have.status(200);
                res.should.be.html;
                done();
            })
    })
    it('signup should finish after input', (done) => {
        chai.request(server)
            .post("/signup")
            .end((err, res) => {
                res.should.be.string;
                res.should.have.status(200);
                done();
            })
    })
})