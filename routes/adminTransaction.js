require('dotenv').config();
const express = require('express');
const router = express.Router();
const moment = require('moment');
const multer = require('multer');
const multerS3 = require('multer-s3');
const uuid = require('uuid').v4;
const aws = require('aws-sdk');
const { Pool } = require('pg');
const path = require('path');
const { resourceUsage } = require('process');
const {authUser, authAmdin} = require('./middleware');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// aws credientials
aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: 'us-west-2',
})

router.use(express.static(path.join(__dirname, '../public')));

/** Get all transactions */
router.get('/', authAmdin(), (req, res) => { 
  pool.query('select * from transaction', (error, result) => {
    if(error) {
      res.send(error)
    } else {
      let results = {'transactions' : result.rows};
      res.render('pages/transactions', results);
    } 
  })
})

module.exports = router;