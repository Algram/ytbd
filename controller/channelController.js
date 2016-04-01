var Channel = require('../models/channel');

var ChannelController = {
  addChannel: function(channelObj) {
    var channel = new Channel(channelObj);
    channel.save();
  },
  getChannel: function(channelName, cb) {
    Channel.findOne({'_id': channelName}).exec(function(err, res) {
      if (!err) {
        cb(res);
      } else {
        cb(NULL);
      }
    });
  },
  exists: function(channelName, cb) {
    Channel.count({'_id': channelName}).exec(function(err, count) {
      //If count > 0 return true, else false
      var found = (count > 0) ? true : false;
      cb(found);
    });
  },
  getAllChannelNames: function(cb) {
    Channel.find({},{'thumbnail': 0, 'avgVideoViews': 0, 'videos': 0, '__v': 0 }).exec(function(err, res) {
      var channelNames = [];
      for (var i = 0; i < res.length; i++) {
        var channel = res[i];
        channelNames.push(channel._id);
      }

      cb(channelNames);
    });
  }
};

module.exports = ChannelController;
