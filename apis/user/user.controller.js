/**
 * Created by QuangTM on 29/10/2017.
 */

var User = require('./user.model');
var jwt = require('jsonwebtoken');
var config = require('../../configs/index');

module.exports = {

    addUser: function (req, res) {
        if (req.body.password && req.body.password.length < 8 ){
            res.json({status: false, message: "Mật khẩu phải có ít nhất 8 kí tự."});
            return;
        }

        try {
            var newUser = new User({
                username: req.body.username.toLowerCase(),
                password: req.body.password,
                name: req.body.name,
                email: req.body.email,
                gender: req.body.gender,
                dob: req.body.dob,
                imgUrl: (req.body.imgUrl.trim() === "") ? "imgs/user_male_df.png" : req.body.imgUrl.trim()
            });
        } catch (e) {

        }

        User.findOne({username: req.body.username}, {_id: 0, __v: 0})
            .then(function (user) {
                if (user) {
                    res.json({status: false, message: "Tài khoản đã tồn tại."});
                } else {
                    newUser.save(function (err, user) {
                        if (err) {
                            res.json({status: false, message: err});
                        } else {
                            res.json({status: true, message: "Đăng kí thành công."});
                        }
                    })
                }
            }, function (err) {
                res.json({status: false, message: err});
            });
    },

    getUser: function (req, res) {
        User.findOne({_id: req.params.id}, '-__v -salt -password')
            .exec(function (err, user) {
                if (err) res.json({status: false, message: err});
                if (user) {
                    res.json({status: true, data: user});
                } else {
                    res.json({status: false, message: "Tài khoản chưa tồn tại."});
                }
            });

    },

    login: function (req, res) {
        User.findOne({username: req.body.username})
            .exec(function (err, user) {
                if (err) {
                    res.json({status: false, message: user});
                }
                if (!user) res.json({status: false, message: "Tài khoản chưa đăng kí."});
                else {
                    if (!user.authenticate(req.body.password)) {
                        res.json({status: false, message: "Mật khẩu không chính xác."});
                    }
                    else {
                        var token = jwt.sign({
                            data: user
                        }, config.secret, {expiresIn: '7d'});
                        user.password = undefined;
                        user.salt = undefined;
                        user._v = undefined;
                        res.json({status: true, message: "Đăng nhập thành công.", token: token, user: user});
                    }
                }

            })
    },

    checkLogin: function (req, res) {
        jwt.verify(req.headers.token, config.secret, function (err, decoded) {
            if (err) res.json({
                status: true, result: {
                    login: false
                }
            }); else res.json({
                status: true, result: {
                    login: true
                }
            });
        });
    },

    getAll: function (req, res) {
        User.find().select("_id username name").lean()
            .exec(function (err, users) {
                res.json(users);
            });
    },

    getUserCallback: function (id, callback) {
        User.findOne({_id: id}, '-__v -salt -password')
            .exec(function (err, user) {
                return callback(user);
            });

    },

    updateUser: function(req, res) {
        var editUser = req.user;

        editUser.name = req.body.name;
        editUser.email = req.body.email;
        editUser.dob = req.body.dob;
        editUser.gender = req.body.gender;
        editUser.imgUrl = (req.body.imgUrl.trim() === "") ? "imgs/user_male_df.png" : req.body.imgUrl.trim();

        User.findOne({username: editUser.username}, function (err, user) {
            if (err) res.json({status: false, message: err.message});

            user.name = editUser.name;
            user.email = editUser.email;

            user.save(function (err, updatedUser) {
                if (err) {
                  res.json({status: false, message: err.message});
                }
                updatedUser.salt = undefined;
                updatedUser.password = undefined;
                res.json({status: true, message:"Cập nhật thành công!", result: updatedUser});
            });
        });
    },

    updatePassword: function(req, res) {
      User.findOne({username: req.user.username})
          .exec(function (err, user) {
              if (err) {
                  res.json({status: false, message: user});
              }

              if (!user.authenticate(req.body.oldPassword)) {
                  res.json({status: false, message: "Mật khẩu không chính xác."});
              } else {
                  user.password = req.body.newPassword;
                  user.save(function(err, updatedUser){
                      if (err) res.json({status: false, message: err.message});

                      res.json({status: true, message: "Cập nhật mật khẩu thành công!", result: updatedUser});
                  });
              }

          })
    }

};
