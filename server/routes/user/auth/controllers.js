const to = require('await-to-js').default;
const Models = require('@models');
const helpers = require('@routes/helpers');

// Контроллеры на экспорт.
module.exports = {

// Регистрация пользователя
signUp: async (req, res, next) => {
    const userData = {
        credentials: {
            email: req.body.email,
            password: req.body.password,
        },
    };
    const [err, user] = await to(
        new Models.User(userData).save()
    );
    if (err) {
        req.log.error('Could not create new user');
        return next(err);
    }

    await helpers.updateSession(user);

    // Скрываем пароль для логов
    user.credentials.password = undefined;
    req.log.info(
        {
            log_info: {
                user
            },
        },
        'New user signed up'
    );
    return res.status(200).send('OK');
},

signIn: async (req, res, next) => {
    const user = req.user;
    const [tokenError, token] = await to(
        helpers.updateSession(user)
    );
    if (tokenError) {
        req.log.error('Error updating user session');
        console.log(tokenError);
        return next(tokenError);
    }

    if (!user.isAdmin) {
        req.log.info(`User [${req.body.email}] logged in`);
        return res.status(200).json({
            token,
        });
    }
    req.log.info(`Admin [${req.body.email}] logged in`);
    return res.status(200).send({
        token,
        admin: 'true',
    });
},

};
