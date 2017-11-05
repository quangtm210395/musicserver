
var express = require('express');

var router = express.Router();
var PlaylistController = require('./playlist.controller');
var Auth = require('../auth/auth.service');

router.get('/', PlaylistController.getAll);
router.post('/add', Auth.authentication(), PlaylistController.add);
router.post('/getPlaylistByUser', Auth.authentication(), PlaylistController.getPlaylistByUser);
router.post('/syncPlaylist', Auth.authentication(), PlaylistController.syncPlaylist);
router.put('/remove', Auth.authentication(), PlaylistController.remove);
router.post('/rename', Auth.authentication(), PlaylistController.rename);

module.exports = router;