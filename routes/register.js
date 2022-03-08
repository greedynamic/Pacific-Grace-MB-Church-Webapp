const express = require('express');
const router = express.Router();
const {body, validationResult} = require('express-validator');
const { Pool } = require('pg');
const path = require('path');
const pool = new Pool({
    connectionString: 'postgres://wwiwookhmzbgif:b99fe28f9a5e30cdca56d64ce4165e8c1bf3f8a4fc1895b437043db9fa4ed35a@ec2-34-230-110-100.compute-1.amazonaws.com:5432/d329ha74afil4s',
    ssl: {
        rejectUnauthorized: false
    }
});

router.use(express.static(path.join(__dirname, '../public')));

router.get('/', (req,res) => res.render('pages/signup'));

router.get('/database', async (req, res) => {
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

router.post('/', [
    body('email', 'Email is not valid').exists().trim() .normalizeEmail().isEmail(),
    body('password', 'Password should be at least 6 characters').exists().isLength({min:6}),
    body('confirmPassword', 'Password do not match').exists().custom((value, {req}) => (value == req.body.password))
  ], (req,res) => {
    const errors = validationResult(req);
    if( !errors.isEmpty()){
      const alert = errors.array();
      res.render('pages/signup', {alert});
    }  
    else {
      const {firstName, lastName, email, password} = req.body;
      var registerQuery = `insert into usr values('${firstName}', '${lastName}', '${email}', '${password}')`;
      pool.query(registerQuery, (error, result) => {
          if(error)
            res.send(error);
          else{
            res.redirect("/database");
          }
      });
    }
});

module.exports = router;