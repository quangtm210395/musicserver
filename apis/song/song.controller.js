
var Song = require('./song.model');
var jwt = require('jsonwebtoken');
var config = require('../../configs/index');

module.exports = {
    getAll: function (req, res) {
        Song.find().select("_id songname path").lean()
            .exec(function (err, users) {
                if (err) {
                    res.json({status: false, message: 'Lỗi hệ thống, xin vui lòng chờ khắc phục.'});
                }
                res.json({status: true, message: 'Ahihi', data: users});
            });
    }
};