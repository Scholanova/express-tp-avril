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
        const author = new Author({ name: 'Jean-Jacques Rousseau', pseudo: 'JJR', email: 'jj@rousseau.ch' })
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
        expect(response.text).to.contain('Jean-Jacques Rousseau (JJR)')
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
          id: authorId, name: 'Jean-Jacques Rousseau', pseudo: 'JJR', email: 'jj@rousseau.ch'
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
        author = new Author({ id: 12, name: 'Ben', age: 3 })
        authorService.create.resolves(author)

        // when
        response = await request(app)
          .post('/authors/new')
          .type('form')
          .send({ 'name': 'JJR', 'pseudo': 'JJR', 'email': 'jjr@exemple.net','language':'french' })
          .redirects(0)
      })

      it('should call the service with author data', () => {
        // then
        expect(authorService.create).to.have.been.calledWith({ email: 'jjr@exemple.net', name: 'JJR', pseudo: 'JJR',language:'french' })
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
          .send({ name: previousNameValue, pseudo: undefined, email: 'test@example.net',language:'french' })
          .redirects(0)
      })

      it('should call the service with author data', () => {
        // then
        expect(authorService.create).to.have.been.calledWith({
          name: previousNameValue, pseudo: undefined, email: 'test@example.net', language:'french'
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

  describe('filter', () => {
    let response

    beforeEach(() => {
      sinon.stub(authorService, 'listForLanguage')
    })

    context('when the listForLanguage succeeds with some results',()=>{
      let foundAuthor
      let filterLanguage

      beforeEach(async () => {
        // given
        filterLanguage = 'french'
        authorData = { name: 'Doom Slayer', pseudo: 'Doom Guy', email: 'doom.slayer@ripandtear.fr', language: 'french' }
        //foundAuthor = await authorService.create(authorData)
        foundAuthor = new Author(authorData)
        authorService.listForLanguage.resolves([foundAuthor])

        // when
        response = await request(app)
          .post('/authors/filter')
          .type('form')
          .send({ 'language': filterLanguage })
      })

      it('should call the service with language to filter upon', () =>{
          expect(authorService.listForLanguage).to.have.been.calledWith({language:filterLanguage})
      })

      it('should succeed with a status 200',()=>{
          expect(response).to.have.status(200)
      })

      it('should show result on page',() =>{
        expect(response).to.be.html
        expect(response.text).to.contain(`${foundAuthor.name} (${foundAuthor.pseudo})`)
      })
    })
    context('when the listForLanguage fails due to bad parameter',() => {
      let validationError
      let filterLanguage

      beforeEach(async () => {
        // given
        filterLanguage = 'demoniac'
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

      it('should not call the service',()=>{
          expect(authorService.listForLanguage).have.been.calledWith({language : filterLanguage})
      })

      it('should return a 200 status code', () => {
          expect(response).to.have.status(200)
      })

      it('should return the new author page with previous values',() => {
        const expectedErrorMessage = '&#34;language&#34; must be one of [french, english]'

        expect(response).to.be.html
        expect(response.text).to.contain(filterLanguage)
        expect(response.text).to.contain(expectedErrorMessage)
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
    context('when the listForLanguage fails due to missing language parameter',() => {
      let foundAuthor
      let filterLanguage

      beforeEach(async () => {
        // given
        filterLanguage = undefined
        validationError = Joi.object({
          language: Joi.string().valid('french', 'english').required()
        }).validate({ language: filterLanguage }).error

        authorService.listForLanguage.rejects(validationError)

        // when
        response = await request(app)
          .post('/authors/filter')
          .type('form')
          .send({ 'language': undefined })
      })
      it('should call the service without the parameter',()=>{
          expect(authorService.listForLanguage).have.been.calledWith({language : undefined})
      })
      it('should succeed with a status 200',()=>{
        expect(response).to.have.status(200)
      })
      it('should show the filter page with errors',()=>{
        //const expectedErrorMessage = '&#34;language&#34; must be one of [french, english]'
        const expectedErrorMessage2 = '&#34;language&#34; is required'
        expect(response).to.be.html
        expect(response.text).to.contain(expectedErrorMessage2)
        //expect(response.text).to.contain(expectedErrorMessage)
      })
    })
  })
})
