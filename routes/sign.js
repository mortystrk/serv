var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Auth = require('../models/auth');
var url = "mongodb://localhost:27017/mongoosetest";

router.use(function timeLog(req, res, next) {
    console.log('Time: ', Date.now());
    next();
});

router.post('/up', function(req, res) {
    var login = req.body.login;
    var password = req.body.password;

    mongoose.connect(url, function(err) {
        if (err) {
            console.log('error to mongoose connect');
            var response = {
                error: 'error to mongoose connect'
            }

            res.json(response);
            res.end();
        } else {
            Auth.count({ login: login }, function(err, count) {
                if (err) {
                    console.log('error to mongoose count');
                    var response = {
                        error: 'error to mongoose count'
                    }

                    res.json(response);
                    res.end();
                } else {
                    if (count == 0) {
                        var newUser = Auth({
                            _id: new mongoose.Types.ObjectId(),
                            login: login,
                            password: password
                        });

                        newUser.save(function(err) {
                            if (err) {
                                console.log('error to mongoose insert');
                                var response = {
                                    error: 'error to mongoose insert'
                                }

                                res.json(response);
                                res.end();
                            } else {
                                var response = {
                                    error: 'no error'
                                }

                                res.json(response);
                                res.end();
                            }
                        })
                    } else {
                        var response = {
                            error: 'login is already taken'
                        }

                        res.json(response);
                        res.end();
                    }
                }
            });
        }
    });
});

router.post('/in', function(req, res) {
    var login = req.body.login;
    var password = req.body.password;

    mongoose.connect(url, function(err) {
        if (err) {
            console.log('error to mongoose connect')
            var response = {
                error: 'error to mongoose connect'
            }

            res.json(response);
            res.end();
        } else {
            Auth.findOne({ login: login }, function(err, auth) {
                if (auth) {
                    if (auth.password != password) {
                        var response = {
                            _id: "",
                            isExist: true,
                            isPasswordCorrect: false,
                            isFirst: 'false'
                        };
                        res.send(JSON.stringify(response));
                    } else if (auth.isFirst == 'true') {
                        Auth.findOneAndUpdate({ _id: auth._id }, { isFirst: 'false' }, function(err, result, resp) {
                            var response = {
                                _id: auth._id,
                                isExist: true,
                                isPasswordCorrect: true,
                                isFirst: 'true'
                            };
                            res.send(JSON.stringify(response));
                        })
                    } else {
                        var response = {
                            _id: auth._id,
                            isExist: true,
                            isPasswordCorrect: true,
                            isFirst: 'false'
                        };
                        res.send(JSON.stringify(response));
                    }

                } else {
                    var response = {
                        _id: "",
                        isExist: false,
                        isPasswordCorrect: false,
                        isFirst: 'false'
                    };
                    res.send(JSON.stringify(response));
                }
            });
        }
    });
});

module.exports = router;