var Channel = require('../models/channel');

var ChannelController = {
  addChannel: function(channelObj) {
    var channel = new Channel(channelObj);
    channel.save();
  },
  getChannel: function(channelName, cb) {
    Channel.findOne({'name': channelName}).exec(function(err, res) {
      if (!err) {
        cb(res);
      } else {
        cb(NULL);
      }
    });
  }
};

module.exports = ChannelController;
