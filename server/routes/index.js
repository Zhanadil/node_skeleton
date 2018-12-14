const router = require('express').Router();

const userRouter = require('@routes/user');

router.use('/user', userRouter);

module.exports = router;
