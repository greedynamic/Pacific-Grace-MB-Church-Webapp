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

/** Get all blogs in the blog table via '/blog' */
router.get('/', (req, res) => {
    pool.query('SELECT * FROM blog ORDER BY published_at DESC;', (error, result) => {
        if(error)
          res.send(error);
        else{
          var results = {'blogs' : result.rows};
          res.render('pages/allBlogs', results);
        }
    })
})

/** Create New Blog page via '/blog/new' */
router.get('/new', (req,res) => res.render('pages/newBlog'));

// Get storage in aws
const BUCKET = process.env.S3_BUCKET_NAME;
const s3 = new aws.S3();
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: BUCKET,
        acl: "public-read",
        key: function (req, file, cb) {
            const ext = path.extname(file.originalname);
            cb(null, `${uuid()}${ext}`);
        }
    })
})

/** Get blog components in the blog table
 *  Redirect to /allBlogs page 
 */
 router.post('/new', upload.single('image'), (req,res) => {
  if(req.file){
      var filepath = req.file.location;
      var filekey = req.file.key;
  }
  const{title, summary, content} = req.body;
  // Replace ' with '' to prevent query from reading apostrophe as delimiter for input arguments
  var valid_summary = summary.replace(/'/g, "''");
  var valid_content = content.replace(/'/g, "''");
  const date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
  var query = `INSERT INTO blog VALUES (DEFAULT, '${title}', '${valid_summary}', '${valid_content}', '${date}', '${filepath}', '${filekey}');`;
  pool.query(query, (error, result) => {
      if(error){
        res.send(error);
        console.log(error);
      }  
      else{
        res.redirect('/');
      }
  })
});


/** Delete blog */
router.post('/del/:title', (req,res) => {
  var query = `SELECT * FROM blog WHERE title='${req.params.title}';`;
  pool.query(query, (error,result) => {
      if(error){
        res.send(error);
      }  
      else{
        if(result.rows[0].filekey != 'undefined'){
          s3.deleteObject({Bucket: BUCKET, Key: result.rows[0].filekey}).promise();
        }
        pool.query(`DELETE FROM blog WHERE title='${req.params.title}';`, (err)=>{
            if(err)
              res.send(err);
            else{
              res.redirect('/blog/');
            }
        })
      }  
  })
})

/** Render /blog/edit/:title to edit page */
router.get('/edit/:title', (req,res) => {
    var query = `SELECT * FROM blog WHERE title='${req.params.title}';`
    pool.query(query, (error, result) => {
        if(error)
          res.send(error);
        else{
          var results = {'blogs' : result.rows};
          res.render('pages/editBlog', results);
        }
    })
})

/** Update blog edit in the blog table */
router.post('/edit/:title', upload.single('image'), (req,res) => {
  if(req.file){
    // Delete old files
    var query = `SELECT * FROM blog WHERE title='${req.params.title}';`;
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
    pool.query(`UPDATE blog SET filepath='${filepath}', filekey='${filekey}' where title='${req.params.title}';`, (err)=>{
      if(err)
        res.send(err);
    });
  };

  const{title, summary, content} = req.body;
  // Replace ' with '' to prevent query from reading apostrophe as delimiter for input arguments
  var valid_summary = summary.replace(/'/g, "''");
  var valid_content = content.replace(/'/g, "''");
  const updated_at = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

  var editQuery = `UPDATE blog SET title='${title}', summary='${valid_summary}', content='${valid_content}', updated_at='${updated_at}' WHERE title='${req.params.title}';`;
  pool.query(editQuery, (error, result) =>{
      if(error)
        res.send(error);
      else{
        res.redirect('/blog');
      }
  })
});

module.exports = router;