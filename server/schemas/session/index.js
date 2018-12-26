const mongoose = require('mongoose');

// Схема сессии
const sessionSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    token: String,
});

module.exports = sessionSchema;
