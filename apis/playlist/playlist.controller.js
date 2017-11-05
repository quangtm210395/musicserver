
var Playlist = require('./playlist.model');
var Song = require('../song/song.model');
var Artist = require('../artist/artist.model');
var common = require('../../common/index');
const async = require('async');
const _ = require('underscore');

module.exports = {
    getAll: function(req, res) {
        Playlist
            .find()
            .select("_id name")
            .populate({path: 'listsong', select: '-album'})
            .populate({path: 'createdBy', select: '-salt -password'})
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
            var listsong = req.body.listsong || [];
            var newPlaylist = new Playlist({name: req.body.playlistName, createdBy: req.user._id, listsong: listsong});
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
    },
    rename : function (req, res) {
        if (!req.body.playlistId || !req.body.playlistName) {
            res.json({status: false, message: "Rename failed."});
            return;
        }
        Playlist
            .findByIdAndUpdate(req.body.playlistId, {name: req.body.playlistName})
            .exec(function(err, data) {
                if (err) {
                    res.json({status:false, message: err.message});
                    return;
                }
                res.json({status: true, message: 'Rename playlist successful.'});
            });
    },
    getPlaylistByUser: function (req, res) {
        var user = req.user;
        Playlist
            .find({createdBy: user._id})
            .populate({path: 'createdBy', select: '-salt -password'})
            .populate({path: 'listsong', select: ''})
            .exec(function(err, playlists) {
                if (err) {
                    res.json({status:false, message: err.message});
                    return;
                }
                res.json({status: true, message: 'Synced playlists successful', playlists: playlists});
            });
    },
    syncPlaylist: function (req, res) {
        this.return = function() {
            return;
        }
        var that = this;
        if (!req.body.playlists) {
            res.json({status: false, message: 'Failed'});
            return;
        }
        var playlists = req.body.playlists;
        playlists.forEach(function(playlist, index) {
            if (!playlist._id) {
                var newPlaylist = new Playlist({name: playlist.name, createdBy: req.user._id});
                newPlaylist.save(function(err, savedPlaylist) {
                    if (err) {
                        res.json({status: false, message: err.message});
                        return;
                    }
                    playlist.songs.forEach(function(song, idx) {
                        var that2 = this;
                        let newSong = new Song(song);
                        newSong.save(function(err, savedSong) {
                            if (err) {
                                res.json({status: false, message: err.message});
                                return;
                            }
                            Playlist.findByIdAndUpdate(savedPlaylist._id, {$push: {listsong: savedSong._id}})
                                .exec(function(err2) {
                                    if (err2) {
                                        res.json({status: false, message: err2.message});
                                        return;
                                    }
                                    if (index == playlists.length - 1 && idx == playlist.songs.length - 1) {
                                        var user = req.user;
                                        Playlist
                                            .find({createdBy: user._id})
                                            .populate({path: 'createdBy', select: '-salt -password'})
                                            .populate({path: 'listsong', select: ''})
                                            .exec(function(err, playlists) {
                                                if (err) {
                                                    res.json({status:false, message: err.message});
                                                    return;
                                                }
                                                res.json({status: true, message: 'Synced playlists successful', playlists: playlists});
                                            });
                                    }
                                });
                        });
                    });
                });
            } else {
                var songs = _.filter(playlist.songs, function(song) {
                    return !song._id;
                });
                console.log(songs);
                songs.forEach(function(song, idx) {
                    let newSong = new Song(song);
                    newSong.save(function(err, savedSong) {
                        if (err) {
                            res.json({status: false, message: err.message});
                            return;
                        }
                        Playlist.findByIdAndUpdate(playlist._id, {$push: {listsong: savedSong._id}})
                            .exec(function(err2) {
                                if (err2) {
                                    res.json({status: false, message: err2.message});
                                    return;
                                }
                                if (index == playlists.length - 1 && idx == playlist.songs.length - 1) {
                                    var user = req.user;
                                    Playlist
                                        .find({createdBy: user._id})
                                        .populate({path: 'createdBy', select: '-salt -password'})
                                        .populate({path: 'listsong', select: ''})
                                        .exec(function(err, playlists) {
                                            if (err) {
                                                res.json({status:false, message: err.message});
                                                return;
                                            }
                                            res.json({status: true, message: 'Synced playlists successful', playlists: playlists});
                                        });
                                }
                            });
                    });
                });
            }
        });
    }
}