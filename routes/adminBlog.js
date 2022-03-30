const express = require('express');
const router = express.Router();
const moment = require('moment');
const multer = require('multer');
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


router.get('/homepage', (req, res) => {
  pool.query('SELECT * FROM blog;', (error, result) => {
      if(error)
        res.send(error);
      else{
        var results = {'blogs' : result.rows};
        res.render('pages/blogHome', results);
      }
  })
})

/** Create New Blog page via '/blog/new' */
router.get('/new', (req,res) => res.render('pages/newBlog'));


/** Set up storage for image files */
const storage = multer.diskStorage({
  destination: './public/blogImages/',
  filename: function(req, file, cb){
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
  fileFilter: function(file,cb){
      const image_ext = file.mimetype.startsWith('image/');
      if(image_ext){
          cb(null,true);
      }
      else{
          cb('File not supported. Images Only');
      }
  }
})

// Upload image function
const upload = multer({
  storage : storage,
}).single('image');

/** Get blog components in the blog table
 *  Redirect to /allBlogs page 
 */
router.post('/', (req,res) => {
  upload(req, res, (err) => {
    if(err)
        res.render('pages/newBlog', {msg: err});
    else{
        if(req.file){
          var filename = req.file.filename;
          var filepath = req.file.path;
        }
        const{title, summary, content} = req.body;
        // Replace ' with '' to prevent query from reading apostrophe as delimiter for input arguments
        var valid_summary = summary.replace(/'/g, "''");
        var valid_content = content.replace(/'/g, "''");
        const date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
        var query = `INSERT INTO blog VALUES (DEFAULT, '${title}', '${valid_summary}', '${valid_content}', '${date}', '${filename}', '${filepath}');`;
        pool.query(query, (error, result) => {
            if(error){
              res.send(error);
              console.log(error);
            }  
            else{
              res.redirect('/');
            }
        })
    }
  })
});

/** Delete blog */
router.post('/del/:title', (req,res) => {
    var query = `DELETE FROM blog WHERE title='${req.params.title}'`;
    pool.query(query, (error,result) => {
        if(error){
          res.send(error);
        }  
        else{
          res.redirect('/blog/');
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
router.post('/edit/:title', (req,res) => {
  upload(req, res, (err) => {
    if(err)
        res.render('pages/newBlog', {msg: err});
    else{
        if(req.file){
          // Delete old files
          var query = `SELECT * FROM blog WHERE title='${req.params.title}';`;
          pool.query(query, (error,result) => {
            if(error)
              res.send(error); 
            else{
              if(result.rows[0].filepath != 'undefined')
                fs.unlinkSync(result.rows[0].filepath);
            }
          });  
          // Update new files
          var filename = req.file.filename;
          var filepath = req.file.path;
          pool.query(`UPDATE blog SET filename='${filename}', filepath='${filepath} where title='${req.params.title}';`, (err)=>{
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
    }
  }); 
});

module.exports = router;