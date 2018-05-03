var express = require("express");
var bodyParser = require("body-parser");
var mongoClient = require("mongodb").MongoClient;
var objectId = require("mongodb").ObjectID;
var sign = require('./routes/sign');

var app = express();
var url = "mongodb://localhost:27017/test";

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));

app.get("/api/users", function(req, res) {

    mongoClient.connect(url, function(err, client) {
        var db = client.db('test');
        db.collection("test").find({}).toArray(function(err, users) {
            res.send(users);
            client.close()
        })
    })
})

app.get("/get/all/posts", function(req, res) {

    mongoClient.connect(url, function(err, db) {
        console.log("connection to db is successful");

        var collection = db.collection('posts');

        collection.find().toArray(function(err, docs) {
            console.log("docs count: " + docs.length)
            res.send(docs);
            db.close();
        })
    })
})

app.post("/create", function(req, res) {
    var userId = req.body.userId;
    var postRating = req.body.postRating;
    var userAvatar = req.body.userAvatar;
    var userName = req.body.userName;
    var postDescription = req.body.postDescription;
    var postText = req.body.postText;
    var userRating = req.body.userRating;

    mongoClient.connect(url, function(err, db) {
        var collection = db.collection('posts');

        collection.count(function(err, count) {
            var postId = ++count

            var post = {
                postId: postId,
                userId: userId,
                userName: userName,
                userAvatar: userAvatar,
                postRating: postRating,
                postDescription: postDescription,
                postText: postText,
                userRating: userRating
            }

            collection.insertOne(post, function(err, result) {
                if (result) {
                    var response = {
                        text: "successfully",
                        postId: postId
                    }

                    res.send(JSON.stringify(response));
                    db.close()
                } else {
                    var response = {
                        text: "error"
                    }

                    res.send(JSON.stringify(response));
                    db.close()
                }
            })
        })
    })
})
app.get("/get/mainpage", function(req, res) {
    var id = req.query.id;

    mongoClient.connect(url, function(err, db) {
        var collection = db.collection('users');

        collection.findOne({ userId: id }, function(err, doc) {
            if (doc) {
                var response = {
                    id: doc.userId,
                    name: doc.userName,
                    age: doc.userAge,
                    userRating: doc.userRating,
                    image: doc.userAvatar
                };

                res.send(JSON.stringify(response));
                db.close()
            } else {
                res.send("error");
                db.close()
            }
        })
    })
})

app.post("/api/users", function(req, res) {
    if (!req.body) return res.sendStatus(400);

    var userName = req.body.name;
    var userAge = req.body.age;
    var user = { name: userName, age: userAge };

    mongoClient.connect(url, function(err, client) {
        var db = client.db('test')
        db.collection("test").insertOne(user, function(err, result) {

            if (err) return res.status(400).send();

            res.send(user);
            client.close()
        });
    });
});

app.post("/signin", function(req, res) {
    if (!req.body) return res.sendStatus(400);

    var userLogin = req.body.login;
    var userPassword = req.body.password;

    mongoClient.connect(url, function(err, db) {
        var collection = db.collection('auth')

        collection.findOne({ login: userLogin }, function(err, doc) {
            if (doc) {
                var pass = doc.password;
                var firstEntry = doc.firstEntry;

                if (pass !== userPassword) {
                    var response = {
                        id: "empty",
                        firstEntry: "false",
                        isExist: true,
                        isCorrectPassword: false
                    };

                    res.send(JSON.stringify(response));
                    db.close()
                } else if (firstEntry === "true") {
                    var response = {
                        id: doc.userId,
                        firstEntry: "true",
                        isExist: true,
                        isCorrectPassword: true
                    };

                    collection.findOneAndUpdate({ "userId": doc.userId }, { $set: { "firstEntry": "false" } },
                        function(err, result) {
                            res.send(JSON.stringify(response));
                            db.close()
                        }
                    )
                } else {
                    var response = {
                        id: doc.userId,
                        firstEntry: "false",
                        isExist: true,
                        isCorrectPassword: true
                    };

                    res.send(JSON.stringify(response));
                    db.close()
                }
            } else {
                var response = {
                    id: "empty",
                    firstEntry: "false",
                    isExist: false,
                    isCorrectPassword: false
                };

                res.send(JSON.stringify(response));
                db.close()
            }
        })
    })
});

app.post("/signin/first", function(req, res) {
    if (!req.body) return res.sendStatus(400);

    var userId = req.body.userId;
    var userName = req.body.userName;
    var userAge = req.body.userAge;
    var userRating = req.body.userRating;
    var userAvatar = req.body.userAvatar;

    var user = { userId: userId, userName: userName, userAge: userAge, userRating: userRating, userAvatar: userAvatar };

    mongoClient.connect(url, function(err, db) {
        var collection = db.collection('users');
        collection.insertOne(user, function(err, result) {
            if (err) {
                var response = {
                    text: "error from insert"
                }

                res.send(JSON.stringify(response));
                db.close();
            } else {
                var response = {
                    text: "successful insertion"
                }

                res.send(JSON.stringify(response));
                db.close();
            }
        })
    })
});

app.post("/registration", function(req, res) {
    if (!req.body) return res.sendStatus(400);

    var userLogin = req.body.login;
    var userPassword = req.body.password;
    var id = req.body.userId;

    var user = { login: userLogin, password: userPassword, userId: id, firstEntry: "true" };

    mongoClient.connect(url, function(err, db) {
        console.log("Connected successfully to mongodb server")

        db.collection('auth').count({ login: userLogin }, function(err, count) {
            if (count === 0) {
                db.collection('auth').insertOne(user, function(err, r) {
                    if (err) return res.status(400).send();

                    var response = {
                        response: "ok",
                        id: r.userId
                    };

                    res.send(JSON.stringify(response));
                    db.close()
                });
            } else {
                var response = {
                    response: "login is already taken",
                    id: ":("
                };
                res.send(JSON.stringify(response));
                db.close()
            }
        });
    })
});

app.listen(3333, function() {
    console.log("Waiting to connect...")
})