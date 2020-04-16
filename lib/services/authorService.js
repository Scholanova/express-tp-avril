const Joi = require('@hapi/joi')
const authorRepository = require('../repositories/authorRepository')

const authorSchema = Joi.object({
  name: Joi.string().required().min(4, 'utf8'),
  pseudo: Joi.string(),
  email: Joi.string().email().required(),
  language: Joi.any().required()
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
        if ( !authorLanguage ) {
          throw new Joi.ValidationError('"language" is required')
        }

        if ( ['FR', 'EN'].indexOf(authorLanguage.toUpperCase()) == -1 ) {
          throw new Joi.ValidationError(`"language" ${authorLanguage} is unsupported`)
        }

        return authorLanguage
      })
      .then(authorRepository.listForLanguage)
  }
}

module.exports = authorService
