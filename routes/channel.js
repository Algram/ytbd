var express = require('express');
var router = express.Router();

//Load all the things necessary for the api
var google = require('googleapis');
var youtube = google.youtube('v3');
var api = require('../config/youtube_api');

//Get ChannelController
var channelController = require('../controller/channelController');

/* GET video listing for a channel. */
router.get('/', function(req, res, next) {
  if (req.query.name !== undefined) {
    channelController.getChannel(req.query.name, function(channel) {
      res.send(channel);
    });
    
    getChannel(req.query.name, function(channel) {
      //if channel exists in db and has no new vids, get it from there
      // else load new and updated_at
      // if not exists, create new

      channelController.addChannel(channel);
    });
  } else {
    res.send();
  }
});


//TODO add error handling (channel has no videos)
function getChannel(channelName, cb) {
  var cumVideoViews = 0;
  var numOfVideos = 50;

  var channel = {
    name: channelName,
    thumbnail: '',
    avgVideoViews: 0,
    videos: []
  };

  //Get channel with channelName
  youtube.channels.list({ auth: api.key, part: 'contentDetails, snippet', forUsername: channelName}, function(err, data) {
    var uploadPlaylistId = data.items[0].contentDetails.relatedPlaylists.uploads;

    //Set channel thumbnail
    channel.thumbnail =  data.items[0].snippet.thumbnails.medium.url;

    //Get upload playlist
    youtube.playlistItems.list({ auth: api.key, part: 'contentDetails', playlistId: uploadPlaylistId, maxResults: numOfVideos}, function(err, data) {
      var playlistItems = data.items;
      var videoCount = 0;

      for (var key in playlistItems) {
        var videoId = playlistItems[key].contentDetails.videoId;

        //Get videos from uploads
        youtube.videos.list({ auth: api.key, part: 'statistics, snippet', id: videoId}, function(err, data) {
          var title = data.items[0].snippet.title;
          var description = data.items[0].snippet.description;
          var thumbnail = data.items[0].snippet.thumbnails.medium.url;
          var viewCount = data.items[0].statistics.viewCount;
          var url = 'https://www.youtube.com/watch?v=' + data.items[0].id;
          cumVideoViews += parseInt(viewCount);

          channel.videos.push({
            title: title,
            description: description,
            thumbnail: thumbnail,
            url: url,
            viewCount: viewCount
          });


          videoCount++;

          //Check if all requests are finished and call cb
          if (videoCount === 50) {
            //Add average number of views a video on this channel has
            channel.avgVideoViews = Math.floor(cumVideoViews/numOfVideos);

            //Remove videos that are below average
            channel.videos = cullVideos(channel.videos, channel.avgVideoViews);

            cb(channel);
          }
        });
      }
    });
  });
}

function cullVideos(arr, avgVideoViews) {
  var culledVideos = [];
  for (var key in arr) {
    var video = arr[key];

    if (video.viewCount > avgVideoViews) {
      culledVideos.push(video);
    }
  }

  return culledVideos;
}

module.exports = router;
