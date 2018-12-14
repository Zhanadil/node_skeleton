const express = require('express');

const middleware = require('@middleware/auth');
const controllers = require('@routes/user/controllers/profile');

const router = express.Router();

router.use(middleware.validateUser);

router.put(
    '/logo',
    controllers.loadLogo
);

router.get(
    '/',
    controllers.getProfile
);

module.exports = router;
