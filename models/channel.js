var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Create the channel schema
var channelSchema = new Schema({
  _id: String,
  name: String,
  thumbnail: String,
  avgVideoViews: Number,
  videos: Array
}, { timestamps: true});

// Create the model with the channel schema
var Channel = mongoose.model('Channel', channelSchema);

module.exports = Channel;
