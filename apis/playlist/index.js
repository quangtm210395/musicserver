
var express = require('express');

var router = express.Router();
var PlaylistController = require('./playlist.controller');
var Auth = require('../auth/auth.service');

router.get('/', PlaylistController.getAll);
router.post('/add', Auth.authentication(), PlaylistController.add);
router.put('/remove', Auth.authentication(), PlaylistController.remove);

module.exports = router;