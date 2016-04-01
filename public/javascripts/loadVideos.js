var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
/*function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
            height: '0',
            width: '0',
            videoId: 'XgipcQ1xTug',
            events: {
             'onReady': onPlayerReady
           }
  });
}*/

function onPlayerReady(event) {
  event.target.playVideo();
}

$(document).ready(function() {
  //TEST OF YT PLAYER API
  $('#playButton').on('click', function(e) {
    player.playVideo();
  });

  $('#pauseButton').on('click', function(e) {
    player.pauseVideo();
  });

  $('body').on('click','.video a', function(e) {
    e.preventDefault();
    var videoId = $(this).attr('href').split('=')[1];
    console.log(videoId);

    if (player !== undefined) {
      player.loadVideoById(videoId);
    } else {
      player = new YT.Player('player', {
                height: '0',
                width: '0',
                videoId: videoId,
                events: {
                 'onReady': onPlayerReady
               }
      });
    }

    startMonitoring();
  });

  function startMonitoring() {
    setInterval(function(){
      var videoDuration = player.getDuration();
      var videoCurrTime = player.getCurrentTime();

      var progress = Math.floor((videoCurrTime/videoDuration)*100);

      $('#playerProgress input').attr('value', progress);
    }, 1000);
  }






  //Initial loading of first channel to display something
  //TODO convert to what is in the hashtag in the url
  loadVideos($('#channelList li a:first').text(), function() {});

  $('#channelList li a').on('click', function(e) {
    var channelName = $(this).text();

    loadVideos(channelName, function() {});
  });

  //TESTESTESTESTESTESTEST
  $('#addChannelButton').on('click', function(e) {
    var channelName = 'StephenWalking';

    loadVideos(channelName, function() {
          location.reload();
    });
  });

  function loadVideos(channelName, cb) {
    $('.videos').empty();

    $.get('/channel?name=' + channelName, function(channel) {

      for (var key in channel.videos) {
        var video = channel.videos[key];

        $('.videos').append(
          '<div class="col-lg-3 video">' +
            '<div class="panel panel-default">' +
              '<div class="panel-heading">' + video.title + '</div>' +
              '<div class="panel-body">' +
                '<a href="' + video.url + '">' +
                  '<img src="' + video.thumbnail + '" alt="Smiley face" height="200" width="350"> ' +
                '</a>' +
              '</div>' +
            '</div>' +
          '</div>'
        );
      }

      cb();
    });
  }
});
