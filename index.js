const express = require('express');
const res = require('express/lib/response');
const { redirect } = require('express/lib/response');
const blogRoute = require('./routes/adminBlog');
const path = require('path');
const PORT = process.env.PORT || 5000;
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://wwiwookhmzbgif:b99fe28f9a5e30cdca56d64ce4165e8c1bf3f8a4fc1895b437043db9fa4ed35a@ec2-34-230-110-100.compute-1.amazonaws.com:5432/d329ha74afil4s',
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

//needs testing
app.post('/signup', async (req,res) => {
  try {
    var firstName = req.body.fName;
    var lastName  = req.body.lName;
    var email = req.body.email;
    var password = req.body.password;
    // adds account to database, creating account
    var registerQuery = `insert into usr values('${firstName}', '${lastName}', '${email}', '${password}')`;

    const client = await pool.connect();
    await client.query(registerQuery); 
    res.render("pages/login");
    client.release();
  } catch (err) {
    res.send(err);
  }
})

app.get('/login', (req,res) => res.render('pages/login'));

app.post('/login', async (req,res) => {
  try {
    var email = req.body.email;
    var password = req.body.password;
    // gets the password from a given email
    var loginQuery = `select password from usr where exists (select * from usr where email='${email}')`;

    const client = await pool.connect();
    client.query(loginQuery);
    const passwordResult = res.rows[0];
    if (passwordResult == password) {
      res.render("pages/db", passwordResult);
    } else {
      res.redirect("/signup")
    }
    client.release();
  } catch (err) {
    res.end(err);
  }
    
});



app.listen(PORT, () => console.log(`Listening on ${ PORT }`));