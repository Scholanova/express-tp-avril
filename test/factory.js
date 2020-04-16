const models = require('../lib/models')
const Author = models.Author

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
    return new Author({id,  name, pseudo, email, language })
  }
}

module.exports = factory
