const { expect } = require('../testHelper')

const bookRepository = require('../../lib/repositories/bookRepository')
const models = require('../../lib/models')
const { ResourceNotFoundError } = require('../../lib/errors')
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
        let createdBook

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

        context('book exist', () => {

            beforeEach(async () => {
                // given
                let author = await Author.create({ id: 1234, name: 'Jean-Paul Sartre', pseudo: 'JPP', email: 'jp_sartre@academie-francaise.fr', language: 'french' });
                createdBook = await Book.create({ authorId: author.id, title: 'L\'aube noir' })

                // when
                getBookPromise = bookRepository.get(createdBook.id)
            })

            it('should return the right book', async () => {
                let gettedBook = await getBookPromise;
                let gettedBookValue = gettedBook.get();

                let createdBookValue = createdBook.get();

                expect(createdBookValue).to.deep.equal(gettedBookValue);
            })
        })
    })

    describe('create', () => {

        let bookData
        let createdBook

        context('when author not existing', () => {

            beforeEach(async () => {
                // given
                bookData = { authorId: 1234, title: 'L\'aube rouge' }
                            })

            it('should throw an error', () => {
                // when & then
                expect(bookRepository.create(bookData)).to.eventually.be.rejected;
            })

        })

        context('when author is existing', () => {

            beforeEach(async () => {
                // given
                let author = await Author.create({ id: 1234, name: 'Jean-Paul Sartre', pseudo: 'JPP', email: 'jp_sartre@academie-francaise.fr', language: 'french' });
                bookData = { authorId: author.id, title: 'L\'aube rouge' }

                // when
                createdBook = await bookRepository.create(bookData)
                let a = await createdBook.getAuthor();
            })

            it('should return a book with the right properties', () => {
                const createdBookValue = createdBook.get()

                expect(createdBookValue.title).to.equal(bookData.title)

                // retrievedAuthor = await authorRepository.get(createdAuthor.id)
                // const retrievedAuthorValue = retrievedAuthor.get()

                // expect(createdAuthorValue).to.deep.equal(retrievedAuthorValue)
            })

        })

    })

})