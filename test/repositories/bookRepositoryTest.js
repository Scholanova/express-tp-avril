const { expect } = require('../testHelper')

const bookRepository = require('../../lib/repositories/bookRepository')
const authorRepository = require('../../lib/repositories/authorRepository')
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
        context('book exists', () => {

            beforeEach(async () => {
                // given
                let author = await Author.create({ id: 12, name: 'Jean-Paul Sartre', pseudo: 'JPPR', email: 'jp_sartre@academie-francaise.fr', language: 'french' });
                createdBook = await Book.create({ title: 'TitreBook' , authorId: author.id })
                
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

        let createdBook
        let createdAuthor
        let retrievedBook
        let bookData
        let authorData

        context('book created with author associated', () => {
            
            beforeEach(async () => {
                // given
                authorData = { id: '22', name: 'Jean-Paul Sartre', pseudo: 'tttttt', email: 'jp_sartre@academie-francaise.fr', language: 'french'}
                createdAuthor = await authorRepository.create(authorData)

                authorValue = createdAuthor.get()

                bookData = { id: '23', title: 'livreBook', authorId: '22'}

                //when
                createdBook = await bookRepository.create(bookData)
            })

            // then
            it('should return a book with the right properties', async () => {
                
                const createdBookValue = createdBook.get()

                expect(createdBookValue.title).to.equal(bookData.title)

                expect(authorValue.id).to.equal(createdBookValue.authorId)

                retrievedBook = await bookRepository.get(createdBookValue.id)
                const retrievedBookValue = retrievedBook.get()

                expect(createdBookValue).to.deep.equal(retrievedBookValue)
            })
        })

        context('book created with author associated who does not exist', () => {
            
            beforeEach(async () => {
                // given
                bookData = { id: '23', title: 'livreBook', authorId: '24'}

            })

            // then
            it('should throw an error', async () => {
                
                expect(bookRepository.create(bookData)).to.eventually.be.rejected;
            })
        })
    })

    describe('listForAuthor', () => {
        let result
    
        context('when there are no books for that author in the repository, only some for other books', () => {
          
            beforeEach(async () => {
                // given
                const jjrData = { id: '22', name: 'Jean-Jacques Rousseau', pseudo: 'JJRr', email: 'jj@rousseau.ch', language: 'french' }
                const ppData = { id: '23', name: 'Philip Pullman', pseudo: 'Philip', email: 'philip@pullman.co.uk', language: 'french' }
                author1 = await authorRepository.create(jjrData)
                author2 = await authorRepository.create(ppData)
                
                const bookData = { id: '4', title: 'titleBook2', auhtorId: 24 }
                const bookData2 = { id: '6', title: 'titleBook2', auhtorId: 26 }
                book = await bookRepository.create(bookData)
                book2 = await bookRepository.create(bookData2)

                // when
                result = await bookRepository.listForAuthor(22)
            })
        
            it('should return an empty list', () => {
                // then
                expect(result).to.be.empty
            })
        })
    
        context('when there are two authors in the repository for that language and some for other languages', () => {
    
            beforeEach(async () => {
                // given
                const jjrData = { id: '22', name: 'Jean-Jacques Rousseau', pseudo: 'JJRr', email: 'jj@rousseau.ch', language: 'french' }
                const ppData = { id: '23', name: 'Philip Pullman', pseudo: 'Philip', email: 'philip@pullman.co.uk', language: 'french' }
                author1 = await authorRepository.create(jjrData)
                author2 = await authorRepository.create(ppData)
                
                const bookData = { id: '4', title: 'titleBook2', authorId: '22' }
                const bookData2 = { id: '6', title: 'titleBook3', authorId: '22' }
                book = await bookRepository.create(bookData)
                book2 = await bookRepository.create(bookData2)

                // when
                result = await bookRepository.listForAuthor('22')
            })
        
            it('should return a list with the two books', () => {
                // then
                const book1Value = book.get()
                const book2Value = book2.get()

                const resultValues = result.map((book) => book.get())
        
                expect(resultValues).to.deep.equal([book1Value, book2Value])
            })
        })
    })
})
