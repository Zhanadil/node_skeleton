const helpers = require('@routes/helpers');

// Контроллеры на экспорт.
module.exports = {

getProfile: (req, res, next) => {
    return res.status(200).json(req.user);
},

loadLogo: (req, res, next) => {
    if (!req.files || !req.files.logo) {
        req.log.info('logo was not received');
        return res.status(400).send('logo was not received');
    }

    helpers.uploadFile(req.files.logo, (uploadError, response) => {
        if (uploadError) {
            req.log.error('logo upload error');
            return next(uploadError);
        }

        if (response.statusCode !== 200) {
            req.log.info('error on fileserver side');
            return res.status(response.statusCode).send(response.message);
        }

        req.log.info(`logo was uploaded, url:[${response.message}]`);
        return res.status(200).send(response.message);
    });
},

};
