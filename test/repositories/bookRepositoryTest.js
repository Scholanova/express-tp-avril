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

    context('when create fail because no author associated with the book', () => {

        beforeEach(async () => {
        // given
        bookData = { title: 'Les confessions', authorId: 1}
        })

        // then
        it('should return an SequelizeForeignKeyConstraintError:', async () => {
            return expect(bookRepository.create(bookData)).to.eventually.be.rejectedWith(SequelizeForeignKeyConstraintError)
        })
    })
  })
  
  describe('listForAuthor', () => {
    let result

    context('when there is no book for that author in the repository only some for other authors', () => {

      beforeEach(async () => {
         // given
         const authorData = { id: 1, name: 'Jean-Jacques Rousseau', pseudo: 'JJR', email: 'jj@rousseau.fr', language: 'french' }
         const authorData2 = { id: 2, name: 'Jean-Jacques Rousseau', pseudo: 'JJR', email: 'jj@rousseau.fr', language: 'french' }

         const bookData = { title: 'Les confessions', authorId: 1}
         const bookData2 = { title: 'Les confessions', authorId: 1}

         author = await authorRepository.create(authorData)
         author2 = await authorRepository.create(authorData2)
         createdBook = await bookRepository.create(bookData)
         createdBook2 = await bookRepository.create(bookData2)

         // when
         result = await bookRepository.listForAuthor(authorData2.id)
      })

      it('should return an empty list', () => {
        // then
        expect(result).to.be.empty
      })
    })

    context('when there are two books in the repository for that author and some for other authors', () => {

      beforeEach(async () => {
        // given
        const authorData = { id: 1, name: 'Jean-Jacques Rousseau', pseudo: 'JJR', email: 'jj@rousseau.fr', language: 'french' }
        const authorData2 = { id: 2, name: 'un autre mec avec le meme pseudo', pseudo: 'JJR', email: 'jj@rousseau.fr', language: 'french' }

        const bookData = { title: 'les aventures de JP', authorId: 1}
        const bookData2 = { title: 'les aventures de JP2', authorId: 1}

        const bookData3 = { title: 'un autre trucs', authorId: 2}


        author = await authorRepository.create(authorData)
        author2 = await authorRepository.create(authorData2)
        createdBook = await bookRepository.create(bookData)
        createdBook2 = await bookRepository.create(bookData2)
        createdBook3 = await bookRepository.create(bookData3)


        // when
        result = await bookRepository.listForAuthor(authorData.id)
      })

      it('should return a list with the two books', () => {
        // then
        const book1Value = createdBook.get()
        const book2Value = createdBook2.get()
        const resultValues = result.map((book) => book.get())

        expect(resultValues).to.deep.equal([book1Value, book2Value])
      })
    })
  })

})