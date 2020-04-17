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

        context('when author have 4 books', () => {
            
            beforeEach(() => {
                // given
                bookData = { authorId: 1234, title: 'L\'aube noir' }
                sinon.stub(bookRepository, 'listForAuthor')
                existingBookData = [];
                for(let i = 1; i <= 4; i++) {
                    existingBookData.push({
                        id: i,
                        authorId: 1234,
                        title: `title${i}`
                    })
                }
                bookRepository.listForAuthor.resolves(existingBookData.map(e => new Book(e)))
                book = new Book(bookData)
                bookRepository.create.resolves(book)

                // when
                bookCreationPromise = bookService.create(bookData)
            })

            it('should call the book Repository ', async () => {
                // then
                await bookCreationPromise.catch(() => {})
                expect(bookRepository.create).to.have.been.calledWith(bookData)
            })
            it('should resolve with the created author from reprository', () => {
                return expect(bookCreationPromise).to.eventually.equal(book)
            })
        })

        context('when author have already 5 books', () => {
            
            beforeEach(() => {
                // given
                bookData = { authorId: 1234, title: 'L\'aube noir' }
                sinon.stub(bookRepository, 'listForAuthor')
                existingBookData = [];
                for(let i = 1; i <= 5; i++) {
                    existingBookData.push({
                        id: i,
                        authorId: 1234,
                        title: `title${i}`
                    })
                }
                bookRepository.listForAuthor.resolves(existingBookData.map(e => new Book(e)))

                // when
                bookCreationPromise = bookService.create(bookData)
            })

            it('should not call the book Repository ', async () => {
                // then
                await bookCreationPromise.catch(() => {})
                expect(bookRepository.create).to.not.have.been.calledWith(bookData)
            })
            it('should reject with a ValidationError error already five books for the author', () => {
                // then
                const expectedErrorDetails = [{
                  message: 'Author cannot have more than 5 books',
                  path: ["title"],
                  type: 'array.max',
                  context: { label: 'value', limit: 5, value: [...existingBookData, bookData] }
                }]
        
                return expect(bookCreationPromise)
                  .to.eventually.be.rejectedWith(Joi.ValidationError)
                  .with.deep.property('details', expectedErrorDetails)
            })
        })

        context('when author have already a book with the same title', () => {
            
            beforeEach(() => {
                // given
                bookData = { authorId: 1234, title: 'L\'aube noir' }
                sinon.stub(bookRepository, 'listForAuthor')
                const duplicatedBook = new Book(bookData)
                bookRepository.listForAuthor.resolves([duplicatedBook])

                // when
                bookCreationPromise = bookService.create(bookData)
            })

            it('should not call the book Repository ', async () => {
                // then
                await bookCreationPromise.catch(() => {})
                expect(bookRepository.create).to.not.have.been.calledWith(bookData)
            })
            it('should reject with a ValidationError error already got a book with this title', () => {
                // then
                const expectedErrorDetails = [
                    {
                        "context": {
                            "dupePos": 0,
                            "dupeValue": {
                                "authorId": bookData.authorId,
                                "id": null,
                                "title": bookData.title
                            },
                            "key": 1,
                            "label": "[1]",
                            "path": "title",
                            "pos": 1,
                            "value": {
                                "authorId": bookData.authorId,
                                "title": bookData.title
                            }
                        },
                        "message": "Duplicated book",
                        "path": [ "title" ],
                        "type": "array.unique"
                    }
                ]
        
                return expect(bookCreationPromise)
                  .to.eventually.be.rejectedWith(Joi.ValidationError)
                  .with.deep.property('details', expectedErrorDetails)
            })
        })

    })
})