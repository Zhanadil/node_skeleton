const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');

const to = require('await-to-js').default;
const config = require('@root/config');

const Models = require('@models');

// Доступ к сайту через токен
passport.use('jwt-user', new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: config.jwtSecret
}, async (payload, done) => {
    // Находим сессию в базе
    let [err, session] = await to(
        Models.Session.findOne({
            user: payload.sub.id,
        })
    );
    if (err) {
        return done(err, false);
    }
    if (!session) {
        return done(null, false);
    }

    // Находим пользователя
    const [errUser, user] = await to(
        Models.User.findById(payload.sub.id)
    );
    if (errUser) {
        return done(errUser, false);
    }
    if (!user) {
        return done(null, false);
    }

    return done(null, user);
}));

// Доступ к сайту через токен для админа
passport.use('jwt-admin', new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: config.jwtSecret
}, async (payload, done) => {
    // Находим сессию в базе
    let [err, session] = await to(
        Models.Session.findOne({
            user: payload.sub.id,
        })
    );
    if (err) {
        return done(err, false);
    }
    if (!session) {
        return done(null, false);
    }

    // Находим пользователя с популированными предприятиями
    const [errUser, user] = await to(
        Models.User.findById(payload.sub.id)
        .populate('organizations')
        .select('+isAdmin')
    );
    if (errUser) {
        return done(errUser, false);
    }
    if (!user || !user.isAdmin) {
        return done(null, false);
    }

    return done(null, user);
}));

// Логин через почту и токен
passport.use('local-user', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
}, async(email, password, done) => {
    const [err, user] = await to(
        Models.User.findOne({
            'credentials.email': email
        })
        .select('+credentials.password')
    );
    if (err) {
        return done(err, false);
    }
    if (!user) {
        return done(null, false);
    }

    // Проверяем пароль на корректность
    const isVerified = user.credentials.isValidPassword(password);

    if (!isVerified) {
        return done(null, false);
    }

    return done(null, user);
}));
