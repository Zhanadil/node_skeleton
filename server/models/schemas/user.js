const mongoose = require('mongoose');

const credentialsSchema = require('@models/schemas/credentials');

// Схема пользователей
const userSchema = mongoose.Schema({
    credentials: credentialsSchema,
    isAdmin: {
        type: Boolean,
        default: false,
        select: false,
    },
});

module.exports = userSchema;
