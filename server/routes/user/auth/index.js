const express = require('express');

const helpers = require('@routes/helpers');
const middleware = require('@middleware/auth');
const controllers = require('@routes/user/auth/controllers');
const validators = require('@routes/user/auth/validators');

const router = express.Router();

router.post(
    '/signup',
    helpers.validateBody(validators.signUp),
    middleware.checkUserEmailEmpty,
    controllers.signUp
);

router.post(
    '/signin',
    helpers.validateBody(validators.signIn),
    middleware.localAuth,
    controllers.signIn
);

module.exports = router;
