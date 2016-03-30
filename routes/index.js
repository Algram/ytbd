var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

var google = require('googleapis');
var youtube = google.youtube('v3');
var api = require('../config/youtube_api');

getVideosFromChannel('MrSuicideSheep', function(videos) {
  for (var key in videos) {
    var video = videos[key];


  }
});


function getVideosFromChannel(channelName, cb) {
  var videos = [];

  //Get channel with channelName
  youtube.channels.list({ auth: api.key, part: 'contentDetails', forUsername: channelName}, function(err, data) {
    var uploadPlaylistId = data.items[0].contentDetails.relatedPlaylists.uploads;

    //Get upload playlist
    youtube.playlistItems.list({ auth: api.key, part: 'contentDetails', playlistId: uploadPlaylistId, maxResults: 50}, function(err, data) {
      var playlistItems = data.items;
      var videoCount = 0;

      for (var key in playlistItems) {
        var videoId = playlistItems[key].contentDetails.videoId;

        //Get videos from uploads
        youtube.videos.list({ auth: api.key, part: 'statistics, snippet', id: videoId}, function(err, data) {
          var title = data.items[0].snippet.title;
          var description = data.items[0].snippet.description;
          var thumbnail = data.items[0].thumbnails.medium.url;
          var viewCount = data.items[0].statistics.viewCount;

          videos.push({
            title: title,
            description: description,
            thumbnail: thumbnail,
            viewCount: viewCount
          });


          videoCount++;

          //Check if all requests are finished and call cb
          if (videoCount === 50) {
            cb(videos);
          }
        });
      }
    });
  });
}

module.exports = router;
