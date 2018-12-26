const mongoose = require('mongoose');

const userSchema = require('@schemas/user');

const user = mongoose.model('user', userSchema);

module.exports = user;
