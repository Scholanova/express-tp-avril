const Joi = require('@hapi/joi')
const authorRepository = require('../repositories/authorRepository')

const authorSchema = Joi.object({
  name: Joi.string().required().min(4,'utf8'),
  pseudo: Joi.string(),
  email: Joi.string().email().required(),
  language : Joi.string().required().valid('french','english'),
})

const languageSchema = Joi.object({ language: Joi.string().required().valid('french','english'),})

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
  listForLanguage: (languageData) => {
    return Promise.resolve(languageData)
      .then((languageData) => {
        const { value, error } = languageSchema.validate(languageData, {abortEarly: false})

        if (error) { throw error }
        return value
      })
      .then(authorRepository.listForLanguage)
  }
}

module.exports = authorService
