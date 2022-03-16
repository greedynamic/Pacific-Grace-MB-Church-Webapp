const express = require('express');
const router = express.Router();
const moment = require('moment');
const multer = require('multer');
const fs = require('fs');
const { Pool } = require('pg');
const path = require('path');
const res = require('express/lib/response');
const req = require('express/lib/request');
const pool = new Pool({
    connectionString: 'postgres://wwiwookhmzbgif:b99fe28f9a5e30cdca56d64ce4165e8c1bf3f8a4fc1895b437043db9fa4ed35a@ec2-34-230-110-100.compute-1.amazonaws.com:5432/d329ha74afil4s',
    ssl: {
        rejectUnauthorized: false
    }
});

router.use(express.static(path.join(__dirname, '../public')));

//Set storage of videos 
const storage = multer.diskStorage({
    destination: './public/videos',
    filename: function(req, file, cb){
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    },
    fileFilter: function(file,cb){
        const videoext = file.mimetype.startsWith('video/');
        if(videoext){
            cb(null,true);
        }
        else{
            cb('File not supported. Videos Only');
        }
    }
})

// Upload video function
const upload = multer({
    storage : storage,
}).single('video');


// Render upload video form
router.get('/upload', (req,res) => res.render('pages/uploadVideo'));

router.post('/upload', (req,res) => {
    upload(req, res, (err) => {
        if(err)
            res.render('pages/uploadVideo', {msg: err});
        else{
            const filename = req.file.filename;
            const filepath = req.file.path;
            const {title, description, tag} = req.body;
            const uploaded_at = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
            const query = `INSERT INTO video VALUES ('${filename}', '${title}', '${description}', '${tag}', '${uploaded_at}', '${filepath}');`;
            pool.query(query, (error, result) =>{
                if(error)
                    res.send(error);
                else{
                    res.redirect('/');
                }
            })
        }
    })
})

// Get all videos uploaded
router.get('/', (req, res) => {
    pool.query('SELECT * FROM video ORDER BY uploaded_at DESC;', (error, result) => {
        if(error)
            res.send(error);
        else{
            res.render('pages/allVideos', {'videos' : result.rows});
        }
    })
})

// Delete videos
router.post('/del/:title', (req,res) => {
    var query = `SELECT * FROM video WHERE title='${req.params.title}';`;
    pool.query(query, (error,result) => {
        if(error){
          res.send(error);
        }  
        else{
          const filepath = result.rows[0].filepath;
          console.log(filepath);
          fs.unlinkSync(filepath);
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

module.exports = router;

