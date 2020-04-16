const factory = {
  createAuthorData: ({
    name = 'Jean-Jacques Rousseau',
    pseudo = 'JJR',
    email = 'jj@rousseau.ch',
    language = 'french'
  } = {}) => {
    return { name, pseudo, email, language }
  }
}

module.exports = factory
