'use strict';
var mongoose = require('mongoose');

var playlist = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});
module.exports = mongoose.model('Playlist', playlist);
