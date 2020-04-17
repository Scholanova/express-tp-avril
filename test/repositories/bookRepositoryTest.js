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
                let a = await author.getBooks();
            })

            it('should return a book with the right properties', () => {
                const createdBookValue = createdBook.get()
            
                expect(createdBookValue.title).to.equal(bookData.title)
            })
            
        })

    })

    describe('listForAuthor', () => {

        let listForAuthorPromise

        context('author has books', () => {

            let book1
            let book2
            

            beforeEach(async() => {
                // given
                let author = await Author.create({ name: 'Jean-Paul Sartre', pseudo: undefined, email: 'jp_sartre@academie-francaise.fr', language: 'french' })
                book1 = await Book.create({ authorId: author.id, title: 'L\'aube noir' })
                book2 = await Book.create({ authorId: author.id, title: 'L\'aube rouge' })

                // when
                listForAuthorPromise = bookRepository.listForAuthor(author.id)
            })

            it('should return the two corresponding books', async () => {
                 // then
                let returnedBooks = await listForAuthorPromise;
                let returnedBooksValue = returnedBooks.map( e => e.get());
              
                return expect(returnedBooksValue).to.deep.equal([book1.get(), book2.get()]);
            })
        })

        context('author has no books', () => {            

            beforeEach(async() => {
                // given
                let author = await Author.create({ name: 'Jean-Paul Sartre', pseudo: undefined, email: 'jp_sartre@academie-francaise.fr', language: 'french' })

                // when
                listForAuthorPromise = bookRepository.listForAuthor(author.id)
            })

            it('should return the two corresponding books', async () => {
                // then
                return expect(listForAuthorPromise).to.eventually.be.empty;
            })
        })

    })

})