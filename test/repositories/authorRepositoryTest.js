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
      authorData = { name: 'Jean-Paul Sartre', pseudo: undefined, email: 'jp_sartre@academie-francaise.fr', language: 'french' }

      // when
      createdAuthor = await authorRepository.create(authorData)
    })

    // then
    it('should return a author with the right properties', async () => {
      const createdAuthorValue = createdAuthor.get()

      expect(createdAuthorValue.name).to.equal(authorData.name)
      expect(createdAuthorValue.age).to.equal(authorData.age)
      expect(createdAuthorValue.language).to.equal(authorData.language)

      retrievedAuthor = await authorRepository.get(createdAuthor.id)
      const retrievedAuthorValue = retrievedAuthor.get()

      expect(createdAuthorValue).to.deep.equal(retrievedAuthorValue)
    })
  })

  describe('listAll', () => {
    let lists

    context('when there is no authors in the repository', () => {

      beforeEach(async () => {
        // given

        // when
        lists = await authorRepository.listAll()
      })

      it('should return an empty list', () => {
        // then
        expect(lists).to.be.empty
      })
    })

    context('when there are two authors in the repository', () => {

      let itemte
      let itemre

      beforeEach(async () => {
        // given

        itemte = await authorRepository.create({ name: 'testing', pseudo: 'testing', email: 'testing', language: 'english' })
        itemre = await authorRepository.create({ name: 'retesting', pseudo: 'retesting', email: 'retesting', language: 'english' })

        // when
        lists = await authorRepository.listAll()
      })

      it('should return a list with the two authors', () => {
        // then
     
        const result = lists.map((author) => author.get())

        expect(result).to.deep.equal([itemte.get(), itemre.get()])
      })
    })
  })

  describe('listForLanguage', () => {
    
    let lists

    context('when there is are authors for that language in the repository, only some for other language', () => {

      beforeEach(async () => {
        // given
        itemte = await authorRepository.create({ name: 'testing', pseudo: 'testing', email: 'testing', language: 'french' })
        itemre = await authorRepository.create({ name: 'retesting', pseudo: 'retesting', email: 'retesting', language: 'english' })

        // when
                lists = await authorRepository.listForLanguage('nofound');

      })

      it('should return an empty list', () => {
        // then
                expect(lists).to.be.empty;

      })
    })

    context('when there are two authors in the repository for that language and some for other languages', () => {

          let itemte
        let itemre
      beforeEach(async () => {
        itemte = await authorRepository.create({ name: 'testing', pseudo: 'testing', email: 'testing', language: 'french' })
        itemre = await authorRepository.create({ name: 'retesting', pseudo: 'retesting', email: 'retesting', language: 'french' })
     

        // when
        lists = await authorRepository.listForLanguage('french')

      })

      it('should return a list with the two authors', () => {
    
        const result = lists.map((author) => author.get())

        expect(result).to.deep.equal([itemte.get(), itemre.get()])      })
    })
  })
})
