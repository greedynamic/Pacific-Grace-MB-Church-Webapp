require('dotenv').config();
const express = require('express');
const router = express.Router();
const {authUser, authAmdin} = require('./middleware');
const moment = require('moment');
const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
const uuid = require('uuid').v4;

// Database connection
const { Pool } = require('pg');
const path = require('path');
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

// Get storage in aws for videos
const BUCKET = process.env.S3_BUCKET;
const s3 = new aws.S3();
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: BUCKET,
        key: function (req, file, cb) {
            const ext = path.extname(file.originalname);
            cb(null, `${uuid()}${ext}`);
        }
    })
})


// Render upload video form
router.get('/upload', authAmdin(), (req,res) => res.render('pages/uploadVideo'));

router.post('/upload', authAmdin(), upload.single('video'), (req,res) => {
    if(req.file){
        var filepath = req.file.location;
        var filekey = req.file.key;
    }
    if(req.body.url){
        var url = req.body.url;
        var url_parts = url.split('/');
        var video_id = url_parts[3];
        var embed_url ="https://www.youtube.com/embed/" + video_id;
    }
    const {title, description, tag} = req.body;
    var valid_description = description.replace(/'/g, "''");
    const uploaded_at = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    const query = `INSERT INTO video VALUES ('${title}', '${valid_description}', '${tag}', '${uploaded_at}', '${filepath}', '${filekey}', '${embed_url}');`;
    pool.query(query, (error, result) =>{
        if(error)
            res.send(error);
        else{
            res.redirect('/');
        }
    })
})

// Get all videos uploaded
router.get('/', authAmdin(), (req, res) => {
    pool.query('SELECT * FROM video ORDER BY uploaded_at DESC;', (error, result) => {
        if(error)
            res.send(error);
        else{
            res.render('pages/allVideos', {'videos' : result.rows});
        }
    })
})

// Delete videos
router.post('/del/:title', authAmdin(), (req,res) => {
    var query = `SELECT * FROM video WHERE title='${req.params.title}';`;
    pool.query(query, (error,result) => {
        if(error){
          res.send(error);
        }  
        else{
            if(result.rows[0].filekey != 'undefined'){
                s3.deleteObject({Bucket: BUCKET, Key: result.rows[0].filekey}).promise();
            }
            pool.query(`DELETE FROM video WHERE title='${req.params.title}';`, (err)=>{
              if(err)
                res.send(err);
              else{
                res.redirect('/video');
            }
          })
        }  
    })
})

/** Render /blog/edit/:title to edit page */
router.get('/edit/:title', authAmdin(), (req,res) => {
    var query = `SELECT * FROM video WHERE title='${req.params.title}';`
    pool.query(query, (error, result) => {
        if(error)
          res.send(error);
        else{
          var results = {'videos' : result.rows};
          res.render('pages/editVideo', results);
        }
    })
})

/** Update blog edit in the blog table */
router.post('/edit/:title', upload.single('video'), (req,res) => {
    if(req.file){
      // Delete old files
      var query = `SELECT * FROM video WHERE title='${req.params.title}';`;
      pool.query(query, (error,result) => {
        if(error)
          res.send(error); 
        else{
          if(result.rows[0].filekey != 'undefined'){
            s3.deleteObject({Bucket: BUCKET, Key: result.rows[0].filekey}).promise();
          }
        }
      });  
      // Update new files
      var filepath = req.file.location;
      var filekey = req.file.key;
      pool.query(`UPDATE video SET filepath='${filepath}', filekey='${filekey}' where title='${req.params.title}';`, (err)=>{
        if(err)
          res.send(err);
      });
    }
    if(req.body.url){
        var url = req.body.url;
        var url_parts = url.split('/');
        var video_id = url_parts[3];
        var embed_url ="https://www.youtube.com/embed/" + video_id;
        pool.query(`UPDATE video SET url='${embed_url}' where title='${req.params.title}';`, (err)=>{
            if(err)
              res.send(err);
        });
    }
    const{title, description,tag} = req.body;
    // Replace ' with '' to prevent query from reading apostrophe as delimiter for input arguments
    var valid_description = description.replace(/'/g, "''");
    const updated_at = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    var editQuery = `UPDATE video SET title='${title}', description='${valid_description}', tag='${tag}', updated_at='${updated_at}' WHERE title='${req.params.title}';`;
    pool.query(editQuery, (error, result) =>{
      if(error)
          res.send(error);
      else{
          res.redirect('/video');
      }
    })
});

// See all archived videos
router.get('/archivedVideo', (req, res) => {
    pool.query('SELECT * FROM video ORDER BY uploaded_at DESC;', (error, result) => {
      if(error)
        res.send(error);
      else{
        res.render('pages/archivedVideos', {'videos' : result.rows});
      }
    })
});

module.exports = router;

