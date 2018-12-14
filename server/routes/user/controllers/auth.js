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

    helpers.saveUserSession(req.session, user);

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
    const [err, user] = await to(
        Models.User.findOne({
            'credentials.email': req.body.email
        })
        .select('+credentials.password')
        .select('+isAdmin')
    );
    if (err) {
        req.log.error('User.findOne raised an error');
        return next(err);
    }
    if (!user) {
        req.log.info(`Signin for email[${req.body.email}] failed, incorrect email`);
        return res.status(401).send('Unauthorized');
    }

    // Проверяем пароль на корректность
    const isVerified = await user.credentials.isValidPassword(req.body.password);

    if (!isVerified) {
        req.log.info(`Password is not correct`);
        return res.status(401).send('Unauthorized');
    }

    // Сохраняем сессию и возвращаем 200
    helpers.saveUserSession(req.session, user);
    if (!user.isAdmin) {
        req.log.info(`User [${req.body.email}] logged in`);
        return res.status(200).send('OK');
    }
    req.log.info(`Admin [${req.body.email}] logged in`);
    return res.status(200).send("admin");
},

};
