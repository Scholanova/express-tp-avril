const Joi = require('@hapi/joi')
const authorRepository = require('../repositories/authorRepository')

const authorSchemalanguage = Joi.string().required().valid("french","english")

const authorSchema = Joi.object({
  name: Joi.string().min(4,'utf8').required(),
  pseudo: Joi.string(),
  email: Joi.string().email().required(),
  language: authorSchemalanguage
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
  listForLanguage:(language)=>{
    return Promise.resolve(language)
      .then((language) => {
        const { value, error } = authorSchemalanguage.validate(language, {abortEarly: false})

        if (error) { throw error }
        return value
      })
      .then(authorRepository.listForLanguage(language))
    }
  }

module.exports = authorService
