require('dotenv').config();
const express = require('express');
const router = express.Router();
const path = require('path');

router.use(express.static(path.join(__dirname, '../public')));

/** The admin will verify a new user via '/newUserVerification' */
router.get('/', (req, res) => {
    res.render('pages/userVerification', res);
})

module.exports = router;