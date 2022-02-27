const express = require('express');
const router = express.Router();
const moment = require('moment');
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: 'postgres://wwiwookhmzbgif:b99fe28f9a5e30cdca56d64ce4165e8c1bf3f8a4fc1895b437043db9fa4ed35a@ec2-34-230-110-100.compute-1.amazonaws.com:5432/d329ha74afil4s',
    ssl: {
        rejectUnauthorized: false
    }
});

/** Get all blogs in the blog table via '/blog' */
router.get('/', (req, res) => {
    pool.query('SELECT * FROM blog;', (error, result) => {
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

/** Show content of a blog via '/blog/:title' */
router.get('/:title', (req,res) => {
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

/** Get blog components in the blog table
 *  Redirect to /allBlogs page or homepage 
 */
router.post('/', (req,res) => {
    const{title, summary, content} = req.body;
    const date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    var query = `INSERT INTO blog VALUES (DEFAULT, '${title}', '${summary}', '${content}', '${date}');`;
    pool.query(query, (error, result) => {
        if(error){
          res.send(error);
          console.log(error);
        }  
        else{
          res.redirect('/blog/');
        }
    });
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
    const{title, summary, content} = req.body;
    const updated_at = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    var editQuery = `UPDATE blog SET title='${title}', summary='${summary}', content='${content}', updated_at='${updated_at}' WHERE title='${req.params.title}';`;
    pool.query(editQuery, (error, result) =>{
        if(error)
          res.send(error);
        else{
          res.redirect('/blog');
        }
    })
})

module.exports = router;