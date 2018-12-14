const to = require('await-to-js').default;
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

// Проверяет куки, и залогинена ли компания
validateUser: async (req, res, next) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).send('Unauthorized');
    }

    // Находим пользователя по айди сохраненному в сессии
    const [err, user] = await to(
        Models.User.findById(req.session.userId)
    );
    if (err) {
        req.log.error('User.findById throwed an error');
        return next(err);
    }
    if (!user) {
        req.log.warning(`User [${req.session.userId}] does not exist`);
        return res.status(401).send('Unauthorized');
    }

    // Передаем пользователя далее
    req.user = user;

    next();
},

};
