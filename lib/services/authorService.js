const Joi = require('@hapi/joi')
const authorRepository = require('../repositories/authorRepository')

const authorSchema = Joi.object({
  name: Joi.string().min(4,'utf8').required(),
  pseudo: Joi.string(),
  email: Joi.string().email().required(),
  language: Joi.string().valid('french', 'english').required()
})

const authorLanguageSchema = Joi.string().valid('french', 'english').required();

const authorService = {
  create: (authorData) => {
    return Promise.resolve(authorData)
      .then((authorData) => {
        const { value, error } = authorSchema.validate(authorData, {abortEarly: false})

        if (error) { throw error }
        return value
      })
      .then(authorRepository.create)
  },
  //pouvoir verifier les parametres d'appel au repository
  listForLanguage: (authorLanguage) => {
    return Promise.resolve(authorLanguage)
      .then((authorLanguage) => {
        const { value, error } = authorLanguageSchema.validate(authorLanguage, {abortEarly: false})
      
        if (error) { throw error }
        return authorLanguage
      })
      .then(authorRepository.listForLanguage)
  }
}

module.exports = authorService
