const { expect } = require('../testHelper')

const bookRepository = require('../../lib/repositories/bookRepository')
const authorRepository = require('../../lib/repositories/authorRepository')

const models = require('../../lib/models')
const { ResourceNotFoundError, SequelizeForeignKeyConstraintError } = require('../../lib/errors')
const Book = models.Book
const Author = models.Author


describe('bookRepository', () => {

  afterEach(async () => {
    await Book.destroy({ where: {} })
    await Author.destroy({ where: {} })
  })

  describe('get', () => {

    let notExistingId
    let getBookPromise

    context('when book does not exist', () => {
      beforeEach(async () => {
        // given
        notExistingId = -1

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

    let createdBook
    let retrievedBook
    let bookData

    context('when create success, return a book', () => {

        beforeEach(async () => {
        // given
        const jjrData = { id: 1, name: 'Jean-Jacques Rousseau', pseudo: 'JJR', email: 'jj@rousseau.fr', language: 'french' }
        authorRepository.create(jjrData)

        bookData = { title: 'Les Confessions', authorId: 1}

        // when
        createdBook = await bookRepository.create(bookData)
        })

        // then
        it('should return a book with the right title', async () => {
        const createdBookValue = createdBook.get()

        expect(createdBookValue.title).to.equal(bookData.title)
        expect(createdBookValue.authorId).to.equal(bookData.authorId)

        retrievedBook = await bookRepository.get(createdBook.id)
        const retrievedBookValue = retrievedBook.get()

        expect(createdBookValue).to.deep.equal(retrievedBookValue)
        })
    })

    context('when create fail because no author associated to the book', () => {

        beforeEach(async () => {
        // given
        bookData = { title: 'les aventures de JP', authorId: 1}
        })

        // then
        it('should return an SequelizeForeignKeyConstraintError:', async () => {
            return expect(bookRepository.create(bookData)).to.eventually.be.rejectedWith(SequelizeForeignKeyConstraintError)
        })
    })
  })
  
})