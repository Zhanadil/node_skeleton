const to = require('await-to-js').default;
const passport = require('passport');
const Models = require('@models');

module.exports = {

// Проверяет свободна ли почта компании
checkUserEmailEmpty: async (req, res, next) => {
    const [err, user] = await to(
        Models.User.findOne({
            'credentials.email': req.body.email
        })
    );
    if (err) {
        req.log.error('User.findOne raised an error');
        return next(err);
    }
    if (user) {
        return res.status(400).send("Email is already in use");
    }

    return next();
},

localAuth: (req, res, next) => {
    passport.authenticate('local-user', { session: false }, (err, user) => {
        if (err) {
            return next(err);
        }

        if (!user) {
            return res.status(401).send('Неправильный логин или пароль');
        }

        req.user = user;
        return next();
    })(req, res, next)
},

};
