const express = require('express');

const helpers = require('@routes/helpers');
const middleware = require('@middleware/auth');
const controllers = require('@routes/user/controllers/auth');
const validators = require('@routes/user/validators/auth');

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
    controllers.signIn
);

module.exports = router;
