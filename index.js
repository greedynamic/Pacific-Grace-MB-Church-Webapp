require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const res = require('express/lib/response');
const { redirect } = require('express/lib/response');
const blogRoute = require('./routes/adminBlog');
const videoRoute = require('./routes/adminVideo');
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
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const { v4: uuidV4 } = require('uuid');
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true
});

const flash = require('express-flash')
const session = require('express-session')
const bcrypt = require('bcrypt')
const passport = require('passport');
const {authUser, authAmdin} = require('./routes/middleware');
const { database } = require('pg/lib/defaults');
const users = [];

// Google Auth
const {OAuth2Client} = require('google-auth-library');
const CLIENT_ID = '376022680662-meru43h5tvg8i8qfeii49bjuj2rbi5qe.apps.googleusercontent.com'
const client = new OAuth2Client(CLIENT_ID);

app.use(express.static(path.join(__dirname, '/public')));
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
app.use('/video', videoRoute);
app.use('/sendVerification', emailRoute);

app.get('/', (req,res) => {
  // Post recent blogs on homepage
  var query = "SELECT * FROM blog ORDER BY published_at DESC; SELECT * FROM video ORDER BY uploaded_at DESC LIMIT 1;";

  pool.query(query, (error, result) => {
    if(error)
      res.send(error);
    else{
      res.render('pages/homepage', {'blogs' : result[0].rows, 'videos' : result[1].rows, user: req.session.user});
    }
  })
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

app.get('/roombooking', (req, res) =>{
  res.render('pages/roombooking');
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
        const registerQuery = `insert into usr values('${firstName}', '${lastName}', '${email}', '${password}', false)`;
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
  // console.log(token);
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

app.get('/logout', (req,res) => {
  req.session.destroy();
  res.redirect('/');
})

app.get('/profile', checkAuthenticated, (req, res)=>{
  let user = req.user;
  res.render('profile', {user});
})

app.get('/account', (req,res) => {
  if(req.session.user){
    res.render('pages/account', {user:req.session.user});
  } else {
    res.redirect('/login');
  }
})

app.post('/account', async (req,res) =>{
  var buttonValue = req.body.button;

  if (buttonValue == "delete") {
    try {
      const client = await pool.connect();
      const email = req.session.user.email;
      await client.query(`delete from usr where email='${email}'`);
      res.redirect('/logout');
      client.release();
    } catch (err) {
      res.send(err);
    }
  } else if(buttonValue == "edit") {
    res.redirect('/account/edit');
  } else {
    res.redirect('/account');
  }
})

app.get('/account/edit', (req,res) => {
  if(req.session.user){
    res.render('pages/editAccount', {user: req.session.user});
  } else {
    res.redirect('/');
  }
})

app.post('/account/edit', async (req,res) => {
  try{
    const oldEmail = req.session.user.email;
    const fname = req.body.fName;
    const lname = req.body.lName;
    const email = req.body.email;
    const password = req.body.password;
    const updateQuery = `update usr set fname='${fname}', lname='${lname}', email='${email}',
      password='${password}' where email='${oldEmail}'`;

    const client = await pool.connect();
    await client.query(updateQuery);
    req.session.user = {fname:fname, lname:lname, email:email, password:password, admin:req.session.user.admin};
    res.redirect('/account');
  } catch (err){
    res.send(err);
  }
})

app.get('/blogs/:title', (req,res) => {
  var getBlogQuery = `SELECT * FROM blog WHERE title='${req.params.title}';`;
  pool.query(getBlogQuery, (error, result) =>{
      if(error)
          res.send(error);
      else{
          res.render('pages/showBlog', {'blogs': result.rows, user: req.session.user});
      }
  })
})

app.use('/peerjs', peerServer);

app.get('/meeting', (req,res) => {
  if (req.session.user) {
    res.render('pages/meeting');
  } else {
    res.redirect('/login')
  }
})

app.get('/meeting/room', (req,res) => {
  if (req.session.user) {
    res.redirect(`/meeting/room/${uuidV4()}`);
  } else {
    res.redirect('/login')
  }
})

//render unique room
app.get('/meeting/room/:room', (req,res) => {
  if (req.session.user) {
    res.render('pages/room', {roomId: req.params.room, user: req.session.user});
  } else {
    res.redirect('/login')
  }
})

// Handles communication between client and server
io.of("/room").on('connection', socket => {
  socket.on('join-room', async (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', userId);
    // Add room to activemeetings
    try {
      const client = await pool.connect();
      const meetingQuery = `select * from activemeetings where id='${roomId}'`;
      const result = await client.query(meetingQuery);
      if (result.rowCount == 0) {
        await client.query(`insert into activemeetings values('${roomId}')`);
      }
      client.release();
    } catch (err) {
      res.send(err);
    }
    socket.on('chat-message', (msg) => {
      io.of("/room").emit('chat-message', msg);
    });
    socket.on('disconnect', async () => {
      socket.to(roomId).emit('user-disconnected', userId);
      // Remove room from activemeetings
      try {
        const client = await pool.connect();
        await client.query(`delete from activemeetings where id='${roomId}'`);
        client.release();
      } catch (err) {
        res.send(err);
      }
    });
  });
});

// Checks if meeting exists with room id and joins if it does
app.post("/meeting", async (req,res) => {
  const roomId = req.body.roomId;
  const meetingQuery = `select * from activemeetings where id='${roomId}'`;
  let errors = [];

  try {
    const client = await pool.connect();
    const result = await client.query(meetingQuery);
    if (result.rowCount == 1) {
      res.redirect(`/meeting/room/${roomId}`);
    } else {
      errors.push({message: "Meeting code does not exist!"});
      res.render('pages/meeting', {errors});
    }
    client.release();
  } catch (err) {
    res.send(err);
  }
});

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

server.listen(PORT, () => console.log(`Listening on ${ PORT }`));

 
