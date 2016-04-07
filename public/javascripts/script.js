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
    togglePlayer();
  });

  $('#pauseButton').on('click', function(e) {
    togglePlayer();
  });

  $('body').on('click','.video a', function(e) {
    e.preventDefault();
    var videoId = $(this).attr('href').split('=')[1];

    if (player !== undefined) {
      player.loadVideoById(videoId);
      togglePlayer();
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
    togglePlayer();
  }

  var seekbar = document.getElementById('playerProgress');
  seekbar.onchange = seekVideo;

  function seekVideo() {
    var videoNewTime = Math.floor((seekbar.value/100) * player.getDuration());
    player.seekTo(videoNewTime);
  }

  var updating = false;
  function updateUI() {
    if (!updating) {
      updating = true;
      setInterval(function(){
        seekbar.value = (player.getCurrentTime()/player.getDuration())*100;

        $('input[type=range]').css({
          'background-size': (player.getCurrentTime()/player.getDuration())*100 + '% 100%'
        });
      }, 1000);
    }
  }



  //Initial loading of first channel to display something
  //TODO convert to what is in the hashtag in the url

  if ($(location).attr('hash').slice(1)) {
    loadVideos($(location).attr('hash').slice(1), function() {});
  } else {
    loadVideos($('#channelList li a:first').text(), function() {});
  }

  $('#channelList li a').on('click', function(e) {
    $('#channelList li a').removeClass('active');
    $(this).addClass('active');
    var channelName = $(this).text();

    loadVideos(channelName, function() {});
  });

  $('#addChannelModal').on('click', '.confirm', function(e) {
    var channelName = $('#addChannelModal input').val();

    loadVideos(channelName, function() {
        location.replace('#' + channelName);
        location.reload();
    });
  });

  $('#addChannelModal input').keypress(function (e) {
  if (e.which == 13) {
    return false;    //<---- Add this line
  }
});

  $('#channelList').on('click', '.remove', function(e) {
    $.ajax({
      method: 'POST',
      url: '/channel/remove',
      data: { name: $(this).parent().text()}
    }).done(function() {
      location.replace('#' + $('#channelList li a:first').text());
      location.reload();
    });
  });

  // Search

  $('#searchGroup span').on('click', 'button',function(e) {
    $('#addChannelModal .results').empty();
    searchChannel($(this).parent().siblings('input').val());
  });

  function searchChannel(searchVal) {
    $.ajax({
      method: 'POST',
      url: '/channel/search',
      data: { searchVal: searchVal}
    }).done(function(channels) {
      console.log(channels);

      for (var i = 0; i < channels.length; i++) {
        var channel = channels[i];
        $('#addChannelModal .results').append('<img src="' + channel.thumbnail + '" height="100" width="100">');
      }
    });
  }

  function loadVideos(channelName, cb) {
    clearPage();
    var loadingTimer = setTimeout(function() {
        $('.loading').show();
    }, 300);

    $.ajax({
      method: 'POST',
      url: '/channel/add',
      data: { name: channelName}
    }).done(function(channel) {
      clearTimeout(loadingTimer);
      $('.loading').hide();

      $('.header img').attr('src', channel.thumbnail).show();
      $('.header h1').text(channel._id).show();

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
        ).show();
      }

      cb();
    }).fail(function (err) {
        clearTimeout(loadingTimer);
        $('.loading').hide();
        $('.videos').append(err.responseText).show();
    });
  }

  function togglePlayer() {
    if (player !== undefined) {
      var state = player.getPlayerState();
      switch(state) {
        case 1:
          player.pauseVideo();
          $('#playButton').show();
          $('#pauseButton').hide();
          break;
        case 2:
          player.playVideo();
          $('#playButton').hide();
          $('#pauseButton').show();
          break;
        default:
          player.playVideo();
          $('#playButton').hide();
          $('#pauseButton').show();
      }
    }
  }

  function clearPage() {
    $('.loading').hide();
    $('.videos').empty();
    $('.videos').hide();
    $('.header img').attr('src', null).hide();
    $('.header h1').text('').hide();
  }

});
