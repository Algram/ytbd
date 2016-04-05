// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var passportLocalMongoose = require('passport-local-mongoose');

// create a schema
var userSchema = mongoose.Schema({
    username: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

// the schema is useless so far
// we need to create a model using it
var User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
module.exports = User;
