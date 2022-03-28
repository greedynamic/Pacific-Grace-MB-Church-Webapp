const express = require('express');
const res = require('express/lib/response');
const { redirect } = require('express/lib/response');
const blogRoute = require('./routes/adminBlog');
const session = require('express-session');
const path = require('path');
const PORT = process.env.PORT || 5000;
const { Pool } = require('pg');
const { exists } = require('fs');
const { user } = require('pg/lib/defaults');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://wwiwookhmzbgif:b99fe28f9a5e30cdca56d64ce4165e8c1bf3f8a4fc1895b437043db9fa4ed35a@ec2-34-230-110-100.compute-1.amazonaws.com:5432/d329ha74afil4s',
    ssl: {
        rejectUnauthorized: false
    }
});
var app = express();

const flash = require('express-flash')
const users = [];

const bcrypt = require('bcrypt')
const passport = require('passport')

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use('/blog', blogRoute);
app.use(session({
  name: "session",
  secret: "secret",
  resave: false,
  saveUninitialized: false
}))

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/database', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(`select * from usr`);
    const results = {'results': (result) ? result.rows : null};
    res.render('pages/db', results);
    client.release();
  } catch (err) {
    res.send(err);
  }
});

app.get('/signup', (req,res) => res.render('pages/signup'));

app.post('/signup', async (req,res) => {
  try {
    var firstName = req.body.fName;
    var lastName  = req.body.lName;
    var email = req.body.email;
    var password = req.body.password;
    let errors = [];

    const client = await pool.connect();
    //check if email is in database
    var loginQuery = `select * from usr where email='${email}'`;
    const result = await client.query(loginQuery);

      if(result.rowsCount > 0) {
        errors.push({message: "Email in use; please use a different email"})
      }
      if(password.length < 8) {
        errors.push({message: "Password minimum length 5 characters"});
      }

      if(errors.length == 0) {
        // adds account to database, creating account
        var registerQuery = `insert into usr values('${firstName}', '${lastName}', '${email}', '${password}')`;
        await client.query(registerQuery); 
        res.redirect("/login");
        client.release();
      } else {
        res.render('pages/signup', {errors});
      }


  } catch (err) {
    res.send(err);
  }
})

app.get('/login', (req,res) => res.render('pages/login'));

app.post('/login', async (req,res) => {
  try {
    var email = req.body.email;
    var password = req.body.password;
    var loginQuery = `select * from usr where email='${email}' and password='${password}'`;
    let errors = [];

    const client = await pool.connect();
    const result = await client.query(loginQuery);
    if (result.rowCount == 1) {
      var userResult = result.rows[0];
      req.session.user = {fname:userResult.fname, lname:userResult.lname,
         email:userResult.email, password:userResult.password};
      res.redirect("/database"); // homepage
    } else {
      // Change: make some sort of alert message
      // window.alert("invalid email or password");
      errors.push({message: "Invalid email or password"});
      res.render('pages/login', {errors});
    }
    client.release();
  } catch (err) {
    res.send(err);
  }
});

// test function to test session user
// remove later
app.get('/f', (req,res) => {
  if(req.session.user){
    res.send(`hi ${req.session.user.fname}`);
  } else {
    res.redirect("/login");
  }
})

app.post('/logout', (req,res) => {
  req.session.destroy();
  res.redirect("/login");
})

app.listen(PORT, () => console.log(`Listening on ${PORT}`));