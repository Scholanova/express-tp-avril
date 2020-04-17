const { expect } = require('../testHelper')

const authorRepository = require('../../lib/repositories/authorRepository')
const models = require('../../lib/models')
const { ResourceNotFoundError } = require('../../lib/errors')
const Author = models.Author

describe('authorRepository', () => {

  afterEach(async () => {
    await Author.destroy({ where: {} })
  })

  describe('get', () => {

    let notExistingId
    let getAuthorPromise

    context('author does not exist', () => {
      beforeEach(async () => {
        // given
        notExistingId = 23456789

        // when
        getAuthorPromise = authorRepository.get(notExistingId)
      })

      it('should throw a not found error', () => {
        // then
        return expect(getAuthorPromise).to.eventually.be.rejectedWith(ResourceNotFoundError)
      })
    })
  })

  describe('create', () => {

    let createdAuthor
    let retrievedAuthor
    let authorData

    beforeEach(async () => {
      // given
      authorData = { name: 'Jean-Paul Sartre', pseudo: undefined, email: 'jp_sartre@academie-francaise.fr' }

      // when
      createdAuthor = await authorRepository.create(authorData)
    })

    // then
    it('should return a author with the right properties', async () => {
      const createdAuthorValue = createdAuthor.get()

      expect(createdAuthorValue.name).to.equal(authorData.name)
      expect(createdAuthorValue.age).to.equal(authorData.age)

      retrievedAuthor = await authorRepository.get(createdAuthor.id)
      const retrievedAuthorValue = retrievedAuthor.get()

      expect(createdAuthorValue).to.deep.equal(retrievedAuthorValue)
    })
  })

  describe('listAll', () => {
    let result

    context('when there is no authors in the repository', () => {

      beforeEach(async () => {
        // given

        // when
        result = await authorRepository.listAll()
      })

      it('should return an empty list', () => {
        // then
        expect(result).to.be.empty
      })
    })

    context('when there are two authors in the repository', () => {

      let author1
      let author2

      beforeEach(async () => {
        // given
        const jjrData = { name: 'Jean-Jacques Rousseau', pseudo: 'JJR', email: 'jj@rousseau.ch' }
        const ppData = { name: 'Philip Pullman', pseudo: 'Philip', email: 'philip@pullman.co.uk' }
        author1 = await authorRepository.create(jjrData)
        author2 = await authorRepository.create(ppData)

        // when
        result = await authorRepository.listAll()
      })

      it('should return a list with the two authors', () => {
        // then
        const author1Value = author1.get()
        const author2Value = author2.get()
        const resultValues = result.map((author) => author.get())

        expect(resultValues).to.deep.equal([author1Value, author2Value])
      })
    })
  })

  describe('listForLanguage', () => {
    let result
    let author1
    let author2
    let author3

    context('when there is are authors for that language in the repository, only some for other language', () => {

      beforeEach(async () => {
        // given
        const a1 = { name: 'Jean-Jacques Rousseau', pseudo: 'JJR', email: 'jj@rousseau.ch' , language: 'french' }
        const a2 = { name: 'Philip Pullman', pseudo: 'Philip', email: 'philip@pullman.co.uk' , language: 'french' }
        const a3 = { name: 'Philip Pullman', pseudo: 'Philip', email: 'philip@pullman.co.uk' , language: 'french' }

        author1 = await authorRepository.create(a1)
        author2 = await authorRepository.create(a2)
        author3 = await authorRepository.create(a3)

        // when
        result = await authorRepository.listForLanguage('english')

      })

      it('should return an empty list', () => {
        // then
        expect(result).to.be.empty
      })
    })

    context('when there are two authors in the repository for that language and some for other languages', () => {

      let result
      let author1
      let author2
      let author3
      beforeEach(async () => {
        // given
        const a1 = { name: 'Jean-Jacques Rousseau', pseudo: 'JJR', email: 'jj@rousseau.ch', language: 'english' }
        const a2 = { name: 'Philip Pullman', pseudo: 'Philip', email: 'philip@pullman.co.uk', language: 'english' }
        const a3 = { name: 'toto', pseudo: 'toto', email: 'toto@gmail.co.uk', language: 'french' }
        author1 = await authorRepository.create(a1)
        author2 = await authorRepository.create(a2)
        author3 = await authorRepository.create(a3)

        // when
        result = await authorRepository.listForLanguage('english')

      })

      it('should return a list with the two authors', () => {
        const author1Value = author1.get()
        const author2Value = author2.get()
        const resultValues = result.map((author) => author.get())

        expect(resultValues).to.deep.equal([author1Value, author2Value])
      })
    })
  })
})
