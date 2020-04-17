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
            .then(async (bookData) => {
                let nbBooks = (await bookRepository.listForAuthor(bookData.authorId)).length
                
                const { _, error } = maxBookSchema.validate(nbBooks, {abortEarly: false})

                if ( error ) { 
                    throw error
                }
                
                return bookData
            })
            .then(bookRepository.create)
    },
}

module.exports = bookService