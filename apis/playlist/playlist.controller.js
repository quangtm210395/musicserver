
var Playlist = require('./playlist.model');
var Song = require('../song/song.model');
var Artist = require('../artist/artist.model');
var common = require('../../common/index');
const async = require('async');

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
    getPlaylistByUser: function (req, res) {
        var user = req.user;
        Playlist
            .find({createdBy: user._id})
            .populate({path: 'createdBy', select: '-salt -password'})
            .populate({path: 'listsong', populate: {path: 'artist'}})
            .exec(function(err, playlists) {
                if (err) {
                    res.json({status:false, message: err.message});
                    return;
                }
                res.json({status: true, message: 'All playlist of '+ user.name, playlists: playlists});
            });
    },
    addPlaylistWithSong: function (req, res) {
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
            var newPlaylist = new Playlist({name: playlist.name});
            newPlaylist.save(function(err, savedPlaylist) {
                if (err) {
                    res.json({status: false, message: err.message});
                    return;
                }
                playlist.songs.forEach(function(song, idx) {
                    var error = null;
                    if (error) {
                        res.json({status: false, message: error.message});
                        return;
                    }
                    var that2 = this;
                    if (song.artist) {
                        var newArtist = new Artist(song.artist);
                        newArtist.save(function(err2, savedArtist) {
                            if (err2) {
                                error = err2;
                                res.json({status: false, message: err2.message});
                                return;
                            } else {
                                let newSongScheme = song;
                                newSongScheme.artist = savedArtist._id;
                                let newSong = new Song(newSongScheme);
                                newSong.save(function(err, savedSong) {
                                    if (err) {
                                        error = err;
                                        return;
                                    } else {
                                        Playlist.findByIdAndUpdate(savedPlaylist._id, {$push: {listsong: savedSong._id}});
                                        if (index == playlists.length - 1 && idx == playlist.songs.length - 1) {
                                            res.json({status: true, message: 'Synced playlists successful'});
                                        }
                                    }
                                });
                            }
                        });
                    } else {
                        let newSong = new Song(song);
                        newSong.save(function(err, savedSong) {
                            if (err) {
                                res.json({status: false, message: err.message});
                                return;
                            }
                            Playlist.findByIdAndUpdate(savedPlaylist._id, {$push: {listsong: savedSong._id}});
                            if (index == playlists.length - 1 && idx == playlist.songs.length - 1) {
                                res.json({status: true, message: 'Synced playlists successful'});
                            }
                        });
                    }
                });
            });
        });
        
    }
}