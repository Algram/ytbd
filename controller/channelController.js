var Channel = require('../models/channel');

var ChannelController = {
  addChannel: function(channelObj) {
    var channel = new Channel(channelObj);
    channel.save();
  },
  removeChannel: function(channelId, cb) {
    Channel.findOne({'_id': channelId}).exec(function(err, ch) {
      ch.remove(function () {
        cb();
      });
    });
  },
  getChannel: function(channelId, cb) {
    Channel.findOne({'_id': channelId}).exec(function(err, res) {
      if (!err) {
        cb(res);
      } else {
        cb(NULL);
      }
    });
  },
  updateChannel: function(channelObj) {
    Channel.findOneAndUpdate(
      {'_id': channelObj._id},
      channelObj,
      function(err, doc){
        if (err) return console.log(err);
      });
  },
  exists: function(channelId, cb) {
    Channel.count({'_id': channelId}).exec(function(err, count) {
      //If count > 0 return true, else false
      var found = (count > 0) ? true : false;
      cb(found);
    });
  },
  getChannelInfo: function(cb) {
    Channel.find({},{'videos': 0, '__v': 0 }).exec(function(err, res) {
      var channelInfo = [];
      for (var i = 0; i < res.length; i++) {
        var channel = res[i];
        channelInfo.push({
          _id: channel._id,
          name: channel.name,
          thumbnail: channel.thumbnail,
          avgVideoViews: channel.avgVideoViews
        });
      }

      cb(channelInfo);
    });
  }
};

module.exports = ChannelController;
