const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgres://postgres:killllik@localhost/users' || process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

var app = express()
  
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())
app.use(express.urlencoded({extended:false}))

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.get('/', (req, res) => res.render('pages/index'))

app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
app.get('/login', (req, res) => res.render('pages/login'))
