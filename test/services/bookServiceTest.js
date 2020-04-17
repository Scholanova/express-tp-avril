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

    context('when the book created', () => {

      let book

      beforeEach(() => {
        // given
        bookData = { title: 'ExpressBook', authorId: 5}
        book = new Book(bookData)
        bookRepository.create.resolves(book)

        // when
        bookCreationPromise = bookService.create(bookData)
      })

      // then
      it('should call the book repository with the creation data', async () => {
        // then
        await bookCreationPromise.catch(() => {})
        expect(bookRepository.create).to.have.been.calledWith(bookData)
      })
      it('should resolve with the created book from repository', () => {
        // then
        return expect(bookCreationPromise).to.eventually.equal(book)
      })
    })

    context('when the book title is undefined', () => {

      beforeEach(() => {
        // given
        bookData = { title: undefined, authorId: 25}

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

    context('when the title is empty', () => {

      beforeEach(() => {
        // given
        bookData = { title: '', authorId: 25}

        // when
        bookCreationPromise = bookService.create(bookData)
      })

      it('should not call the author Repository', async () => {
        // then
        await bookCreationPromise.catch(() => {})
        expect(bookRepository.create).to.not.have.been.called
      })
      it('should reject with a ValidationError error about empty tittle', () => {
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

    context('when the book authorId is undefined', () => {

      beforeEach(() => {
        // given
        bookData = { title: 'ExpressBook', authorId: undefined}

        // when
        bookCreationPromise = bookService.create(bookData)
      })

      it('should not call the book Repository', async () => {
        // then
        await bookCreationPromise.catch(() => {})
        expect(bookRepository.create).to.not.have.been.called
      })
      it('should reject with a ValidationError error about missing authorId', () => {
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

    context('when the data is undefined', () => {

      beforeEach(() => {
        // given
        bookData = {title :undefined , authorId:undefined }

        // when
        bookCreationPromise = bookService.create(bookData)
      })

      it('should not call the author Repository', async () => {
        // then
        await bookCreationPromise.catch(() => {})
        expect(bookRepository.create).to.not.have.been.called
      })
      it('should reject with a ValidationError error about missing title and authorId', () => {
        // then
        const expectedErrorDetails = [
          {
            context: { key: 'title', label: 'title' },
            message: '"title" is required',
            path: ['title'],
            type: 'any.required'
          },
          {
            context: { key: 'authorId', label: 'authorId' },
            message: '"authorId" is required',
            path: ['authorId'],
            type: 'any.required'
          }
        ]

        return expect(bookCreationPromise)
          .to.eventually.be.rejectedWith(Joi.ValidationError)
          .with.deep.property('details', expectedErrorDetails)
      })
    })
  })
})
