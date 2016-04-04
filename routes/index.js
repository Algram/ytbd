var express = require('express');
var router = express.Router();

// Get ChannelController
var channelController = require('../controller/channelController');

/* GET home page. */
router.get('/', function(req, res, next) {
  channelController.getChannelInfo(function(channelInfo) {
    res.render('index', {channelInfo: channelInfo});
  });
});

module.exports = router;
