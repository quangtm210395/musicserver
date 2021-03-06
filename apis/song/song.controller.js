var Song = require('./song.model');
var Playlist = require('../playlist/playlist.model');
var Artist = require('../artist/artist.model');
var common = require('../../common/index');
function addNewSong(req, res, playlist) {
    let newflag = common.makeFlag(req.body.song.name, req.body.song.artist);
    Song
        .findOne({flag: newflag})
        .exec(function (err, song) {
            if (err) {
                res.json({status: false, message: err.message});
                return;
            }
            if (!song) {
                var newSongScheme = req.body.song;
                newSongScheme.flag = newflag;
                var newSong = new Song(newSongScheme);
                newSong.save(function (err3, data) {
                    if (err3) {
                        res.json({status: false, message: err3.message});
                        return;
                    }
                    Playlist.findByIdAndUpdate(
                        playlist._id
                    , {
                        $push: {
                            listsong: data
                        }
                    }, {
                        new: true
                    }).exec(function(err, updatedPlaylist) {
                        if (err) {
                            res.json({status: false, message: err.message});
                            return;
                        }
                        res.json({status: true, message: 'Added song successsful.', playlist: updatedPlaylist, song: {_id: data._id}});
                    });
                });
            } else {
                Playlist.findByIdAndUpdate({
                    _id: playlist._id
                }, {
                    $push: {
                        listsong: song
                    }
                }, {
                    new: true
                }).exec(function(err, updatedPlaylist) {
                    if (err) {
                        res.json({status: false, message: err.message});
                        return;
                    }
                    res.json({status: true, message: 'Added song successsful.', playlist: updatedPlaylist, song: {_id: song._id}});
                });
            }
            
        });
};

module.exports = {
    getAll: function (req, res) {
        Song
            .find()
            .select("_id name url thumbnail flag")
            .populate({path: 'artist', select: ''})
            .lean()
            .exec(function (err, users) {
                if (err) {
                    res.json({status: false, message: err.message});
                }
                res.json({status: true, message: 'All songs.', data: users});
            });
    },
    addToPlaylist: function (req, res) {
        if (!req.body.song) {
            res.json({status: false, message: 'Request required song'});
            return;
        }
        if (req.body.playlistId) 
            Playlist.findOne({_id: req.body.playlistId}).exec(function (err, playlist) {
                if (err) {
                    res.json({status: false, message: err.message});
                    return;
                }
                if (playlist) {
                    addNewSong(req, res, playlist);
                }
            });
        else {
            if (req.body.playlistName) {
                var newPlaylist = new Playlist({name: req.body.playlistName, createdBy: req.user._id});
                newPlaylist.save(function (err, savedPlaylist) {
                    if (err) {
                        res.json({status: false, message: err.message});
                        return;
                    }
                    addNewSong(req, res, savedPlaylist);
                })
            }
        }
    },
    removeFromPlaylist: function (req, res) {
        if (!req.body.playlistId || !req.body.songId) {
            res.json({status: false, message: 'Request required playlistId and songId'});
            return;
        }
        Song
            .findOne({_id: req.body.songId})
            .exec(function(err, song) {
                if (err) {
                    res.json({status: false, message: err.message});
                    return;
                }
                if (!song) {
                    res.json({status: false, message: 'Invalid songId'});
                    return;
                }
                Playlist
                    .findByIdAndUpdate(req.body.playlistId, {$pop: {listsong: req.body.songId}})
                    .exec(function(err2, playlist) {
                        if (err2) {
                            res.json({status: false, message: err2.message});
                            return;
                        }
                        if (!playlist) {
                            res.json({status: false, message: 'Invalid playlistId'});
                            return;
                        }
                        res.json({status:true, message: 'Remove successful.'});
                    })
            });
    }
};