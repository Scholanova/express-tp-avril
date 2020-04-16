const { ResourceNotFoundError } = require('../errors')

const models = require('../models')
const Author = models.Author

const authorRepository = {
  get: (id) => {
    return Author.findOne({ where: { id } })
      .then((authorResult) => {
        if (authorResult === null) {
          throw new ResourceNotFoundError()
        }
        return authorResult
      })
  },
  create: (authorData) => {
    const author = new Author(authorData)
    return author.save()
  },
  listAll: () => {
    return Author.findAll()
  },
  listForLanguage (language) {
    return Author.findAll({ where: { language } })
  }
}

module.exports = authorRepository
