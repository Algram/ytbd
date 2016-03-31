$.get( "/channel?name=MrSuicideSheep", function(channel) {
  console.log(channel);

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
});
