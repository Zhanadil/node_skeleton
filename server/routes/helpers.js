const joi = require('joi');
const formdata = require('form-data');
const http = require('http');
const jwt = require('jsonwebtoken');
const to = require('await-to-js').default;

const config = require('@root/config');
const Models = require('@models');

module.exports = {

// Валидатор тела запросов, проверяет что запрос подходит по значениям
// Пример:
// Схема запроса /user/auth/signin:
// {
//   email: email,
//   password: string,
// }
// То валидатор проверит, что тело запроса подходит под эту схему
// Все лишние/недостающие аргументы будут зачтены за ошибку.
// Все аргументы не подходящие по типу также будут считаться ошибкой.
validateBody: (schema) => {
    return (req, res, next) => {
        try {
            const result = joi.validate(req.body, schema);

            if (result.error) {
                return res.status(400).json(result.error);
            }

            if (!req.value) {
                req.value = {};
            }

            req.value['body'] = result.value;

            return next();
        } catch(err) {
            req.log.error('Unexpected error, probably schema content is incorrect');
            return next(err);
        }
    }
},

// Сохраняем сессию
updateSession: async (user) => {
    // Создаем новый токен
    const token = await jwt.sign({
        iss: 'node',
        sub: {
            id: user._id,
        },
        iat: Date.now(),
    }, config.jwtSecret);

    // Находим сессию пользователя если существует
    const [err] = await to(
        Models.Session.findOneAndUpdate({
            user: user._id,
        }, {
            token
        }, {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
        })
    );
    if (err) {
        console.log(err);
        throw err;
    }

    return token;
},

uploadFile: (file, cb) => {
    if (!cb) {
        throw new Error('callback function must be defined');
    }

    // formdata которая будет отправлена на сервер
    let form = new formdata();

    form.append('file', file.data, {
        filename: file.name,
    });

    // Хедеры html запроса, включают в себя инфо о файле и токен для авторизации
    let headers = form.getHeaders();

    // Сам http запрос
    const request = http.request({
        method: 'post',
        host: config.fileServerHost,
        port: config.fileServerPort,
        path: '/upload/image',
        headers,
    });

    // Отправляем файл
    form.pipe(request);

    request.on('error', (err) => {
        cb(err);
    });

    // Ответ на запрос присылается кусками
    // Присоединяем все куски к строке, а затем парсим в json
    let rawData = "";
    request.on('response', (response) => {
        response.on('data', (data) => {
            rawData += data;
        });
        response.on('end', () => {
            // Парсим в json
            try {
                const jsonData = JSON.parse(rawData);
                cb(null, {
                    statusCode: response.statusCode,
                    message: jsonData,
                });
            } catch (error) {
                // Если не смогли спарсить, то скорее всего ответ пришел в html
                // Возвращаем в том же виде
                cb(null, {
                    statusCode: response.statusCode,
                    message: rawData,
                });
            }
        });
    });
},

};
