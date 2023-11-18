require('dotenv').config()

let mongoose = require('mongoose')

let databaseUrl = process.env.DATABASE_URL || `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}.v4bavd8.mongodb.net/${process.env.MONGO_DB_URL}?retryWrites=true&w=majority`

mongoose.connect(databaseUrl)
.then(console.log('connected'))
.catch(err =>{
    console.log(err)
})