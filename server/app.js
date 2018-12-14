const express = require('express');
const body_parser = require('body-parser');
const http = require('http');
const ip = require('ip');
const mkdirp = require('mkdirp');
const fs = require('fs');
const cors = require('cors');
const fileUpload = require('express-fileupload');

const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);

const router = require('@routes');

const config = require('@root/config');

class App {
    constructor() {
        this.log = require('@lib/logger').generalLogger;
        let configError = this.checkConfigs();
        if (configError) {
            this.log.fatal(configError);
            process.exit(1);
        }

        this.env = config.env;
        this.httpPort = config.httpPort;
        this.host = process.env.HOST || ip.address();

        // Создаем папки с логами и ресурсами если их нет.
        this.ensureDirectories();

        // Подключаем базу данных
        mongoose.Promise = global.Promise;
        let connectionOptions = {
            auth: {
                authSource: "admin"
            },
            useNewUrlParser: true,
        };
        if (this.env !== 'production') {
            connectionOptions.auth = undefined;
        }
        mongoose.connect(
            config.DBHost,
            connectionOptions,
            (err) => {
                if(err){
                    this.log.error(err);
                    this.log.fatal('Could not connect to mongodb');
                    process.exit(1);
                }
                this.applyRouters(this.express);
            }
        )

        this.express = express();
        this.httpServer = http.createServer(this.express);

        this.applyRouters(this.express);
    }

    // Проверяем, что все конфигурации верны
    checkConfigs() {
        for (let key in config) {
            if (config[key] === '__FATAL__') {
                return `${key} configuration is not set`;
            }
        }

        return null;
    }

    // Проверяет директории, если не существуют пытается создать
    ensureDirectories() {
        try {
            // Рекурсивно создаем папку с логами
            mkdirp.sync(config.logsDirectory);
            // Проверяем на действительность
            fs.statSync(config.logsDirectory);
        } catch(err) {
            this.log.fatal({
                error: err,
                message: 'Could not create directories',
            })
            // Не запускаем сервер без логгера
            process.exit(3);
        }
    }

    applyRouters(express) {
        if (!express) {
            this.log.fatal('Could not apply routers');
            process.exit(4);
        }

        // Подключаем нужные нам миддлы
        // Логгер обязательно должен быть вызван после создания папок с логами
        // Иначе может крашнуться.
        express.use(require('@root/lib/logger').expressLogger);
        express.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', "*");
            res.header('Access-Control-Allow-Credentials', 'true');
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Content-Type,  Access-Control-Allow-Headers, Authorization, X-Requested-With');
            next();
        });
        express.use(cors());
        express.use(body_parser.json());
        express.use(fileUpload());

        express.set('trust proxy', 1);
        express.use(session({
            secret: config.sessionSecret,
            resave: false,
            saveUninitialized: true,
            store: new MongoStore({ mongooseConnection: mongoose.connection })
        }));

        // Подключаем роутеры
        express.use('/api', router);

        // Обработка 404
        express.use((req, res) => {
            return res.status(404).send('sorry, page not found');
        });

        // Обработка ошибок
        // eslint-disable-next-line
        express.use((err, req, res, next) => {
            req.log.error({
                log_info: {
                    err
                }
            });

            return res.status(err.status || 500).send("Sorry, internal error. Please, try again");
        });
    }
}

module.exports = new App();
