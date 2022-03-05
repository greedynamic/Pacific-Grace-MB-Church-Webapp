const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const { init } = require('passport/lib')

function initialize(passport, getUserByEmail) {
}

module.exports = initialize