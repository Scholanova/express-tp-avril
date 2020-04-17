const { ResourceNotFoundError } = require('../errors')

const models = require('../models')
const Book = models.book

const bookRepository = {
  get: (id) => {
    return book.findOne({ where: { id } })
      .then((bookResult) => {
        if (bookResult === null) {
          throw new ResourceNotFoundError()
        }
        return bookResult
      })
  },
  create: (bookData) => {
    const book = new Book(bookData)
    return book.save()
  },
  listAll: () => {
    return Book.findAll()
  },
  listForLanguage (language) {
    return Book.findAll({ where: { language } })
  }
}

module.exports = bookRepository
