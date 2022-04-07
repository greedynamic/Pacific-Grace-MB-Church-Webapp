const chai = require('chai')
const request = chai.request
const expect = chai.expect
const should = chai.should()
const chaiHttp = require('chai-http')
const server = require('../index')

chai.use(chaiHttp)

describe('/donate', () => {
    it('should GET donation page', (done) => {
        chai.request(server)
            .get("/donate")
            .end((err, res) => {
                res.should.have.status(200);
                res.should.be.html;
                done();
            })
    })
    it('should redirect to login page when unregistered', (done) => {
        chai.request(server)
            .get("/transactions")
            .end((err, res) => {
                res.should.be.html;
                res.should.have.status(200);
                done();
            })
    })
})