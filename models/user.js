var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    id: String,
    name: {
        firstName: {
            type: String,
            required: true
        },
        lastname: {
            type: String,
            required: true
        }
    },
    age: {
        type: Number,
        required: true
    },
    vk: {
        type: String,
        validate: {
            validator: function(text) {
                return text.indexOf('https://vk.com/') === 0;
            },
            message: 'VK handle must start with https://vk.com/'
        }
    },
    phone: {
        type: String,
        validate: {
            validator: function(text) {
                return text.indexOf('+375') === 0;
            },
            message: 'phone number must start with +375'
        }
    },
    avatar: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    }
});

var User = mongoose.model("user", userSchema);

module.exports = User