const { expect, sinon } = require('../testHelper')

const bookService = require('../../lib/services/bookService')
const bookRepository = require('../../lib/repositories/bookRepository')
const Joi = require('@hapi/joi')
const Book = require('../../lib/models').Book

describe('bookService', () => {

    describe('create', () => {

        let bookData
        let bookCreationPromise

        beforeEach(() => {
            sinon.stub(bookRepository, 'create')
        })

        context('when the book data is valid', () => {

            let book

            beforeEach(() => {
                // given
                
                bookData = {authorId: 2, title: 'titleBook' }
                book = new Book(bookData)
                bookRepository.create.resolves(book)

                // when
                bookCreationPromise = bookService.create(bookData)
            })

            // then
            it('should call the author Repository with the creation data', async () => {
                // then
                await bookCreationPromise.catch(() => {})
                expect(bookRepository.create).to.have.been.calledWith(bookData)
            })
            it('should resolve with the created book from reprository', () => {
                // then
                return expect(bookCreationPromise).to.eventually.equal(book)
            })
         })

        context('when the book title is missing', () => {

            beforeEach(() => {
                // given
                bookData = {authorId: 2, title: undefined }

                // when
                bookCreationPromise = bookService.create(bookData)
            })

            it('should not call the book Repository', async () => {
                // then
                await bookCreationPromise.catch(() => {})
                expect(bookRepository.create).to.not.have.been.called
            })

            it('should reject with a ValidationError error about missing title', () => {
                // then
                // then
                const expectedErrorDetails = "\"title\" is required"
                
                return expect(bookCreationPromise)
                .to.eventually.be.rejectedWith(Joi.ValidationError)
                .with.deep.property('message', expectedErrorDetails)
            })
        })

        context('when the book authorId is empty', () => {

            let book

            beforeEach(() => {
                // given
                bookData = {authorId: undefined, title: 'titleBook' }
                book = new Book(bookData)
                bookRepository.create.resolves(book)
        
                // when
                bookCreationPromise = bookService.create(bookData)
            })
  
            // then
            it('should call the book Repository with the creation data', async () => {
                // then
                await bookCreationPromise.catch(() => {})
                expect(bookRepository.create).to.have.been.calledWith(bookData)
            })
            it('should resolve with the created book from reprository', () => {
                // then
                return expect(bookCreationPromise).to.eventually.equal(book)
            })
        })
    })
    



    
    describe.skip('listForLanguage', () => {
        let authorListPromise

        beforeEach(() => {
            sinon.stub(authorRepository, 'listForLanguage')
        })

        describe('listForLanguage', () => {

            context('when the author language is missing', () => {

                beforeEach(() => {
                // given
                
                // when
                authorListPromise = authorService.listForLanguage(undefined)
                })
                it('should not call the author Repository', async () => {
                // then
                await authorListPromise.catch(() => {})
                expect(authorRepository.listForLanguage).to.not.have.been.called
                })
                it('should reject with a ValidationError error about missing language', () => {
                // then
                const expectedErrorDetails = "\"value\" is required"
                
                return expect(authorListPromise)
                    .to.eventually.be.rejectedWith(Joi.ValidationError)
                    .with.deep.property('message', expectedErrorDetails)
                })
            })

            context('when the author language is neither french nor english', () => {

                beforeEach(() => {
                    // given
                    language = 'german'
                    
                    // when
                    authorListPromise = authorService.listForLanguage(language)
                })

                it('should not call the author Repository', async () => {
                    // then
                    await authorListPromise.catch(() => {})
                    expect(authorRepository.listForLanguage).to.not.have.been.called
                })
                it('should reject with a ValidationError error about unsupported language', () => {
                    // then
                    const expectedErrorDetails = [{
                        message: "\"value\" must be one of [french, english]",
                        path: [],
                        type: 'any.only',
                        context: { label: 'value', valids: ['french', 'english'], 'value': 'german' }
                    }]

                    return expect(authorListPromise)
                        .to.eventually.be.rejectedWith(Joi.ValidationError)
                        .with.deep.property('details', expectedErrorDetails)
                })
            })
            context('when the author language is either french or english', () => {
                let author1
                let author2

                beforeEach(() => {
                    // given
                    author1 = new Author({ name: 'Jean-Jacques Rousseau', pseudo: 'JJRr', email: 'jj@rousseau.ch', language: 'french' })
                    author2 = new Author({ name: 'Jean-Jacques Rousseau2', pseudo: 'JJRr', email: 'jj@rousseau.ch2', language: 'french' })

                    authorRepository.listForLanguage.resolves([author1, author2])

                    language = 'french'
            
                    // when
                    authorListForLanguagePromise = authorService.listForLanguage(language)
                })

                it('should call the author Repository with the language', async () => {
                    // then
                    await authorListForLanguagePromise.catch(() => {})
                    expect(authorRepository.listForLanguage).to.have.been.calledWith(language)
                })

                it('should resolve with the authors listed from reprository', () => {
                    // then
                    return expect(authorListForLanguagePromise).to.eventually.be.deep.equal([author1, author2])
                })
            })
        })
    })
})