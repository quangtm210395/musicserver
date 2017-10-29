'use strict';
var mongoose = require('mongoose');

var song = mongoose.Schema({
    songname: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    artist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Artist'
    },
    album: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Album'
    },
    imgUrl: {
        type: String
    }
});
module.exports = mongoose.model('Song', song);
