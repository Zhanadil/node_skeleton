const joi = require('joi');

module.exports = {

signUp: joi.object().keys({
    email: joi.string().email({ minDomainAtoms: 2 }).required(),
    password: joi.string().required(),
}),

signIn: joi.object().keys({
    email: joi.string().email({ minDomainAtoms: 2 }).required(),
    password: joi.string().required(),
}),

};
