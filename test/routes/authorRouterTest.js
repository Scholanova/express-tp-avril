const Joi = require('@hapi/joi')
const { expect, request, sinon } = require('../testHelper')
const { ResourceNotFoundError } = require('../../lib/errors')
const app = require('../../lib/app')
const authorRepository = require('../../lib/repositories/authorRepository')
const authorService = require('../../lib/services/authorService')
const models = require('../../lib/models')
const Author = models.Author

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
        expect(response.text).to.contain('french Jean-Jacques Rousseau (JJR)')
      })
    })
  })

  describe('show', () => {

    let authorId
    let response

    beforeEach(() => {
      sinon.stub(authorRepository, 'get')
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
          id: authorId, name: 'Jean-Jacques Rousseau', pseudo: 'JJR', email: 'jj@rousseau.ch', language: 'french'
        }
        author = new Author(authorData)

        authorRepository.get.resolves(author)

        // when
        response = await request(app).get(`/authors/${authorId}`)
      })

      it('should call the repository with id', () => {
        // then
        expect(authorRepository.get).to.have.been.calledWith(authorId)
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
        expect(response.text).to.contain(`Language: ${author.language}`)
        expect(response.text).to.contain(`Pseudo: ${author.pseudo}`)
        expect(response.text).to.contain(`Email: ${author.email}`)
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
        author = new Author({ id: 12, name: 'Ben', age: 3, language: 'french' })
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

  describe('listForLanguage - GET', () => {

    let response
    beforeEach(async () => {
      // given

      // when
      response = await request(app).get('/authors/filter')
    })

    it('should succeed with a status 200', () => {
      // then
      expect(response).to.have.status(200)
    })

    it('should return the filter page', () => {
      // then
      expect(response).to.be.html
      expect(response.text).to.contain(`No authors found`)
    })

  })

  describe('listForLanguage - POST', () => {

    let language
    let author1
    let author2

    beforeEach(() => {
      sinon.stub(authorService, 'listForLanguage')
    })

    context('when a language is selected', () => {

      beforeEach(async () => {
        // given
        language = 'french'
        author1 = new Author({ name: 'Jean-Jacques Rousseau', pseudo: 'JJR', email: 'jj@rousseau.ch', 'language': 'french' })
        author2 = new Author({ name: 'Philip Pullman', pseudo: 'Philip', email: 'philip@pullman.co.uk', 'language': 'french' })
        authorService.listForLanguage.resolves([author1, author2])

        // when
        response = await request(app)
              .post('/authors/filter')
              .send({ language })
      })

      it('should call the service with language data', () => {
        // then
        expect(authorService.listForLanguage).to.have.been.calledWith(language)
      })

      it('should succeed with a status 200', () => {
        // then
        expect(response).to.have.status(200)
      })

      it('should redirect to filter page', () => {
        // then
        expect(response).to.be.html
        for(let author of [author1, author2]) {
          expect(response.text).to.contain(`${author.language} ${author.name} (${author.pseudo})`)
        }        
      })

    })

    context('when language is null', () => {

      beforeEach(async () => {
        // given
        language = null
        authorService.listForLanguage.rejects(new Joi.ValidationError('"language" is required'))

        // when
        response = await request(app)
              .post('/authors/filter')
              .send({ language })
      })

      it('should call the service with language data', () => {
        // then
        expect(authorService.listForLanguage).to.have.been.calledWith(language)
      })

      it('should succeed with a status 200', () => {
        // then
        expect(response).to.have.status(200)
      })

      it('should show filter author page with error message', () => {
        // then
        expect(response).to.be.html
        expect(response.text).to.contain('Error &#34;language&#34; is required')     
      })

    })

    context('when language is not french or english', () => {

      beforeEach(async () => {
        // given
        language = 'german'
        authorService.listForLanguage.rejects(new Joi.ValidationError('"language" german is unsupported'))

        // when
        response = await request(app)
              .post('/authors/filter')
              .send({ language })
      })

      it('should call the service with language data', () => {
        // then
        expect(authorService.listForLanguage).to.have.been.calledWith(language)
      })

      it('should succeed with a status 200', () => {
        // then
        expect(response).to.have.status(200)
      })

      it('should show filter author page with error message', () => {
        // then
        expect(response).to.be.html
        expect(response.text).to.contain('Error &#34;language&#34; german is unsupported')     
      })

    })

  })

})
