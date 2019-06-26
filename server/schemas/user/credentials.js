const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const to = require('await-to-js').default;

// Схема авторизации юзеров
const credentialsSchema = mongoose.Schema({
    // Метод регистрации: гугл, фэйсбук или стандартный
    // На данный момент используется только стандарт
    method: {
        type: String,
        enum: ['standard'],
        default: 'standard',
    },
    email: {
        type: String,
        lowercase: true,
        unique: true,
    },
    // Пароль в виде хэша
    password: {
        type: String,
        select: false,
    },
}, { _id : false });

// Проверка пароля на валидность
credentialsSchema.methods.isValidPassword = async function(newPassword) {
    if (!this.password) {
        return false;
    }

    const [err, res] = await to(
      bcrypt.compare(
        newPassword,
        this.password
      )
    );
    return res;
}

// Хэширование пароля перед сохранением
credentialsSchema.pre('save', function(next) {
    // Хэшируем только если пароль был изменен.
    // Иначе он может быть захэширован несколько раз и пароль будет утерян
    if (!this.isModified('password')) {
        return next();
    }

    bcrypt.genSalt(10, (salt) => {
        bcrypt.hash(this.password, salt, null, (err, hash) => {
            if (err) {
                return next(err);
            }
            this.password = hash;
            return next();
        })
    });
});

module.exports = credentialsSchema;
