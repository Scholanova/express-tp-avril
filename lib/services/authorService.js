const Joi = require('@hapi/joi')
const authorRepository = require('../repositories/authorRepository')

const authorSchema = Joi.object({
  name: Joi.string().min(4,'utf8').required(),
  pseudo: Joi.string(),
  email: Joi.string().email().required(),
  language: Joi.any().required().valid('french', 'english')
})

const authorLanguageSchema = Joi.object({
  language: Joi.any().required().valid('french', 'english')
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

  listForLanguage: (language) => {
    return Promise.resolve(language)
      .then((language) => {
        if ( !language ) {
          throw new Joi.ValidationError('"language" is required')
        }

        if (['english', 'french'].indexOf(language) == -1) {
          throw new Joi.ValidationError('"language" must be "french" or "english"')
        }

        return language
      })
      .then(authorRepository.listForLanguage)
    }
}

module.exports = authorService