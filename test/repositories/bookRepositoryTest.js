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

  describe('Create book', () => {

    let createdBook
    let retrievedBook
    let book

    context('When new book added success, return a book', () => {

        beforeEach(async () => {
        // given
        const jjr = { id: 1, name: 'Jean-Jacques Rousseau', pseudo: 'JJR', email: 'jj@rousseau.ch', language: 'french' }
        authorRepository.create(jjr)
        book = { title: 'ExpressBook', authorId: 1}

        // when
        createdBook = await bookRepository.create(book)
        })

        // then
        it('Should return a book with the same title', async () => {
        const createdBookValue = createdBook.get()

        expect(createdBookValue.title).to.equal(book.title)
        expect(createdBookValue.authorId).to.equal(book.authorId)

        retrievedBook = await bookRepository.get(createdBook.id)
        const retrievedBookValue = retrievedBook.get()

        expect(createdBookValue).to.deep.equal(retrievedBookValue)
        })
    })

    context('When create not ok with author not found or not associate', () => {

        beforeEach(async () => {
        // given
        bookData = { title: 'ExpressBook', authorId: 1}
        })

        // then
        it('should return an ForeignKeyConstraintError:', async () => {
            return expect(bookRepository.create(book)).to.eventually.be.rejectedWith(SequelizeForeignKeyConstraintError)
        })
    })
  })

  describe('Get book', () => {

    let falsegId
    let getBookPromise

    context('Book  not exist', () => {
      beforeEach(async () => {
        // given
        falsegId = 19

        // when
        getBookPromise = bookRepository.get(falsegId)
      })

      it('should throw a not found error', () => {
        // then
        return expect(getBookPromise).to.eventually.be.rejectedWith(ResourceNotFoundError)
      })
    })
  })

})