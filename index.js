require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const res = require('express/lib/response');
const { redirect } = require('express/lib/response');
const blogRoute = require('./routes/adminBlog');
const emailRoute = require('./email-nodeapp/emailVerify');
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

// Google Auth
const {OAuth2Client} = require('google-auth-library');
const CLIENT_ID = '376022680662-nh9ojhptesh79cstivj8u2f0stfrs2k2.apps.googleusercontent.com'
const client = new OAuth2Client(CLIENT_ID);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cookieParser());
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
app.use('/sendVerification', emailRoute);

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
        errors.push({message: "Email address is invalid."});
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
  let token = req.body.token;
  console.log(token);
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
  }
  verify()
  .then(()=>{
    req.session.user = {fname:'OAuth', lname:'Go',
      email:'Google User', password:'g@g.c', admin:'f'};
      res.cookie('session-token', token);
      res.send('success')
  })
  .catch(console.error);
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

app.get('/profile', checkAuthenticated, (req, res)=>{
  let user = req.user;
  res.render('profile', {user});
})

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

function checkAuthenticated(req, res, next){
  let token = req.cookies['session-token'];

  let user = {};
  async function verify() {
      const ticket = await client.verifyIdToken({
          idToken: token,
          audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
      });
      const payload = ticket.getPayload();
      user.name = payload.name;
      user.email = payload.email;
      user.picture = payload.picture;
    }
    verify()
    .then(()=>{
        req.user = user;
        next();
    })
    .catch(err=>{
        res.redirect('/login')
    })

}

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));


/*
const express = require('express');
const metadata = require('gcp-metadata');
const {OAuth2Client} = require('google-auth-library');

const app = express();
const oAuth2Client = new OAuth2Client();

// Cache externally fetched information for future invocations
let aud;

async function audience() {
  if (!aud && (await metadata.isAvailable())) {
    let project_number = await metadata.project('numeric-project-id');
    let project_id = await metadata.project('project-id');

    aud = '/projects/' + project_number + '/apps/' + project_id;
  }

  return aud;
}

async function validateAssertion(assertion) {
  if (!assertion) {
    return {};
  }

  // Check that the assertion's audience matches ours
  const aud = await audience();

  // Fetch the current certificates and verify the signature on the assertion
  const response = await oAuth2Client.getIapPublicKeys();
  const ticket = await oAuth2Client.verifySignedJwtWithCertsAsync(
    assertion,
    response.pubkeys,
    aud,
    ['https://cloud.google.com/iap']
  );
  const payload = ticket.getPayload();

  // Return the two relevant pieces of information
  return {
    email: payload.email,
    sub: payload.sub,
  };
}

app.get('/', async (req, res) => {
  const assertion = req.header('X-Goog-IAP-JWT-Assertion');
  let email = 'None';
  try {
    const info = await validateAssertion(assertion);
    email = info.email;
  } catch (error) {
    console.log(error);
  }
  res.status(200).send(`Hello ${email}`).end();
});


// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
*/
