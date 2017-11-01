'use strict';
var mongoose = require('mongoose');

var artist = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    age: {
        type: Number
    },
    description: {
        type: String
    }
});
module.exports = mongoose.model('Artist', artist);
