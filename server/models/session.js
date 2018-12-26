const mongoose = require('mongoose');

const sessionSchema = require('@schemas/session');

const session = mongoose.model('session', sessionSchema);

module.exports = session;
