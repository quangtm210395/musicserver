'use strict';
var mongoose = require('mongoose');

var song = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    url: {
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
    thumbnail: {
        type: String
    },
    flag : {
        type: String
    }
});
module.exports = mongoose.model('Song', song);
