require('dotenv').config();
var nodemailer = require('nodemailer');
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const res = require('express/lib/response');
const { redirect } = require('express/lib/response');
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));
const moment = require('moment');
const blogRoute = require('./routes/adminBlog');
const videoRoute = require('./routes/adminVideo');
const transactionRoute = require('./routes/adminTransaction');
const emailRoute = require('./email-nodeapp/emailVerify');
const newUserVerifyRoute = require('./email-nodeapp/newUserVerify')
const path = require('path');
const PORT = process.env.PORT || 5000;
const { Pool } = require('pg');
const req = require('express/lib/request');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
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
const session = require('express-session')
const {authUser, authAdmin} = require('./routes/middleware');
const {Users} = require('./public/roomUsers');
var roomUsers = new Users();

// Google Auth
const {OAuth2Client} = require('google-auth-library');
const CLIENT_ID = '376022680662-meru43h5tvg8i8qfeii49bjuj2rbi5qe.apps.googleusercontent.com'
const client = new OAuth2Client(CLIENT_ID);

const smtpConfig = {
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // use SSL
  auth: {
      user: 'pmpgmbc.manage@gmail.com',
      pass: 'psdPSD22//'
  }
};
const transporter = nodemailer.createTransport(smtpConfig);

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
app.use('/peerjs', peerServer);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/blog', authAdmin(), blogRoute);
app.use('/video', videoRoute);
app.use('/sendVerification', emailRoute);
app.use('/newUserVerification', authAdmin(), newUserVerifyRoute);
app.use('/transactions', transactionRoute);

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

app.get('/contact', (req, res) =>{
  res.render('pages/contact');
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
        const registerQuery = `insert into usr values('${firstName}', '${lastName}', '${email}', '${password}', false, false)`;
        await client.query(registerQuery);
        let mailOptions = {
          from: 'PMPGMBC Registration ✔ <PMPGMBC@gmail.com>',
          to: req.body.email,
          subject: "Church user verification for " + req.body.fName + " " + req.body.lName,
          text: 'Verification ' + req.body.fName + '✔',
          html: "<p>Thanks for registering PMPGMBC! Your email: " + req.body.email + " will be verified by our admin soon.</p>",
          bcc: "fred@gmail.com"
        };
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                console.log(error);
            } else {
                console.log('Message sent successfully!');
                console.log('Message sent: ' + info.response);
            }
        });
        mailOptions = {
            from: 'PMPGMBC Registration ✔ <PMPGMBC@gmail.com>',
            to: 'pmpgmbc.manage@gmail.com',
            subject: "Please verify a new user for " + req.body.fName + " " + req.body.lName,
            text: 'Verification for' + req.body.fName + '✔',
            html: "<h3> A new user, " + req.body.fName + " " + req.body.lName + ", just registered our church. Please verify the registration: " + req.body.email + " by clicking the following link.</h3> <h4>https://church276.herokuapp.com/newUserVerification</h4>",
            bcc: "pmpgmbc.manage@gmail.com"
        };
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                console.log(error);
            } else {
                console.log('Message sent to Admin user.');
                console.log('Message sent: ' + info.response);
            }
        });
        res.send("Thanks for your registration! Your account will be verified by our church admin. If the admin approved, you will receive an email notification.");
        // res.redirect('/');
        client.release();
      } else {
        res.render('pages/signup', {errors});
      }
  } catch (err) {
    res.send(err);
  }
})

app.post('/verified', async (req,res) => {
  const fname = req.body.fName;
  const lname = req.body.lName;
  const email = req.body.email;
  const verifiedQuery = `update usr set is_verified=true where fname='${fname}' and lname='${lname}' and email='${email}'`;

  try{
      const client = await pool.connect();
      await client.query(verifiedQuery);
      // req.session.user = {fname:fname, lname:lname, email:email, password:password, admin:req.session.user.admin};
      // res.redirect('/');
      let mailOptions = {
        from: 'PMPGMBC Registration ✔ <PMPGMBC@gmail.com>',
        to: email,
        subject: "Church user verification for " + req.body.fName + " " + req.body.lName,
        text: 'Verification ' + req.body.fName + '✔',
        html: "<h2>Thanks for registering PMPGMBC! Your email: " + req.body.email + " has been verified. You could perform as a registered user in the PMPGMBC church web.</h2>",
      };
      transporter.sendMail(mailOptions, function(error, info){
          if(error){
              console.log(error);
          } else {
              console.log('Verified message sent successfully!');
              console.log('Verified message sent: ' + info.response);
          }
      });
      res.send(fname + ' ' + lname + ' has been verified!')
  } catch (err){
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

app.get('/donate', (req,res) => {
  res.render('pages/donate', {paypalClientId: process.env.PAYPAL_CLIENT_ID});
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
  const oldEmail = req.session.user.email;
  const fname = req.body.fName;
  const lname = req.body.lName;
  const email = req.body.email;
  const password = req.body.password;
  const updateQuery = `update usr set fname='${fname}', lname='${lname}', email='${email}',
    password='${password}' where email='${oldEmail}'`;

  try{
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

// Get video page
app.get('/videos/:title', (req,res)=>{
  pool.query(`SELECT * FROM video WHERE title='${req.params.title}';`, (error, result) =>{
      if(error)
          res.send(error);
      else{
          res.render('pages/showVideo', {'videos': result.rows});
      }
  })
})

app.get('/meeting', async (req,res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(`select * from activemeetings where public=true`);
    const results = {'results': (result) ? result.rows : null};
    if (req.session.user) {
      res.render('pages/meeting', results);
    } else {
      res.redirect('/login')
    }
  } catch(err) {
    res.send(err);
  }
})

app.get('/meeting/code', (req,res) => {
  if (req.session.user) {
    let errors = [];
    res.render('pages/meetingCode', errors);
  } else {
    res.redirect('/login')
  }
})

app.post('/meeting/code', async (req,res) => {
  let code = req.body.roomId;
  let errors = [];
  try {
    const client = await pool.connect();
    const meetingQuery = `select * from activemeetings where id='${code}'`;
    const result = await client.query(meetingQuery);
    if (result.rowCount == 0) {
      errors.push({message: "Meeting code does not exist!"});
      res.render('pages/meetingCode', {errors});
    } else {
      res.redirect(`/meeting/room/${code}`);
    }
    client.release();
  } catch (err) {
    res.send(err);
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
  socket.on('join-room', async (roomId, userId, name) => {
    socket.join(roomId);
    roomUsers.removeUser(userId);
    roomUsers.addUser(userId, name, roomId);
    io.of("/room").to(roomId).emit('updateUsersList', roomUsers.getUserList(roomId));
    io.of("/room").to(roomId).emit('user-connected', userId);
    socket.on('send-chat-message', (msg) => {
      io.of("/room").to(roomId).emit('chat-message', msg, name);
    });
    socket.on('disconnect', async () => {
      let roomUser = roomUsers.removeUser(userId);
      if (roomUser) {
        io.of("/room").to(roomId).emit('updateUsersList', roomUsers.getUserList(roomId));
        io.of("/room").to(roomId).emit('user-disconnected', userId);
        // Remove room from activemeetings
        if (roomUsers.getUserList(roomId).length == 0) {
          try {
            const client = await pool.connect();
            await client.query(`delete from activemeetings where id='${roomId}'`);
            client.release();
          } catch (err) {
            res.send(err);
          }
        }
      }
    });
  });
});

app.get('/meeting/public', async (req,res) => {
  try {
    const roomId = uuidV4();
    const fName = req.session.user.fname;
    const meetingName = `${fName} s meeting`; 
    await pool.query(`insert into activemeetings values('${roomId}', 1, '${meetingName}', true)`);
    res.redirect(`/meeting/room/${roomId}`);
  } catch (err) {
    res.send(err);
  }
})

app.get('/meeting/private', async (req,res) => {
  try {
    const roomId = uuidV4();
    const fName = req.session.user.fname;
    const meetingName = `${fName} s meeting`; 
    await pool.query(`insert into activemeetings values('${roomId}', 1, '${meetingName}', false)`);
    res.redirect(`/meeting/room/${roomId}`);
  } catch (err) {
    res.send(err);
  }
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

/** DONATION */

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env; // change client_id and client_secret of real business if want to go live
const base = "https://api-m.sandbox.paypal.com"; // if want to go live transaction, use "https://api-m.paypal.com"

// capture payment & store order information or fullfill order
app.post("/api/orders/:orderID/capture", async (req, res) => {
  const { orderID } = req.params;
  const captureData = await capturePayment(orderID);
  res.json(captureData);
  // TODO: store payment information such as the transaction ID
  const isShared = req.body.shareInfo;
  var name, email;  
  if(isShared == 'yes'){
     name = captureData.payer.name.given_name + " " + captureData.payer.name.surname;
     email = captureData.payer.email_address;
  } 
  else{
    name = 'anonymous';
    email = 'anonymous';
  }
  const amount = captureData.purchase_units[0].payments.captures[0].amount.value;
  const created_at =  moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

  var query = `INSERT INTO transaction VALUES ('${name}', '${email}', ${amount}, '${created_at}')`;
  pool.query(query, (error, result) => {
    if(error)
      res.send(error)
    else{
      console.log("success");
    }
  })
});


// use the orders api to capture payment for an order
async function capturePayment(orderId) {
  const accessToken = await generateAccessToken();
  const url = `${base}/v2/checkout/orders/${orderId}/capture`;
  const response = await fetch(url, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  return data;
}

// generate an access token using client id and app secret
async function generateAccessToken() {
  const auth = Buffer.from(PAYPAL_CLIENT_ID + ":" + PAYPAL_CLIENT_SECRET).toString("base64")
  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: "post",
    body: "grant_type=client_credentials",
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });
  const data = await response.json();
  return data.access_token;
}

server.listen(PORT, () => console.log(`Listening on ${ PORT }`));