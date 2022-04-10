const mongoose = require('mongoose')

const DB = process.env.DATABASE
mongoose.connect(DB, {useNewUrlParser: true})
    .then(() => console.log('mongodb running on 27017'))
    .catch(err => console.log(err))
