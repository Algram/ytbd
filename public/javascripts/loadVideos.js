$(document).ready(function() {

  $('input[type=range]').on('input', function(e){
    var min = e.target.min,
        max = e.target.max,
        val = e.target.value;

    $(e.target).css({
      'backgroundSize': (val - min) * 100 / (max - min) + '% 100%'
    });
  }).trigger('input');

  //TEST OF YT PLAYER API
  var player;

  $('#playButton').on('click', function(e) {
    player.playVideo();
  });

  $('#pauseButton').on('click', function(e) {
    player.pauseVideo();
  });

  $('body').on('click','.video a', function(e) {
    e.preventDefault();
    var videoId = $(this).attr('href').split('=')[1];

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

    updateUI();
  });

  function onPlayerReady(event) {
    event.target.playVideo();
  }

  var seekbar = document.getElementById('playerProgress');
  seekbar.onchange = seekVideo;

  function seekVideo() {
    var videoNewTime = Math.floor((seekbar.value/100) * player.getDuration());
    player.seekTo(videoNewTime);
  }

  function updateUI() {
    setInterval(function(){
      seekbar.value = (player.getCurrentTime()/player.getDuration())*100;

      $('input[type=range]').on('input', function(e){
        var min = e.target.min,
            max = e.target.max,
            val = e.target.value;

        $(e.target).css({
          'backgroundSize': (val - min) * 100 / (max - min) + '% 100%'
        });
      }).trigger('input');
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
  /*$('#addChannelButton').on('click', function(e) {
    var channelName = 'StephenWalking';

    loadVideos(channelName, function() {
          location.reload();
    });
  });*/

  $('#addChannelModal').on('click', '.confirm', function(e) {
    var channelName = $('#addChannelModal input').val();

    loadVideos(channelName, function() {
          location.reload();
    });
  });

  function loadVideos(channelName, cb) {
    $('.videos').empty();

    $.get('/channel?name=' + channelName, function(channel) {
      console.log(channel._id);
      $('.header img').attr('src', channel.thumbnail);
      $('.header h1').text(channel._id);

      for (var key in channel.videos) {
        var video = channel.videos[key];

        $('.videos').append(
          '<div class="col-lg-3 video">' +
            '<div class="panel panel-default">' +
              '<div class="panel-heading">' + video.title + '</div>' +
              '<div class="panel-body">' +
                '<a href="' + video.url + '">' +
                  '<img src="' + video.thumbnail + '" height="200" width="350" class="img-responsive center-block">' +
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
