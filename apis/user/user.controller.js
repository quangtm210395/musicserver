/**
 * Created by QuangTM on 29/10/2017.
 */

var User = require('./user.model');
var jwt = require('jsonwebtoken');
var config = require('../../configs/index');

module.exports = {

    addUser: function (req, res) {
        if (!req.body.username) {
            res.json({status: false, message: 'Username không được để trống'});
            return;
        }
        if (!req.body.password) {
            res.json({status: false, message: 'Password không được để trống'});
            return;
        }
        if (!req.body.name) {
            res.json({status: false, message: 'Name không được để trống'});
            return;
        }
        if (!req.body.email) {
            res.json({status: false, message: 'Email không được để trống'});
            return;
        }
        if (req.body.password && req.body.password.length < 8) {
            res.json({status: false, message: "Mật khẩu phải có ít nhất 8 kí tự."});
            return;
        }
        try {
            var newUser = new User({
                username: req
                    .body
                    .username
                    .toLowerCase(),
                password: req.body.password,
                name: req.body.name,
                email: req.body.email
            });
        } catch (e) {}

        User.findOne({
            username: req.body.username
        }, {
                _id: 0,
                __v: 0
            })
            .then(function (user) {
                if (user) {
                    res.json({status: false, message: "Tài khoản đã tồn tại."});
                } else {
                    var emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                    if (emailRegex.test(newUser.email)) 
                        newUser.save(function (err, user) {
                            if (err) {
                                res.json({status: false, message: err});
                            } else {
                                res.json({status: true, message: "Đăng kí thành công."});
                            }
                        });
                    else {
                        res.json({status: false, message: "Vui lòng nhập email đúng định dạng."});
                    }
                }
            }, function (err) {
                res.json({status: false, message: err});
            });
    },

    getUser: function (req, res) {
        if (!req.params.id) {
            res.json({
                status: false,
                message: 'Can not find user with id ' + req.params.id
            });
        }
        User.findOne({
            _id: req.params.id
        }, '-__v -salt -password')
            .exec(function (err, user) {
                if (err) 
                    res.json({status: false, message: err});
                else if (user) {
                    res.json({status: true, data: user});
                } else {
                    res.json({status: false, message: "Tài khoản chưa tồn tại."});
                }
            });
    },

    login: function (req, res) {
        if (!req.body.username || !req.body.password) {
            res.json({status: false, message: 'Please enter username and password'});
            return;
        }
        User
            .findOne({username: req.body.username})
            .exec(function (err, user) {
                if (err) {
                    res.json({status: false, message: err.message});
                    return;
                }
                if (!user) {
                    res.json({status: false, message: "This account is not registered yet."});
                    return;
                } else {
                    if (!user.authenticate(req.body.password)) {
                        res.json({status: false, message: "Password is incorrect."});
                        return;
                    } else {
                        var token = jwt.sign({
                            data: user
                        }, config.secret, {expiresIn: '7d'});
                        user.password = undefined;
                        user.salt = undefined;
                        user._v = undefined;
                        res.json({status: true, message: "Login successful.", token: token, user: user});
                    }
                }
            });
    },

    checkLogin: function (req, res) {
        jwt
            .verify(req.headers.token, config.secret, function (err, decoded) {
                if (err) 
                    res.json({
                        status: true,
                        result: {
                            login: false
                        }
                    });
                else 
                    res.json({
                        status: true,
                        result: {
                            login: true
                        }
                    });
                }
            );
    },

    getAll: function (req, res) {
        User
            .find()
            .select("_id username name")
            .lean()
            .exec(function (err, users) {
                if (err) {
                    res.json({status: false, message: 'Lỗi hệ thống, xin vui lòng chờ khắc phục.'});
                }
                res.json({status: true, message: 'Ahihi', data: users});
            });
    },

    getUserCallback: function (id, callback) {
        User.findOne({
            _id: id
        }, '-__v -salt -password')
            .exec(function (err, user) {
                return callback(user);
            });

    },

    updateUser: function (req, res) {
        var editUser = req.user;

        editUser.name = req.body.name;
        editUser.email = req.body.email;
        editUser.dob = req.body.dob;
        editUser.gender = req.body.gender;
        editUser.imgUrl = (req.body.imgUrl.trim() === "")
            ? "imgs/user_male_df.png"
            : req
                .body
                .imgUrl
                .trim();

        User.findOne({
            username: editUser.username
        }, function (err, user) {
            if (err) 
                res.json({status: false, message: err.message});
            
            user.name = editUser.name;
            user.email = editUser.email;

            user.save(function (err, updatedUser) {
                if (err) {
                    res.json({status: false, message: err.message});
                }
                updatedUser.salt = undefined;
                updatedUser.password = undefined;
                res.json({status: true, message: "Cập nhật thành công!", result: updatedUser});
            });
        });
    },

    updatePassword: function (req, res) {
        User
            .findOne({username: req.user.username})
            .exec(function (err, user) {
                if (err) {
                    res.json({status: false, message: user});
                }

                if (!user.authenticate(req.body.oldPassword)) {
                    res.json({status: false, message: "Mật khẩu không chính xác."});
                } else {
                    user.password = req.body.newPassword;
                    user.save(function (err, updatedUser) {
                        if (err) 
                            res.json({status: false, message: err.message});
                        
                        res.json({status: true, message: "Cập nhật mật khẩu thành công!", result: updatedUser});
                    });
                }

            })
    }

};
