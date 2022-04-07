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
        user: 'pmpgmbc.manage@gmail.com',
        pass: 'psdPSD22//'
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
    let mailOptions = {
        from: 'PMPGMBC Registration ✔ <PMPGMBC@gmail.com>',
        to: req.body.email,
        subject: "Church user verification for " + req.body.fName + " " + req.body.lName,
        text: 'Verification ' + req.body.fName + '✔',
        html: "<p>Thanks for registering PMPGMBC! Your email: " + req.body.email + " will be verified by our admin soon.</p>",
        bcc: "fred@gmail.com"
    };
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
        } else {
            console.log('Message sent successfully!');
            console.log('Message sent: ' + info.response);
            res.send("Thanks for your registration! Your account will be verified by our church admin. If the admin approved, you will receive an email notification.");
        }
    });
    mailOptions = {
        from: 'PMPGMBC Registration ✔ <PMPGMBC@gmail.com>',
        to: 'pmpgmbc.manage@gmail.com',
        subject: "Please verify a new user for " + req.body.fName + " " + req.body.lName,
        text: 'Verification for' + req.body.fName + '✔',
        html: "<h3> A new user, " + req.body.fName + " " + req.body.lName + ", just registered our church. Please verify the registration: " + req.body.email + " by clicking the following link.</h3>",
        bcc: "pmpgmbc.manage@gmail.com"
    };
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
        } else {
            console.log('Message sent to Admin user.');
            console.log('Message sent: ' + info.response);
        }
    });
});

// router.post('/',function(req,res){
    
// });

module.exports = router;