const mongoose = require('mongoose');

const userSchema = require('@models/schemas/user');

const user = mongoose.model('user', userSchema);

module.exports = user;
