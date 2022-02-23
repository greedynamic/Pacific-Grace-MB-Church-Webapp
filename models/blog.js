const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: false
    },
    content: {
        type: String,
        required:true
    },
    dateCreate: {
        type: Date,
        default: Date.now
    }
})  

module.exports = mongoose.model('Blog',blogSchema)