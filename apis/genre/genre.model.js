'use strict';
var mongoose = require('mongoose');

var genre = mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});
module.exports = mongoose.model('Genre', genre);
