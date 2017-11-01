'use strict';
var mongoose = require('mongoose');

var playlist = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    listsong: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Song'
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});
module.exports = mongoose.model('Playlist', playlist);
