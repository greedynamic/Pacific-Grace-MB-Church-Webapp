const express = require('express');
const res = require('express/lib/response');
const { redirect } = require('express/lib/response');
const blogRoute = require('./routes/adminBlog');
const path = require('path');
const PORT = process.env.PORT || 5000;
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});
var app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use('/blog', blogRoute);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/database', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(`select * from usr`);
    const results = { 'results': (result) ? result.rows : null};
    res.render('pages/db', results);
    client.release();
  } catch (err) {
    res.send(err);
  }
});

app.get('/signup', (req,res) => res.render('pages/signup'));
<<<<<<< HEAD
app.post('/signup', async (req,res) => {
  try {
    var email = req.body.email;
    var password = req.body.password;
    // adds account to database, creating account
    var registerQuery = `insert into usr values('${email}', '${password}')`;

    const client = await pool.connect();
    await client.query(registerQuery); 
    res.render("pages/login");
    client.release();
  } catch (err) {
    res.send(err);
  }
})
=======
>>>>>>> 15df5d50119b38412f150c74b59fec01845c80c2

app.get('/login', (req,res) => res.render('pages/login'));

app.post('/login', async (req,res) => {
  try {
    var email = req.body.email;
    var password = req.body.password;
    // gets the password from a given email
    var loginQuery = `select password from usr where exists (select * from usr where email=${email})`;

    const client = await pool.connect();
    await client.query(loginQuery); 
    const results = {'results': (result) ? result.rows : null};

    if (results.length == 1 && results[0] == password) {
      res.render("pages/db");
    } else {
      // failed password
      console.log(results.length);
      res.render("pages/signup");
    }
  client.release();
  } catch (err) {
    res.send(err);
  }
});



app.listen(PORT, () => console.log(`Listening on ${ PORT }`));