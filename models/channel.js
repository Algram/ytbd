var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var channelSchema = new Schema({
  _id: String,
  thumbnail: String,
  avgVideoViews: Number,
  videos: Array
});

channelSchema.virtual('name').get(function () {
  return this._id;
});

channelSchema.virtual('name').set(function (name) {
  this._id = name;
});

var Channel = mongoose.model('Channel', channelSchema);

module.exports = Channel;
