$(document).ready(function() {
  ///////////////////
  // Initial setup //
  ///////////////////

  $('#channelList li a').removeClass('active');
  $('#channelList li a:first').addClass('active');
  var seekbar = document.getElementById('playerProgress');
  seekbar.onchange = seekVideo;
  seekbar.value = 0;

  var volumebar = document.getElementById('volumeBar');
  volumebar.onchange = setVolume;
  volumebar.value = 100;

  $('#playerProgress').css({
    'background-size': '0% 100%'
  });

  // Initial loading of first channel to display something
  if ($(location).attr('hash').slice(1)) {
    loadVideos($(location).attr('hash').slice(1), function() {});
  } else {
    loadVideos($('#channelList li a:first').data('id'), function() {});
  }


  /////////////////////
  // Event Listeners //
  /////////////////////

  /* PROGRESS BAR */
  $('input[type=range]').on('input', function(e){
    var min = e.target.min,
        max = e.target.max,
        val = e.target.value;

    $(e.target).css({
      'backgroundSize': (val - min) * 100 / (max - min) + '% 100%'
    });
  }).trigger('input');

  /* CHANNEL ACTIONS */
  $('#channelList li a').on('click', function(e) {
    $('#channelList li a').removeClass('active');
    $(this).addClass('active');
    var channelId = $(this).data('id');
    location.replace('#' + channelId);

    loadVideos(channelId, function() {});
  });

  $('#channelList').on('click', '.remove', function(e) {
    $.ajax({
      method: 'POST',
      url: '/channel/remove',
      data: { id: $(this).parent().data('id')}
    }).done(function() {
      location.replace('#' + $('#channelList li a:first').data('id'));
      location.reload();
    });
  });

  /* SEARCH */
  $('#searchGroup span').on('click', 'button',function(e) {
    $('#addChannelModal .results').empty();
    searchChannel($(this).parent().siblings('input').val());
  });

  $('#addChannelModal .results').on('click', 'img',function(e) {
    $(this).siblings().removeClass('selected');
    $(this).addClass('selected');
  });

  $('#addChannelModal').on('click', '.confirm', function(e) {
    var channelId = $('#addChannelModal img.selected').data('id');

    loadVideos(channelId, function() {
        location.replace('#' + channelId);
        location.reload();
    });
  });


  ////////////////////////
  // Youtube-Player-API //
  ////////////////////////

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
                 'onReady': togglePlayer
               }
      });
    }

    updateUI();
  });


  ///////////////
  // Functions //
  ///////////////

  function searchChannel(searchVal) {
    $.ajax({
      method: 'POST',
      url: '/channel/search',
      data: { searchVal: searchVal}
    }).done(function(channels) {
      for (var i = 0; i < channels.length; i++) {
        var channel = channels[i];
        $('#addChannelModal .results').append(
          '<img src="' + channel.thumbnail + '" height="100" width="100" data-id="' + channel.id + '">'
        );
      }
    });
  }

  function loadVideos(channelId, cb) {
    clearPage();
    var loadingTimer = setTimeout(function() {
        $('.loading').show();
    }, 300);

    $.ajax({
      method: 'POST',
      url: '/channel/add',
      data: { id: channelId}
    }).done(function(channel) {
      clearTimeout(loadingTimer);
      $('.loading').hide();

      $('.header img').attr('src', channel.thumbnail).show();
      $('.header h1').text(channel.name).show();

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

  /* YOUTUBE-PLAYER-CONTROLS */
  function seekVideo() {
    var videoNewTime = Math.floor((seekbar.value/100) * player.getDuration());
    player.seekTo(videoNewTime);
  }

  function setVolume() {
    var newVolume = Math.floor((volumebar.value));
    player.setVolume(newVolume);
  }

  var updating = false;
  function updateUI() {
    if (!updating) {
      updating = true;
      setInterval(function(){
        seekbar.value = (player.getCurrentTime()/player.getDuration())*100;

        $('#playerProgress').css({
          'background-size': (player.getCurrentTime()/player.getDuration())*100 + '% 100%'
        });
      }, 1000);
    }
  }
});
