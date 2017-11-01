
var Playlist = require('../playlist/playlist.model');
var common = require('../../common/index');

module.exports = {
    getAll: function(req, res) {
        Playlist
            .find()
            .select("_id name")
            .populate({path: 'listsong', select: '-album'})
            .populate({path: 'createdBy', select: ''})
            .lean()
            .exec(function (err, users) {
                if (err) {
                    res.json({status: false, message: err.message});
                }
                res.json({status: true, message: 'All playlists.', data: users});
            });
    },
    add: function(req, res) {
        if (!req.body.playlistName) {
            res.json({status: false, message: "Playlist's name must not be empty."});
            return;
        } else {
            var newPlaylist = new Playlist({name: req.body.playlistName, createdBy: req.user._id});
            newPlaylist.save(function(err, playlist) {
                if (err) {
                    res.json({status: false, message: err.message});
                    return;
                }
                res.json({status: true, message: 'Add playlist successful.'});
            });
        }
    },
    remove : function (req, res) {
        if (!req.body.playlistId) {
            res.json({status: false, message: "Delete failed."});
            return;
        }
        Playlist
            .findByIdAndRemove(req.body.playlistId)
            .exec(function(err, data) {
                if (err) {
                    res.json({status:false, message: err.message});
                    return;
                }
                res.json({status: true, message: 'Delete playlist successful.'});
            });
    }
}