var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var authSchema = mongoose.Schema({
    _id: Schema.Types.ObjectId,
    login: String,
    password: String,
    isFirst: {
        type: String,
        default: 'true'
    }
}, {
    versionKey: false
});

var Auth = mongoose.model("Auth", authSchema);
module.exports = Auth;