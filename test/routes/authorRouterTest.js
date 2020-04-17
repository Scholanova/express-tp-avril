const Joi = require('@hapi/joi')
const { expect, request, sinon } = require('../testHelper')
const { ResourceNotFoundError } = require('../../lib/errors')
const app = require('../../lib/app')
const authorRepository = require('../../lib/repositories/authorRepository')
const bookRepository = require('../../lib/repositories/bookRepository')
const authorService = require('../../lib/services/authorService')
const models = require('../../lib/models')
const Author = models.Author
const Book = models.Book

describe('authorRouter', () => {

  describe('list', () => {

    let response

    beforeEach(() => {
      sinon.stub(authorRepository, 'listAll')
    })

    context('when there is no authors in the repository', () => {

      beforeEach(async () => {
        // given
        authorRepository.listAll.resolves([])

        // when
        response = await request(app).get('/authors')
      })

      it('should succeed with a status 200', () => {
        // then
        expect(response).to.have.status(200)
      })

      it('should return an empty list message', () => {
        // then
        expect(response).to.be.html
        expect(response.text).to.contain('No authors in system yet.')
      })
    })

    context('when there are authors in the repository', () => {

      beforeEach(async () => {
        // given
        const author = new Author({ name: 'Jean-Jacques Rousseau', pseudo: 'JJR', email: 'jj@rousseau.ch', language: 'french' })
        authorRepository.listAll.resolves([author])

        // when
        response = await request(app).get('/authors')
      })

      it('should succeed with a status 200', () => {
        // then
        expect(response).to.have.status(200)
      })

      it('should return an html list with author info inside', () => {
        // then
        expect(response).to.be.html
        expect(response.text).to.contain('Jean-Jacques Rousseau (JJR, french)')
      })
    })
  })

  describe('show', () => {

    let authorId
    let bookId
    let response

    beforeEach(() => {
      sinon.stub(authorRepository, 'get')
      sinon.stub(bookRepository, 'listForAuthor')
    })

    context('when there is no author matching in the repository', () => {

      beforeEach(async () => {
        // given
        authorId = '123'
        authorRepository.get.rejects(new ResourceNotFoundError())

        // when
        response = await request(app).get(`/authors/${authorId}`)
      })

      it('should call the repository with id', () => {
        // then
        expect(authorRepository.get).to.have.been.calledWith(authorId)
      })
      it('should not call the book repository with author id', () => {
        // then
        expect(bookRepository.listForAuthor).to.have.not.been.called
      })

      it('should succeed with a status 404', () => {
        // then
        expect(response).to.have.status(404)
      })

      it('should return the resource not found page', () => {
        // then
        expect(response).to.be.html
        expect(response.text).to.contain('This page does not exist')
      })
    })

    context('when there is a author matching and no books in the repository', () => {

      let author

      beforeEach(async () => {
        // given
        authorId = '123'
        const authorData = {
          id: authorId, name: 'Jean-Jacques Rousseau', pseudo: 'JJR', email: 'jj@rousseau.ch'
        }
        author = new Author(authorData)

        authorRepository.get.resolves(author)

        bookRepository.listForAuthor.resolves([])

        // when
        response = await request(app).get(`/authors/${authorId}`)
      })

      it('should call the author repository with id', () => {
        // then
        expect(authorRepository.get).to.have.been.calledWith(authorId)
      })
      it('should call the book repository with authorId', () => {
        // then
        expect(bookRepository.listForAuthor).to.have.been.calledWith(authorId)
      })

      it('should succeed with a status 200', () => {
        // then
        expect(response).to.have.status(200)
      })

      it('should return the show page with the author’s info', () => {
        // then
        expect(response).to.be.html
        expect(response.text).to.contain(`Author ${author.name}`)
        expect(response.text).to.contain(`Name: ${author.name}`)
        expect(response.text).to.contain(`Pseudo: ${author.pseudo}`)
        expect(response.text).to.contain(`Email: ${author.email}`)
      })
    })

    context('when there are books for an author in the repository', () => {
      let author
      let book

      beforeEach(async () => {
        // given
        authorId = '123'
        const authorData = {
          id: authorId, name: 'Jean-Jacques Rousseau', pseudo: 'JJR', email: 'jj@rousseau.ch'
        }
        author = new Author(authorData)

        authorRepository.get.resolves(author)

        bookId= '1'
        const bookData = {
          id: bookId, title: 'bookTitle', authorId: authorId
        }
        book = new Book(bookData)

        bookRepository.listForAuthor.resolves([book])

        // when
        response = await request(app).get(`/authors/${authorId}`)
      })

      it('should call the author repository with id', () => {
        // then
        expect(authorRepository.get).to.have.been.calledWith(authorId)
      })
      it('should call the book repository with authorId', () => {
        // then
        expect(bookRepository.listForAuthor).to.have.been.calledWith(authorId)
      })

      it('should succeed with a status 200', () => {
        // then
        expect(response).to.have.status(200)
      })

      it('should return the show page with the author’s info', () => {
        // then
        expect(response).to.be.html
        expect(response.text).to.contain(`Author ${author.name}`)
        expect(response.text).to.contain(`Name: ${author.name}`)
        expect(response.text).to.contain(`Pseudo: ${author.pseudo}`)
        expect(response.text).to.contain(`Email: ${author.email}`)
      })
      it('should return the show page with the authors books info', () => {
        // then
        expect(response).to.be.html
        expect(response.text).to.contain(`${book.title}`)
      })
    })
  })





  describe('new - POST', () => {

    let response

    beforeEach(() => {
      sinon.stub(authorService, 'create')
    })

    context('when the author creation succeeds', () => {

      let author

      beforeEach(async () => {
        // given
        author = new Author({ id: 12, name: 'Ben', age: 3 })
        authorService.create.resolves(author)

        // when
        response = await request(app)
          .post('/authors/new')
          .type('form')
          .send({ 'name': 'JJR', 'pseudo': 'JJR', 'email': 'jjr@exemple.net','language': 'french' })
          .redirects(0)
      })

      it('should call the service with author data', () => {
        // then
        expect(authorService.create).to.have.been.calledWith({ email: 'jjr@exemple.net', name: 'JJR', pseudo: 'JJR', language: 'french' })
      })

      it('should succeed with a status 302', () => {
        // then
        expect(response).to.have.status(302)
      })

      it('should redirect to show page', () => {
        // then
        expect(response).to.redirectTo(`/authors/${author.id}`)
      })
    })

    context('when the author creation fails with validation errors', () => {

      let validationError
      let errorMessage
      let errorDetails
      let previousNameValue

      beforeEach(async () => {
        // given
        errorDetails = [{
          message: '"email" is required',
          path: ['email'],
          type: 'any.required',
          context: { label: 'email', key: 'email' }
        }]
        errorMessage = '"email" is required'
        validationError = new Joi.ValidationError(errorMessage, errorDetails, undefined)
        authorService.create.rejects(validationError)

        previousNameValue = 'Some special name for a author'
        // when
        response = await request(app)
          .post('/authors/new')
          .type('form')
          .send({ name: previousNameValue, pseudo: undefined, email: 'test@example.net', language: 'french' })
          .redirects(0)
      })

      it('should call the service with author data', () => {
        // then
        expect(authorService.create).to.have.been.calledWith({
          name: previousNameValue, pseudo: undefined, email: 'test@example.net', language: 'french'
        })
      })

      it('should succeed with a status 200', () => {
        // then
        expect(response).to.have.status(200)
      })

      it('should show new author page with error message and previous values', () => {
        // then
        expect(response).to.be.html
        expect(response.text).to.contain('New Author')
        expect(response.text).to.contain("&#34;email&#34; is required")
        expect(response.text).to.contain(previousNameValue)
      })
    })
  })

  
  describe('filter - POST', () => {

    let response

    beforeEach(() => {
      sinon.stub(authorService, 'listForLanguage')
    })

    context('when the listForLanguage succeeds with some results', () => {

      let foundAuthor
      let filterLanguage

      beforeEach(async () => {
        // given
        filterLanguage = 'french'

        const foundAuthor = new Author({ name: 'Jean-Jacques Rousseau', pseudo: 'JJR', email: 'jj@rousseau.ch', language: 'french' })
        
        // foundAuthor = factory.createAuthor({
        //   language: filterLanguage
        // })
        authorService.listForLanguage.resolves([foundAuthor])

        // when
        response = await request(app)
          .post('/authors/filter')
          .type('form')
          .send({ 'language': filterLanguage })
      })

      it('should call the service with language to filter upon', () => {
        // then
        expect(authorService.listForLanguage).to.have.been.calledWith({
          language: filterLanguage
        })
      })

      it('should succeed with a status 200', () => {
        // then
        expect(response).to.have.status(200)
      })

      it('should show result on page', () => {
        // then
        expect(response).to.be.html
        expect(response.text).to.contain(`Jean-Jacques Rousseau (JJR)`)
      })
    })

    context('when the listForLanguage succeeds with no results', () => {

      let filterLanguage

      beforeEach(async () => {
        // given
        filterLanguage = 'french'
        authorService.listForLanguage.resolves([])

        // when
        response = await request(app)
          .post('/authors/filter')
          .type('form')
          .send({ 'language': filterLanguage })
      })

      it('should call the service with language to filter upon', () => {
        // then
        expect(authorService.listForLanguage).to.have.been.calledWith({
          language: filterLanguage
        })
      })

      it('should succeed with a status 200', () => {
        // then
        expect(response).to.have.status(200)
      })

      it('should show result on page', () => {
        // then
        expect(response).to.be.html
        expect(response.text).to.contain('No authors found for that language.')
      })
    })

    context('when the listForLanguage fails because language is invalid', () => {

      let validationError
      let filterLanguage

      beforeEach(async () => {
        // given
        filterLanguage = 'german'
        validationError = Joi.object({
          language: Joi.string().valid('french', 'english').required()
        }).validate({ language: filterLanguage }).error

        authorService.listForLanguage.rejects(validationError)

        // when
        response = await request(app)
          .post('/authors/filter')
          .type('form')
          .send({ 'language': filterLanguage })
      })

      it('should call the service with language to filter upon', () => {
        // then
        expect(authorService.listForLanguage).to.have.been.calledWith({
          language: filterLanguage
        })
      })

      it('should succeed with a status 200', () => {
        // then
        expect(response).to.have.status(200)
      })

      it('should show new author page with error message and previous values', () => {
        // then
        const expectedErrorMessage = '&#34;language&#34; must be one of [french, english]'

        expect(response).to.be.html
        expect(response.text).to.contain(filterLanguage)
        expect(response.text).to.contain(expectedErrorMessage)
      })
    })
  })
})
