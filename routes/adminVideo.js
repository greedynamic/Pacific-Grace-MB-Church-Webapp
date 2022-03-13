const express = require('express');
const router = express.Router();
const moment = require('moment');
const formidable = require('formidable');
const fileSystem = require('fs');
const { getVideoDuration } = require('get-video-duration'); 
const { Pool } = require('pg');
const path = require('path');
const pool = new Pool({
    connectionString: 'postgres://wwiwookhmzbgif:b99fe28f9a5e30cdca56d64ce4165e8c1bf3f8a4fc1895b437043db9fa4ed35a@ec2-34-230-110-100.compute-1.amazonaws.com:5432/d329ha74afil4s',
    ssl: {
        rejectUnauthorized: false
    }
});

router.use(express.static(path.join(__dirname, '../public')));

router.get('/upload', (req,res) => res.render('pages/uploadVideo'));

router.post('/upload', (req,res) => {
    var formData = new formidable.IncomingForm();
    formData.maxFileSize = 1000 * 1024 * 1024;
    formData.parse(req, function(error, fields, files) {
        var title = fields.title;
        var description = fields.description;
        var tag = fields.tags;
        var date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
        var oldPathVideo = files.video.path;
        var newPath = 'public/videos/' + new Date().getTime() + '-' + files.video.name;
        fileSystem.rename(oldPathVideo, newPath);
            /*getVideoDuration(newPath).then(function(duration){
                var hours = Math.floor(duration/60/60);
                var minutes = Math.floor(duration/60) - (hours*60);
                var seconds = Math.floor(duration % 60);*/

               
            //});
        var query = `INSERT INTO video VALUES ('${newPath}', '${title}', '${description}', '${tag}', '${date}');`;
        pool.query(query, (error)=>{
            if(error){
                res.send(error);
            }
            else{
                res.redirect('/');
            }
        })
    })
})

module.exports = router;

