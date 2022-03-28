var nodemailer = require('nodemailer');
const express = require('express');
const router = express.Router();
const path = require('path');
// var transporter = nodemailer.createTransport({
//     service: 'Test-Gmail',
//     auth: {
//         user: 'foobar@gmail.com',
//         pass: 'foobar'
//     },
//     tls: {
//         rejectUnauthorized: false
//     },
// });

var smtpConfig = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: 'vannekyle6@gmail.com',
        pass: 'psdPSD2022$$'
    }
};
var transporter = nodemailer.createTransport(smtpConfig);

// let mailOptions = {
//     from: 'Foo Bar ✔ <foobar@gmail.com>',
//     to: 'vannekyle6@gmail.com',
//     subject: "Hello Vanne",
//     text: 'Hello test text ✔',
//     // html: "<p>Hello " + req.body.email + " </p>",
//     // bcc: "fred@gmail.com"
// };

// transporter.sendMail(mailOptions, function(err, success){
//     if(err) {
//         console.log(err);
//     } else {
//         console.log('Message sent successfully!');
//         res.send(200);
//     }
// });

router.use(express.static(path.join(__dirname, '../public')));

router.post('/', (req,res) => {
    console.log('here we are');
    let mailOptions = {
        from: 'Foo Bar ✔ <foobar@gmail.com>',
        to: req.body.email,
        subject: "Hello " + req.body.email,
        text: 'Hello ' + req.body.email + '✔',
        html: "<p>Hello " + req.body.email + " </p>",
        bcc: "fred@gmail.com"
    };
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
        } else {
            console.log('Message sent successfully!');
            console.log('Message sent: ' + info.response);
            res.send(200);
        }
    });
});

// router.post('/',function(req,res){
    
// });

module.exports = router;