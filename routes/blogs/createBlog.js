const express = require('express');
const Blog = require('../../models/blog');
const router = express.Router();

router.get('/new', (req, res) => {
    res.render('pages/blogs/new', { blog : new Blog() })
})

router.post('/', async(req,res) =>{
    let blog = new Blog({
        title: req.body.title,
        category: req.body.category,
        content: req.body.content,
    })
    try {
        blog = await blog.save()
        res.redirect(`/blogs/${blog.id}`)
    } catch (error) {
        res.render('pages/blogs/new', {blog:blog});
    }
})

router.get('/:id', async(req,res) => {
    const blog = await Blog.findById(req.params.id)
    if(blog == null) res.redirect('/')
    res.render('pages/blogs/showBlog', {blog:blog})
})

module.exports = router