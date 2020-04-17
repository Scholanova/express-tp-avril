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

    context('when the book data is valid', () => {

      let book

      beforeEach(() => {
        // given
        bookData = { title: 'Les confessions', authorId: 1 }
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

    context('when the book title is missing', () => {

      beforeEach(() => {
        // given
        bookData = { title: undefined, authorId: 1 }

        // when
        bookCreationPromise = bookService.create(bookData)
      })

      it('should not call the book Repository', async () => {
        // then
        await bookCreationPromise.catch(() => {})
        expect(bookRepository.create).to.not.have.been.called
      })
      it('should reject with a ValidationError error about missing book title', () => {
        // then
        const expectedErrorDetails = [{
          message: '"title" is required',
          path: ['title'],
          type: 'any.required',
          context: { label: 'title', key: 'title' }
        }]

        return expect(bookCreationPromise)
          .to.eventually.be.rejectedWith(Joi.ValidationError)
          .with.deep.property('details', expectedErrorDetails)
      })
    })

    context('when the book name is empty', () => {

      beforeEach(() => {
        // given
        bookData = { title: '', authorId: 1 }

        // when
        bookCreationPromise = bookService.create(bookData)
      })

      it('should not call the book Repository', async () => {
        // then
        await bookCreationPromise.catch(() => {})
        expect(bookRepository.create).to.not.have.been.called
      })
      it('should reject with a ValidationError error about book name missing', () => {
        // then
        const expectedErrorDetails = [{
          message: '"title" is not allowed to be empty',
          path: ['title'],
          type: 'string.empty',
          context: { label: 'title', key: 'title', value: '' }
        }]

        return expect(bookCreationPromise)
          .to.eventually.be.rejectedWith(Joi.ValidationError)
          .with.deep.property('details', expectedErrorDetails)
      })
    })

    context('when the author id is missing', () => {

        beforeEach(() => {
            // given
            bookData = { title: 'Bonsoir', authorId: undefined }
    
            // when
            bookCreationPromise = bookService.create(bookData)
          })

      it('should not call the book Repository', async () => {
        // then
        await bookCreationPromise.catch(() => {})
        expect(bookRepository.create).to.not.have.been.called
      })
      it('should reject with a ValidationError error about missing author id', () => {
        // then
        const expectedErrorDetails = [{
          message: '"authorId" is required',
          path: ['authorId'],
          type: 'any.required',
          context: { label: 'authorId', key: 'authorId' }
        }]

        return expect(bookCreationPromise)
          .to.eventually.be.rejectedWith(Joi.ValidationError)
          .with.deep.property('details', expectedErrorDetails)
      })
    })

    context('when the author id is empty', () => {

        beforeEach(() => {
            // given
            bookData = { title: 'Bonsoir', authorId: '' }

            // when
            bookCreationPromise = bookService.create(bookData)
        })

      it('should not call the book Repository', async () => {
        // then
        await bookCreationPromise.catch(() => {})
        expect(bookRepository.create).to.not.have.been.called
      })
      it('should reject with a ValidationError error about author id being empty', () => {
          // then
          const expectedErrorDetails = [{
            message: '"authorId" must be a number',
            path: ['authorId'],
            type: 'number.base',
            context: {
              label: 'authorId', key: 'authorId', value: ''
            },
          }]

          return expect(bookCreationPromise)
            .to.eventually.be.rejectedWith(Joi.ValidationError)
            .with.deep.property('details', expectedErrorDetails)
        }
      )
    })
  })
})