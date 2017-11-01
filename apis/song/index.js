
var express = require('express');

var router = express.Router();
var SongController = require('./song.controller');
var Auth = require('../auth/auth.service');

router.get('/', SongController.getAll);
router.post('/addToPlaylist', SongController.addToPlaylist);
router.put('/removeFromPlaylist', SongController.removeFromPlaylist);

module.exports = router;