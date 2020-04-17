const Joi = require('@hapi/joi')
const authorRepository = require('../repositories/authorRepository')

const languageSchema = Joi.any().required().valid('french', 'english')

const authorSchema = Joi.object({
  name: Joi.string().required().min(4, 'utf8'),
  pseudo: Joi.string(),
  email: Joi.string().email().required(),
  language: languageSchema
})


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
  listForLanguage: (authorLanguage) => {
    return Promise.resolve(authorLanguage)
      .then((authorLanguage) => {
        const { value, error } = languageSchema.validate(authorLanguage, {abortEarly: false})

        if (error) { throw error }
        return value
      })
      .then(authorRepository.listForLanguage)
  }
}

module.exports = authorService
