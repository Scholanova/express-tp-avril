const Joi = require('@hapi/joi')
const bookRepository = require('../repositories/bookRepository')

const bookSchema = Joi.object({
  title: Joi.string().min(4,'utf8').required(),
  authorId: Joi.number()
})

const bookService = {
  create: (bookData) => {
    return Promise.resolve(bookData)
      .then((bookData) => {
        const { value, error } = bookSchema.validate(bookData, {abortEarly: false})

        if (error) { throw error }
        return value
      })
      .then(bookRepository.create)
  }
}

module.exports = bookService
