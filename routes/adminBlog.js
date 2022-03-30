require('dotenv').config();
const express = require('express');
const router = express.Router();
const {authUser, authAdmin} = require('./middleware');
const moment = require('moment');
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const uuid = require('uuid').v4;
const fs = require('fs');

const { Pool } = require('pg');
const path = require('path');
const pool = new Pool({
    connectionString: 'postgres://wwiwookhmzbgif:b99fe28f9a5e30cdca56d64ce4165e8c1bf3f8a4fc1895b437043db9fa4ed35a@ec2-34-230-110-100.compute-1.amazonaws.com:5432/d329ha74afil4s',
    ssl: {
        rejectUnauthorized: false
    }
});

router.use(express.static(path.join(__dirname, '../public')));

aws.config.update({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.ACCESS_SECRET,
  region: process.env.REGION,
})
const BUCKET = process.env.BUCKET;
const s3 = new aws.S3();

/** Get all blogs in the blog table via '/blog' */
router.get('/', authAdmin(), (req, res) => {
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
router.get('/new', authAdmin(), (req,res) => res.render('pages/newBlog'));

/** Set up storage for images on AWS S3 */
const upload = multer({
  storage: multerS3({
    bucket: BUCKET,
    s3: s3,
    key: (req,file, cb) =>{
      const ext = path.extname(file.originalname);
      cb(null,`${uuid()}${ext}`);
    },
  })
})

/** Upload image and save its location in S3 to database for further use(displaying) */
router.post('/', authAdmin(), upload.single('image'), (req,res)=>{
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
})

/** View each blog page (Read More) */
router.get('/:title', (req,res) => {
  var getBlogQuery = `SELECT * FROM blog WHERE title='${req.params.title}';`;
  pool.query(getBlogQuery, (error, result) =>{
      if(error)
          res.send(error);
      else{
          res.render('pages/showBlog', {'blogs': result.rows, 'user': req.session.user});
      }
  })
})

/** Render /blog/edit/:title to edit page */
router.get('/edit/:title', authAdmin(), (req,res) => { 
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
router.post('/edit/:title', authAdmin(), upload.single('image'), (req,res) => {
  if(req.file){
    console.log(req.file);
    // Delete old image
    var query = `SELECT * FROM blog WHERE title='${req.params.title}';`;
    pool.query(query, (error,result) => {
      if(error)
        res.send(error); 
      else{
        if(result.rows[0].filekey != 'undefined'){
            const deleteParams = {
              Bucket: BUCKET,
              Key: result.rows[0].filekey
            }
            try{
              s3.deleteObject(deleteParams).promise();
            }catch(err){
              console.log(err);
            }
        }
      }
    });  
    // Update new image
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

/** Delete blog */
router.post('/del/:title', (req,res) => {
  var query = `SELECT * FROM blog WHERE title='${req.params.title}';`;
  pool.query(query, (error,result) => {
      if(error){
        res.send(error);
      }  
      else{
        if(result.rows[0].filekey != 'undefined'){
          const deleteParams = {
            Bucket: BUCKET,
            Key: result.rows[0].filekey
          }
          try{
            s3.deleteObject(deleteParams).promise();
          }catch(err){
            console.log(err);
          }
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


module.exports = router;