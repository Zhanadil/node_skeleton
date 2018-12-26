const express = require('express');
const passport = require('passport');

const controllers = require('@routes/user/profile/controllers');

const router = express.Router();

router.use(passport.authenticate('jwt-user', { session: false }));

router.put(
    '/logo',
    controllers.loadLogo
);

router.get(
    '/',
    controllers.getProfile
);

module.exports = router;
