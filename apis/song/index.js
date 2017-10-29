
var express = require('express');

var router = express.Router();
var SongController = require('./song.controller');
var Auth = require('../auth/auth.service');

router.get('/', SongController.getAll);

module.exports = router;