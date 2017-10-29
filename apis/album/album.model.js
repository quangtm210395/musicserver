'use strict';
var mongoose = require('mongoose');

var album = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    genre: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Genre'
    },
    artist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Artist'
    }
});
module.exports = mongoose.model('Album', album);
