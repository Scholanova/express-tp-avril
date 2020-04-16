const { expect, factory } = require('../testHelper')

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
      authorData = factory.createAuthorData()

      // when
      createdAuthor = await authorRepository.create(authorData)
    })

    // then
    it('should return a author with the right properties', async () => {
      const createdAuthorValue = createdAuthor.get()

      expect(createdAuthorValue.name).to.equal(authorData.name)
      expect(createdAuthorValue.pseudo).to.equal(authorData.pseudo)
      expect(createdAuthorValue.email).to.equal(authorData.email)
      expect(createdAuthorValue.language).to.equal(authorData.language)

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
        const jjrData = factory.createAuthorData({
          name: 'Jean-Jacques Rousseau',
          pseudo: 'JJR',
          email: 'jj@rousseau.ch',
          language: 'french'
        })
        const ppData = factory.createAuthorData({
          name: 'Philip Pullman',
          pseudo: 'Philip',
          email: 'philip@pullman.co.uk',
          language: 'english'
        })
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

    context('when there is are authors for that language in the repository, only some for other language', () => {

      beforeEach(async () => {
        // given
        const authorData1 = factory.createAuthorData({ language: 'french' })
        const authorData2 = factory.createAuthorData({ language: 'french' })
        await authorRepository.create(authorData1)
        await authorRepository.create(authorData2)

        // when
        result = await authorRepository.listForLanguage('english')
      })

      it('should return an empty list', () => {
        // then
        expect(result).to.be.empty
      })
    })

    context('when there are two authors in the repository for that language and some for other languages', () => {

      let author1
      let author2

      beforeEach(async () => {
        // given
        const authorData1 = factory.createAuthorData({ language: 'french' })
        const authorData2 = factory.createAuthorData({ language: 'french' })
        const authorData3 = factory.createAuthorData({ language: 'english' })
        author1 = await authorRepository.create(authorData1)
        author2 = await authorRepository.create(authorData2)
        await authorRepository.create(authorData3)

        // when
        result = await authorRepository.listForLanguage('french')
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
})
