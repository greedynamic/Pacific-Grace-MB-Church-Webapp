
const express = require('express')
const createBlogRouter = require('./routes/blogs/createBlog')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const path = require('path')
const PORT = process.env.PORT || 5000

dotenv.config();
mongoose.connect(process.env.BLOG_DATABASE_URI, {
  useNewUrlParser:true,
  useUnifiedTopology: true,
}).then(console.log("Connected to BlogDB")).catch((err) => console.log(err));

const app = express()
app.use(express.urlencoded({extended:false}))
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.get('/', (req, res) => res.render('pages/index'))


app.use('/blogs', createBlogRouter)

app.listen(PORT, () => console.log(`Listening on ${ PORT }`))