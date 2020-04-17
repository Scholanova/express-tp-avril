const { ResourceNotFoundError } = require('../errors')

const models = require('../models')
const Book = models.Book

const bookRepository = {
    get: (id) => {
        return Book.findOne({ where: { id } })
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
        return book.findAll()
    },
    listForAuthor: (authorId) => {
        return book.findAll({where: { authorId } })
    },
    listForLanguage: (language) => {
        return book.findAll({where: { language } })
    }
}

module.exports = bookRepository 