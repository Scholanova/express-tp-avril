const { expect, sinon } = require('../testHelper')

const bookService = require('../../lib/services/bookService')
const bookRepository = require('../../lib/repositories/bookRepository')
const Joi = require('@hapi/joi')
const Book = require('../../lib/models').Book
const Author = require('../../lib/models').Author

describe('bookService', () => {

    describe('create', () => {
        let bookData
        let bookCreationPromise

        beforeEach(() => {
            sinon.stub(bookRepository, 'create')
        })

        context.skip('when the book data is valid', () => {

            let book

            beforeEach(() => {
                // given
                bookData = { authorId: 1, title: 'the bug !' }
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

        context.skip('when the book author id is missing', () => {

            beforeEach(() => {
                // given
                bookData = { authorId: undefined, title: 'the bug !' }

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
    })
})