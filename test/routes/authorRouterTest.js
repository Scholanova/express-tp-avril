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
        expect(response.text).to.contain('Aucun autheur trouvé avec vos critères.')
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

    context('when there is a author matching in the repository', () => {

      let author

      beforeEach(async () => {
        // given
        authorId = '123'

        const authorData = {
          id: authorId, name: 'Jean-Jacques Rousseau', pseudo: 'JJR', email: 'jj@rousseau.ch'
        }
        author = new Author(authorData)

        const bookData = {
          id: authorId, title: 'Jean-Jacques Rousseau le retour', authorId: 123
        }
        book = new Book(bookData)

        authorRepository.get.resolves(author)
        bookRepository.listForAuthor.resolves([book])

        // when
        response = await request(app).get(`/authors/${authorId}`)
      })

      it('should call the repository with id', () => {
        // then
        expect(authorRepository.get).to.have.been.calledWith(authorId)
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
        expect(response.text).to.contain(`${book.title}`)
        expect(response.text).to.contain(`Titres des livres ecrient`)
      })
    })

    context('when there is a author matching in the repository but no books', () => {

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

      it('should call the repository with id', () => {
        // then
        expect(authorRepository.get).to.have.been.calledWith(authorId)
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
        expect(response.text).to.contain(`Aucun livre trouvé pour l\'auteur.`)
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
          .send({ 'name': 'JJR', 'pseudo': 'JJR', 'email': 'jjr@exemple.net', 'language': 'french' })
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

    context('when the author filter succeeds', () => {

      let author

      beforeEach(async () => {
        // given
        author = new Author({ id: 12, name: 'Ben', age: 3, language: 'french' })
        authorService.listForLanguage.resolves([author])

        // when
        response = await request(app)
          .post('/authors/filter')
          .type('form')
          .send({ 'language': 'french' })
          .redirects(0)
      })

      it('should call the service with author language', () => {
        // then
        expect(authorService.listForLanguage).to.have.been.calledWith('french')
      })

      it('should succeed with a status 200', () => {
        // then
        expect(response).to.have.status(200)
      })

      it('should redirect to show page', () => {
        // then
        expect(response).to.be.html
        expect(response.text).to.contain(author.name, author.age, author.language)
      })
    })

    context('when there is a validation Error', () => {

      let validationError
      let errorMessage
      let errorDetails

      beforeEach(async () => {
        // given
        errorDetails = [{
          message: 'Language must be "french" or "english"',
          path: ['language'],
          type: 'any.required',
          context: { label: 'language', key: 'language' }
        }]
        errorMessage = 'Language must be "french" or "english"'
        validationError = new Joi.ValidationError(errorMessage, errorDetails, undefined)
        authorService.listForLanguage.rejects(validationError)

        // when
        response = await request(app)
          .post('/authors/filter')
          .type('form')
          .send({language: 'german'})
          .redirects(0)
      })

      it('should call the service with author language', () => {
        // then
        expect(authorService.listForLanguage).to.have.been.calledWith('german')})

      it('should succeed with a status 200', () => {
        // then
        expect(response).to.have.status(200)
      })

      it('should show new author page with error message and previous values', () => {
        // then
        expect(response).to.be.html
        expect(response.text).to.contain('Filter')
        expect(response.text).to.contain('Language must be &#34;french&#34; or &#34;english&#34;')
      })
    })

    context('when the author filter succeeds but match no authors', () => {

      beforeEach(async () => {
        // given
        authorService.listForLanguage.resolves([])

        // when
        response = await request(app)
          .post('/authors/filter')
          .type('form')
          .send({ 'language': 'french' })
          .redirects(0)
      })

      it('should call the service with author language', () => {
        // then
        expect(authorService.listForLanguage).to.have.been.calledWith('french')
      })

      it('should succeed with a status 200', () => {
        // then
        expect(response).to.have.status(200)
      })

      it('should redirect to show page', () => {
        // then
        expect(response).to.be.html
        expect(response.text).to.contain('Aucun autheur trouvé avec vos critères')
      })
    })
  })
})