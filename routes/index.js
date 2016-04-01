var express = require('express');
var router = express.Router();

// Get ChannelController
var channelController = require('../controller/channelController');

/* GET home page. */
router.get('/', function(req, res, next) {
  channelController.getAllChannelNames(function(channelNames) {
    console.log(channelNames);
    res.render('index', {channelNames: channelNames});
  });
});

module.exports = router;
