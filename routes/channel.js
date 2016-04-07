var express = require('express');
var router = express.Router();

// Load moment.js for date comparison
var moment = require('moment');

// Load update config
var update = require('../config/update');

// Load all the things necessary for the api
var google = require('googleapis');
var youtube = google.youtube('v3');
var api = require('../config/youtube_api');

// Load ChannelController
var channelController = require('../controller/channelController');


////////////
// Routes //
////////////

router.post('/add', function(req, res, next) {
  var channelId = req.body.id;

  if (channelId !== undefined) {
    channelController.exists(channelId, function(exists) {

      // If channel exists, load it from database
      if(exists) {
        channelController.getChannel(channelId, function(channel) {
          // Check if channel needs an update
          checkForUpdate(channel);

          res.send(channel);
        });
      } else {
        fetchChannelFromApi(channelId, function(channel, err) {
          if (!err) {
            channelController.addChannel(channel);
            res.send(channel);
          } else {
            res.status(404).send(err);
          }
        });
      }
    });

  } else {
    res.send();
  }
});

router.post('/remove', function(req, res) {
  var channelId = req.body.id;

  channelController.removeChannel(channelId, function() {
    res.send();
  });
});

router.post('/search', function(req, res, next) {
  var searchVal = req.body.searchVal;

  if (searchVal !== undefined) {

    searchForChannel(searchVal, function(data) {
      res.send(data);
    });
  } else {
    res.send();
  }
});


///////////////
// Functions //
///////////////

function searchForChannel(searchVal, cb) {
  youtube.search.list({ auth: api.key, part: 'snippet', q: searchVal, type: 'channel'}, function(err, data) {
    if (data.items.length === 0) {
      cb(null);
      return;
    } else {
      var channels = [];
      for (var i = 0; i < data.items.length; i++) {
        var channelData = data.items[i].snippet;
        var channel = {
          id: channelData.channelId,
          name: channelData.channelTitle,
          thumbnail: channelData.thumbnails.medium.url
        };

        channels.push(channel);
      }

      cb(channels);
    }
  });
}

/**
 * Checks if an update is needed and starts it
 * @param  {obj} channel  Channel object
 * @return {void}
 */
function checkForUpdate(channel) {
  // If last channel update was more than 2 days ago
  if ((moment().diff(channel.updatedAt, 'days')) >= update.interval) {
    fetchChannelFromApi(channel._id, function(updatedChannel) {
      channelController.updateChannel(updatedChannel);
    });
  }
}

/**
 * Takes a string as an id for a channelName and fetches data for that channel
 * from the youtube-api. Creates a channel object and returns it as a callback
 * parameter.
 * @param  {string}   channelName Name of Channel as id
 * @param  {Function} cb          Has channel object
 * @return {void}
 */
function fetchChannelFromApi(channelId, cb) {
  var cumVideoViews = 0;

  // Dummy object
  var channel = {
    _id: channelId,
    name: '',
    thumbnail: '',
    avgVideoViews: 0,
    videos: []
  };

  // Get channel with channelName
  youtube.channels.list({ auth: api.key, part: 'contentDetails, snippet, statistics', id: channelId}, function(err, data) {

    // Return if channel doesn't exist or does not have videos
    if (data.items.length === 0) {
      cb(null, 'Channel does not exist.');
      return;
    }

    var uploadPlaylistId = data.items[0].contentDetails.relatedPlaylists.uploads;
    var totalVideosCount = data.items[0].statistics.videoCount;

    //Set channel name
    channel.name = data.items[0].snippet.title;

    // Set channel thumbnail
    channel.thumbnail =  data.items[0].snippet.thumbnails.medium.url;

    // Get upload playlist
    youtube.playlistItems.list({ auth: api.key, part: 'contentDetails', playlistId: uploadPlaylistId, maxResults: api.numOfVideos}, function(err, data) {
      var playlistItems = data.items;
      var videoCount = 0;

      for (var key in playlistItems) {
        var videoId = playlistItems[key].contentDetails.videoId;

        // Get videos from uploads
        youtube.videos.list({ auth: api.key, part: 'statistics, snippet', id: videoId}, function(err, data) {
          var title = data.items[0].snippet.title;
          var description = data.items[0].snippet.description;
          var thumbnail = data.items[0].snippet.thumbnails.medium.url;
          var viewCount = data.items[0].statistics.viewCount;
          var url = 'https://www.youtube.com/watch?v=' + data.items[0].id;
          cumVideoViews += parseInt(viewCount);

          // Fill videos array in channel object
          channel.videos.push({
            title: title,
            description: description,
            thumbnail: thumbnail,
            url: url,
            viewCount: viewCount
          });

          videoCount++;

          // Check if all requests are finished and call cb
          if (videoCount === 50 || videoCount == totalVideosCount) {
            // Add average number of views a video on this channel has
            channel.avgVideoViews = Math.floor(cumVideoViews/api.numOfVideos);

            // Remove videos that are below average
            channel.videos = cullVideos(channel.videos, channel.avgVideoViews);

            cb(channel);
          }
        });
      }
    });
  });
}

/**
 * Removes videos from array that are below the average view number for the
 * channel they were uploaded to.
 * @param  {array} arr            Array of videos
 * @param  {number} avgVideoViews Average views for that channel
 * @return {arr}                  Array of videos above average
 */
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
