const models = require('../lib/models')
const Author = models.Author
const Book = models.Book

const factory = {
  createAuthorData: ({
    name = 'Jean-Jacques Rousseau',
    pseudo = 'JJR',
    email = 'jj@rousseau.ch',
    language = 'french'
  } = {}) => {
    return { name, pseudo, email, language }
  },
  createAuthor: ({
    id = 756,
    name = 'Jean-Jacques Rousseau',
    pseudo = 'JJR',
    email = 'jj@rousseau.ch',
    language = 'french'
  } = {}) => {
    return new Author({ id, name, pseudo, email, language })
  },
  createBookData: ({
    title = 'La Profession de foi du vicaire savoyard',
    authorId = 231
  } = {}) => {
    return { title, authorId }
  },
  createBook: ({
    id = 756,
    title = 'La Profession de foi du vicaire savoyard',
    authorId = 231
  } = {}) => {
    return new Book({ id, title, authorId })
  }
}

module.exports = factory
