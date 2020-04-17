const Joi = require('@hapi/joi')
const bookRepository = require('../repositories/bookRepository')

const bookSchema = Joi.object({
  title: Joi.string().min(4,'utf8').required(),
  authorId: Joi.number()
})

const bookAuthorSchema = Joi.number().required();

const bookService = {
  create: (bookData) => {
    return Promise.resolve(bookData)
      .then((bookData) => {
        const { value, error } = bookSchema.validate(bookData, {abortEarly: false})

        if (error) { throw error }
        return value
      })
      .then(bookRepository.create)
  },
  listForAuthor: (authorId) => {
    return Promise.resolve(authorId)
      .then((authorId) => {
        const { value, error } = bookAuthorSchema.validate(authorId, {abortEarly: false})
      
        if (error) { throw error }
        return authorId
      })
      .then(bookRepository.listForAuthor)
  }
}

module.exports = bookService
