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
    

    describe('listForAuthor', () => {
        let bookListPromise

        beforeEach(() => {
            sinon.stub(bookRepository, 'listForAuthor')
        })

        describe('listForAuthor', () => {

            context('when the authorId is missing', () => {

                beforeEach(() => {
                    // given
                    
                    // when
                    bookListPromise = bookService.listForAuthor(undefined)
                })

                it('should not call the book Repository', async () => {
                    // then
                    await bookListPromise.catch(() => {})
                    expect(bookRepository.listForAuthor).to.not.have.been.called
                })

                it('should reject with a ValidationError error about missing authorId', () => {
                    // then
                    const expectedErrorDetails = "\"value\" is required"
                    
                    return expect(bookListPromise)
                        .to.eventually.be.rejectedWith(Joi.ValidationError)
                        .with.deep.property('message', expectedErrorDetails)
                })
            })

            context('when the authorId is not missing', () => {
                let author1
                let author2

                beforeEach(() => {
                    // given
                    book1 = new Book({ title: 'title1', authorId: 1})
                    book2 = new Book({ title: 'title2', authorId: 1})

                    bookRepository.listForAuthor.resolves([book1, book2])

                    // when
                    bookListPromise = bookService.listForAuthor(1)
                })

                it('should call the book Repository with the authorId', async () => {
                    // then
                    await bookListPromise.catch(() => {})
                    expect(bookRepository.listForAuthor).to.have.been.calledWith(1)
                })

                it('should resolve with the authors listed from reprository', () => {
                    // then
                    return expect(bookListPromise).to.eventually.be.deep.equal([book1, book2])
                })
            })
        })
    })
})