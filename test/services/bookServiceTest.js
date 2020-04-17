const { expect, sinon } = require('../testHelper')

const bookService = require('../../lib/services/bookService')
const bookRepository = require('../../lib/repositories/bookRepository')
const Joi = require('@hapi/joi')
const models = require('../../lib/models')
const Book = models.Book

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
                bookData = { authorId: 1234, title: 'L\'aube noir' }
                book = new Book(bookData)
                bookRepository.create.resolves(book)

                // when
                bookCreationPromise = bookService.create(bookData)
            })

            it('should call the book Repository with the creation data', async () => {
                // then
                await bookCreationPromise.catch(() => {})
                expect(bookRepository.create).to.have.been.calledWith(bookData)
            })
            it('should resolve with the created author from reprository', () => {
                // then
                return expect(bookCreationPromise).to.eventually.equal(book)
            })

        })

        context('when the book author id is missing', () => {

            beforeEach(() => {
                // given
                bookData = { authorId: null, title: 'L\'aube noir' }

                // when
                bookCreationPromise = bookService.create(bookData)
            })

            it('should not call the book Repository ', async () => {
                // then
                await bookCreationPromise.catch(() => {})
                expect(bookRepository.create).to.not.have.been.calledWith(bookData)
            })
            it('should reject with a ValidationError error about missing name', () => {
                // then
                const expectedErrorDetails = [{
                  message: '"authorId" must be a number',
                  path: ['authorId'],
                  type: 'number.base',
                  context: { label: 'authorId', key: 'authorId', value: null }
                }]
        
                return expect(bookCreationPromise)
                  .to.eventually.be.rejectedWith(Joi.ValidationError)
                  .with.deep.property('details', expectedErrorDetails)
            })

        })

        context('when the book title is missing', () => {
            
            beforeEach(() => {
                // given
                bookData = { authorId: 1234, title: null }

                // when
                bookCreationPromise = bookService.create(bookData)
            })

            it('should not call the book Repository ', async () => {
                // then
                await bookCreationPromise.catch(() => {})
                expect(bookRepository.create).to.not.have.been.calledWith(bookData)
            })
            it('should reject with a ValidationError error about missing name', () => {
                // then
                const expectedErrorDetails = [{
                  message: '"title" must be a string',
                  path: ['title'],
                  type: 'string.base',
                  context: { label: 'title', key: 'title', value: null }
                }]
        
                return expect(bookCreationPromise)
                  .to.eventually.be.rejectedWith(Joi.ValidationError)
                  .with.deep.property('details', expectedErrorDetails)
            })

        })

        context('when the book author id is not an integer', () => {

            beforeEach(() => {
                // given
                bookData = { authorId: 'coucou', title: 'L\'aube noir' }

                // when
                bookCreationPromise = bookService.create(bookData)
            })

            it('should not call the book Repository ', async () => {
                // then
                await bookCreationPromise.catch(() => {})
                expect(bookRepository.create).to.not.have.been.calledWith(bookData)
            })
            it('should reject with a ValidationError error about missing name', () => {
                // then
                const expectedErrorDetails = [{
                  message: '"authorId" must be a number',
                  path: ['authorId'],
                  type: 'number.base',
                  context: { label: 'authorId', key: 'authorId', value: bookData.authorId }
                }]
        
                return expect(bookCreationPromise)
                  .to.eventually.be.rejectedWith(Joi.ValidationError)
                  .with.deep.property('details', expectedErrorDetails)
            })

        })

    })
})