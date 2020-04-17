const { expect } = require('../testHelper')

const bookRepository = require('../../lib/repositories/bookRepository')
const authorRepository = require('../../lib/repositories/authorRepository')

const models = require('../../lib/models')
const { ResourceNotFoundError,SequelizeForeignKeyConstraintError } = require('../../lib/errors')

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
          authorData = { id: 150, name: 'Jean-Paul Sartre', pseudo: undefined, email: 'jp_sartre@academie-francaise.fr',language: 'french' }
          createdAuthor = await authorRepository.create(authorData)
          const createdAuthorValue = createdAuthor.get()
          bookData = { title: 'monPremierLivre', authorId: authorData.id}
          // when
          createdBook = await bookRepository.create(bookData)
        })

        // then
        it('should return a book with the right properties', async () => {
          const createdBookValue = createdBook.get()
          expect(createdBookValue.title).to.equal(bookData.title)
          expect(createdBookValue.authorId).to.equal(authorData.id)
          retrievedBook = await bookRepository.get(createdBook.id)
          const retrievedBookValue = retrievedBook.get()

          expect(createdBookValue).to.deep.equal(retrievedBookValue)
        })
    })

    context('book create failed', () => {
        beforeEach(async () => {
        // given
        bookData = { title: 'monPremierLivre', authorId: 6 }
        })

        // then
        it('should not return a book', async () => {
            return expect(bookRepository.create(bookData)).to.eventually.be.rejectedWith(SequelizeForeignKeyConstraintError)
        })
    })

  })
})
