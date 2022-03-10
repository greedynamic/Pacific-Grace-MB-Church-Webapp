const express = require('express');
const res = require('express/lib/response');
const { redirect } = require('express/lib/response');
const blogRoute = require('./routes/adminBlog');
const path = require('path');
const PORT = process.env.PORT || 5000;
const { Pool } = require('pg');
const req = require('express/lib/request');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://wwiwookhmzbgif:b99fe28f9a5e30cdca56d64ce4165e8c1bf3f8a4fc1895b437043db9fa4ed35a@ec2-34-230-110-100.compute-1.amazonaws.com:5432/d329ha74afil4s',
    ssl: {
        rejectUnauthorized: false
    }
});
var app = express();

const flash = require('express-flash')
const session = require('express-session')
const bcrypt = require('bcrypt')
const passport = require('passport');
const {authUser, authAmdin} = require('./routes/middleware');
const users = [];

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(session({
  name: "session",
  secret: "zordon resurrection",
  resave: false,
  saveUninitialized: false,
}))

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/blog', authAmdin(), blogRoute);


app.get('/', (req,res) => {
  // Post recent blogs on homepage
  pool.query('SELECT * FROM blog ORDER BY published_at DESC;', (error, result) => {
    if(error)
      res.send(error);
    else{
      res.render('pages/homepage', {'blogs' : result.rows, user: req.session.user});
    }
})
//res.render('pages/homepage');
  
});

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

app.get('/signup', (req,res) => {
  if(req.session.user){
    res.redirect("/");
  } else {
    res.render('pages/signup');
  }
});

app.post('/signup', async (req,res) => {
  try {
    const firstName = req.body.fName;
    const lastName  = req.body.lName;
    const email = req.body.email;
    const password = req.body.password;
    let errors = [];

    const client = await pool.connect();
    const emailQuery = `select * from usr where email='${email}'`;
    const result = await client.query(emailQuery);
    
      //check if email is in database
      if(result.rows.length > 0) {
        errors.push({message: "Email in use. Please use a different email"})
      }
      // validate email format
      const validateEmail = (email) => {
        return String(email)
          .toLowerCase()
          .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          );
      };
      if (!validateEmail(email)) {
        errors.push({message: "Email is invalid."});
      }
      if(password.length < 8) {
        errors.push({message: "Password minimum length 8 characters."});
      }

      if(errors.length == 0) {
        // adds account to database, creating account
        const registerQuery = `insert into usr values('${firstName}', '${lastName}', '${email}', '${password}')`;
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

app.get('/login', (req,res) => {
  if(req.session.user){
    res.redirect('/');
  } else {
    res.render('pages/login');
  }
});

app.post('/login', async (req,res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const loginQuery = `select * from usr where email='${email}' and password='${password}'`;
    let errors = [];

    const client = await pool.connect();
    const result = await client.query(loginQuery);
    if (result.rowCount == 1) {
      const userResult = result.rows[0];
      req.session.user = {fname:userResult.fname, lname:userResult.lname,
        email:userResult.email, password:userResult.password, admin:userResult.admin};
      res.redirect("/");
    } else {
      errors.push({message: "Invalid email or password"});
      res.render('pages/login', {errors});
    }
    client.release();
  } catch (err) {
    res.send(err);
  }
});

app.get('/logout', (req,res) => {
  req.session.destroy();
  res.redirect('/');
})

app.get('/account', (req,res) => {
  if(req.session.user){
    res.render('pages/account', {user:req.session.user});
  } else {
    res.redirect('/login');
  }
})

app.get('/:title', (req,res) => {
  var getBlogQuery = `SELECT * FROM blog WHERE title='${req.params.title}';`;
  pool.query(getBlogQuery, (error, result) =>{
      if(error)
          res.send(error);
      else{
          var results = {'blogs': result.rows};
          res.render('pages/showBlog', results);
      }
  })
})

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));

