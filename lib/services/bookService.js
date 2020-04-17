const Joi = require('@hapi/joi')
const bookRepository = require('../repositories/bookRepository')

const bookSchema = Joi.object({
    authorId: Joi.number().required(),
    title: Joi.string().required()
})

const maxBookSchema = Joi.number().max(4).message('Author cannot have more than 5 books');

const bookService = {
    create: (bookData) => {
        return Promise.resolve(bookData)
            .then((bookData) => {
                const { value, error } = bookSchema.validate(bookData, {abortEarly: false})

                if (error) { throw error }
                return value
            })
            .then(hasReachedMaxBooks)
            .then(hasNoDuplicatedBook)
            .then(bookRepository.create)
    },
}

function hasReachedMaxBooks(bookData) {
    return bookRepository.listForAuthor(bookData.authorId)
        .then((books) => {
            const { _, error } = maxBookSchema.validate(books.length, {abortEarly: false})
            if (error) { throw error }
            return bookData
        })
}

function hasNoDuplicatedBook(bookData) {
    return bookRepository.listForAuthor(bookData.authorId)
        .then((books) => {
            let duplicateBookSchema = Joi.string().invalid(...books.map(book => book.title))
            const { _, error } = duplicateBookSchema.validate(bookData.title)
            if (error) { 
                error.details[0].message = `Book ${bookData.title} already exist`
                error.stack = error.stack.replace(error.message, `Book ${bookData.title} already exist`)
                error.message = `Book ${bookData.title} already exist`
                throw error 
            }
            return bookData
        })
}

module.exports = bookService