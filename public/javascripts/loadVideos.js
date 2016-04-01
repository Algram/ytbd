$(document).ready(function() {
  //Initial loading of first channel to display something
  //TODO convert to what is in the hashtag in the url
  loadVideos($('#channelList li a:first').text());

  $('#channelList li a').on('click', function(e) {
    var channelName = $(this).text();

    loadVideos(channelName);
  });

  //TESTESTESTESTESTESTEST
  $('#addChannelButton').on('click', function(e) {
    var channelName = 'MrSuicideSheep';

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
