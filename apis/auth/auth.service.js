/**
 * Created by QuangTM on 29/10/2017.
 */
var jwt = require('jsonwebtoken');
var config = require('../../configs/index');
var compose = require('composable-middleware');

module.exports = {
    authentication: function () {
        return compose().use(function (req, res, next) {
            if (req.query.token || req.headers.token) {
                let token = req.query.token || req.headers.token;
                jwt
                    .verify(token, config.secret, function (err, decoded) {
                        if (err) 
                            res.json({status: false, message: err.message});
                        else {
                            req.user = decoded.data;
                            next();
                        }
                    });
            } else {
                res.json({status: false, message: 'Request required token.'});
            }
        });
    }
}
