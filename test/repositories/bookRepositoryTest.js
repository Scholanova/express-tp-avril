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

  describe('listForAuthor', () => {
    let result

    context('when there is are no books for that author in the repository, only some for other authors', () => {

      beforeEach(async () => {
        // given
        const author1 = await authorRepository.create(factory.createAuthorData())
        const author2 = await authorRepository.create(factory.createAuthorData())

        // create somme books for author2
        await bookRepository.create(factory.createBookData({ authorId: author2.id }))
        await bookRepository.create(factory.createBookData({ authorId: author2.id }))

        // when
        result = await bookRepository.listForAuthor(author1.id)
      })

      it('should return an empty list', () => {
        // then
        expect(result).to.be.empty
      })
    })

    context('when there are two books for that author and some for other authors', () => {

      let book1, book2

      beforeEach(async () => {
        // given
        const author1 = await authorRepository.create(factory.createAuthorData())
        const author2 = await authorRepository.create(factory.createAuthorData())

        // create somme books for author2
        book1 = await bookRepository.create(factory.createBookData({ authorId: author1.id }))
        book2 = await bookRepository.create(factory.createBookData({ authorId: author1.id }))
        await bookRepository.create(factory.createBookData({ authorId: author2.id }))

        // when
        result = await bookRepository.listForAuthor(author1.id)
      })

      it('should return a list with the two books', () => {
        // then
        const book1Value = book1.get()
        const book2Value = book2.get()
        const resultValues = result.map((book) => book.get())

        expect(resultValues).to.deep.equal([book1Value, book2Value])
      })
    })
  })
})
