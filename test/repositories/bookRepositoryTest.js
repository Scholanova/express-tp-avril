const { expect, factory } = require('../testHelper')
const { SequelizeForeignKeyConstraintError } = require('sequelize')
const authorRepository = require('../../lib/repositories/authorRepository')
const bookRepository = require('../../lib/repositories/bookRepository')
const models = require('../../lib/models')
const { ResourceNotFoundError } = require('../../lib/errors')
const Book = models.Book

describe('bookRepository', () => {

  afterEach(async () => {
    await Book.destroy({ where: {} })
  })

  describe('get', () => {

    let notExistingId
    let getBookPromise

    context('book does not exist', () => {
      beforeEach(async () => {
        // given
        notExistingId = 23456789

        // when
        getBookPromise = bookRepository.get(notExistingId)
      })

      it('should throw a not found error', () => {
        // then
        return expect(getBookPromise).to.eventually.be.rejectedWith(ResourceNotFoundError)
      })
    })
  })

  describe('create', () => {

    context('with a pre-existing author', () => {

      let createdBook
      let retrievedBook
      let bookData
      let existingAuthor

      beforeEach(async () => {
        // given
        existingAuthor = await authorRepository.create(factory.createAuthorData())
        bookData = factory.createBookData({ authorId: existingAuthor.id })

        // when
        createdBook = await bookRepository.create(bookData)
      })

      // then
      it('should return a book with the right properties', async () => {
        const createdBookValue = createdBook.get()

        expect(createdBookValue.title).to.equal(bookData.title)
        expect(createdBookValue.authorId).to.equal(bookData.authorId)

        retrievedBook = await bookRepository.get(createdBook.id)
        const retrievedBookValue = retrievedBook.get()

        expect(createdBookValue).to.deep.equal(retrievedBookValue)
      })
    })

    context('with no pre-existing author', () => {

      let createBookPromise
      beforeEach(() => {
        // given
        const fakeAuthorId = 124256
        let bookData = factory.createBookData({ authorId: fakeAuthorId })

        // when
        createBookPromise = bookRepository.create(bookData)
      })

      // then
      it('should return a book with the right properties', () => {
        return expect(createBookPromise).to.eventually.be.rejectedWith(SequelizeForeignKeyConstraintError)
      })
    })
  })
})
