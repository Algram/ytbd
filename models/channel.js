var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var channelSchema = new Schema({
  name: String,
  thumbnail: String,
  avgVideoViews: Number,
  videos: Array
});

var Channel = mongoose.model('Channel', channelSchema);

module.exports = Channel;
