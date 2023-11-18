require('dotenv').config()
let mongoose = require('mongoose')
let safe = require('bcryptjs')
let jwt = require('jsonwebtoken')

let Notes =new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'user' // name of the model from which we want foriegn key
    },
   title : String,
   description : String,
   tag : {
    type : Array,
   }
})





let iNotes = new mongoose.model('iNotes', Notes)

module.exports = iNotes;