var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Create the channel schema
var channelSchema = new Schema({
  _id: String,
  thumbnail: String,
  avgVideoViews: Number,
  videos: Array
}, { timestamps: true});

// Virtual for aliasing name to _id for get
channelSchema.virtual('name').get(function () {
  return this._id;
});

// Virtual for aliasing name to _id for set
channelSchema.virtual('name').set(function (name) {
  this._id = name;
});

var Channel = mongoose.model('Channel', channelSchema);

module.exports = Channel;
