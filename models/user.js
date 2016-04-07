var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

// Create the user schema
var userSchema = mongoose.Schema({
    username: String,
    password: String
});

// Add passport-auth plugin to user schema
userSchema.plugin(passportLocalMongoose);

// Create the model with the user schema
var User = mongoose.model('User', userSchema);

module.exports = User;
