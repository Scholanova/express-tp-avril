const Joi = require('@hapi/joi')
const bookRepository = require('../repositories/bookRepository')

const bookSchema = Joi.object({
    authorId: Joi.number().required(),
    title: Joi.string().required()
})

const authorLibrairySchema = Joi.array().items(Joi.object({
    id: Joi.optional(),
    authorId: Joi.number(),
    title: Joi.string(),
    createdAt: Joi.optional(),
    updatedAt: Joi.optional()
})).unique('title').message('Duplicated book').max(5).message('Author cannot have more than 5 books');

const bookService = {
    create: (bookData) => {
        return Promise.resolve(bookData)
            .then((bookData) => {
                const { value, error } = bookSchema.validate(bookData, {abortEarly: false})

                if (error) { throw error }
                return value
            })
            .then(validateRules)
            .then(bookRepository.create)
    },
}

function validateRules(bookData) {
    return bookRepository.listForAuthor(bookData.authorId)
        .then((books) => {
            let tmp = [...books.map(book => book.get()), bookData]
            const { _, error } = authorLibrairySchema.validate(tmp, {abortEarly: false})
            if (error) { 
                for(var i = 0; i < error.details.length; i++) {
                    error.details[i].path = ["title"]
                }
                throw error
            }
            return bookData
        })
}

module.exports = bookService