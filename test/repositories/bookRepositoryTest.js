const { expect } = require('../testHelper')

const bookRepository = require('../../lib/repositories/bookRepository')
const authorRepository = require('../../lib/repositories/bookRepository')

const models = require('../../lib/models')
const { ResourceNotFoundError } = require('../../lib/errors')

const Book = models.Book
const Author = models.Author

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

    let createdBook
    let createdAuthor
    let authorData
    let retrievedBook
    let bookData

    context('book create succes', () => {
        beforeEach(async () => {
        // given
        authorData = { id:100, name: 'Jean-Paul Sartre', pseudo: undefined, email: 'jp_sartre@academie-francaise.fr',language: 'french' }
        bookData = { title: 'monPremierLivre', authorId: 100 }
        // when
        createdAuthor = await authorRepository.create(authorData)
        createdBook = await bookRepository.create(bookData)
        })

        // then
        it('should return a book with the right properties', async () => {
        const createdBookValue = createdBook.get()
        expect(createdBookValue.title).to.equal(bookData.title)
        retrievedBook = await bookRepository.get(createdBook.id)
        const retrievedBookValue = retrievedBook.get()

        expect(createdBookValue).to.deep.equal(retrievedBookValue)
        })
    })

    context('book create failed', () => {
        beforeEach(async () => {
        // given
        bookData = { title: 'monPremierLivre', authorId: 6 }
        // when
        createdBook = await bookRepository.create(bookData)
        })

        // then
        it('should not return a book', async () => {
            const createdBookValue = createdBook.get()
            console.log(createdBookValue)
            expect(createdBookValue).to.be.empty
        })
    })

  })
})
