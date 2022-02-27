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
    const results = {'results': (result) ? result.rows : null};
    res.render('pages/db', results);
    client.release();
  } catch (err) {
    res.send(err);
  }
});

app.get('/signup', (req,res) => res.render('pages/signup'));

app.get('/login', (req,res) => res.render('pages/login'));

app.post('/login', async (req,res) => {
  try {
    var email = req.body.email;
    var password = req.body.password;
    // gets the password from a given email
    var loginQuery = `select password from usr where exists (select * from usr where email='${email}')`;

    const client = await pool.connect();
    await client.query(loginQuery); 
    const passwordResult = {'results': (result) ? result.rows : null};

    if (passwordResult.length == 1 && passwordResult[0] == password) {
      console.log("login worked");
      res.render("pages/db");
    } else {
      // failed login
      console.log(results.length);
      res.redirect("pages/signup");
    }
    client.release();
  } catch (err) {
    res.send(err);
  }
});



app.listen(PORT, () => console.log(`Listening on ${ PORT }`));