const Joi = require('@hapi/joi')
const { expect, request, sinon, factory } = require('../testHelper')
const { ResourceNotFoundError } = require('../../lib/errors')
const app = require('../../lib/app')
const authorRepository = require('../../lib/repositories/authorRepository')
const bookRepository = require('../../lib/repositories/bookRepository')
const authorService = require('../../lib/services/authorService')
const bookService = require('../../lib/services/bookService')
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

      let author
      beforeEach(async () => {
        // given
        author = factory.createAuthor()
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
        expect(response.text).to.contain(`${author.name} (${author.pseudo})`)
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

      it('should call the author repository with id', () => {
        // then
        expect(authorRepository.get).to.have.been.calledWith(authorId)
      })

      it('should not call the book repository with author id', () => {
        // then
        expect(bookRepository.listForAuthor).to.not.have.been.called
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

    context('when there is a author matching in the repository with no books', () => {

      let author

      beforeEach(async () => {
        // given
        authorId = '123'
        author = factory.createAuthor({ id: authorId })

        authorRepository.get.resolves(author)
        bookRepository.listForAuthor.resolves([])

        // when
        response = await request(app).get(`/authors/${authorId}`)
      })

      it('should call the author repository with id', () => {
        // then
        expect(authorRepository.get).to.have.been.calledWith(authorId)
      })

      it('should call the book repository with author id', () => {
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
        expect(response.text).to.contain(`Language: ${author.language}`)
      })

      it('should return the show page with no books message', () => {
        // then
        expect(response).to.be.html
        expect(response.text).to.contain('No books found for that author')
      })
    })

    context('when there is a author matching in the repository with books', () => {

      let author, book1, book2

      beforeEach(async () => {
        // given
        authorId = '123'
        author = factory.createAuthor({ id: authorId })
        book1 = factory.createBook({ title: 'Book1', authorId: authorId })
        book2 = factory.createBook({ title: 'Book2', authorId: authorId })

        authorRepository.get.resolves(author)
        bookRepository.listForAuthor.resolves([book1, book2])

        // when
        response = await request(app).get(`/authors/${authorId}`)
      })

      it('should call the author repository with id', () => {
        // then
        expect(authorRepository.get).to.have.been.calledWith(authorId)
      })

      it('should call the book repository with author id', () => {
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
        expect(response.text).to.contain(`Language: ${author.language}`)
      })

      it('should return the show page with the author’s books info', () => {
        // then
        expect(response).to.be.html
        expect(response.text).to.contain(`${book1.title}`)
        expect(response.text).to.contain(`${book2.title}`)
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
      let authorName
      let authorPseudo
      let authorEmail
      let authorLanguage

      beforeEach(async () => {
        // given
        authorName = 'Émile Zola'
        authorPseudo = 'L’Accusateur'
        authorEmail = 'emile@zola.fr'
        authorLanguage = 'french'

        author = factory.createAuthor({
          name: authorName,
          pseudo: authorPseudo,
          email: authorEmail,
          language: authorLanguage
        })
        authorService.create.resolves(author)

        // when
        response = await request(app)
          .post('/authors/new')
          .type('form')
          .send({ 'name': authorName, 'pseudo': authorPseudo, 'email': authorEmail, 'language': authorLanguage })
          .redirects(0)
      })

      it('should call the service with author data', () => {
        // then
        expect(authorService.create).to.have.been.calledWith({
          name: authorName,
          pseudo: authorPseudo,
          email: authorEmail,
          language: authorLanguage
        })
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

      let authorName
      let authorPseudo
      let authorLanguage

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

        authorName = 'Émile Zola'
        authorPseudo = 'L’Accusateur'
        authorLanguage = 'french'

        // when
        response = await request(app)
          .post('/authors/new')
          .type('form')
          .send({ 'name': authorName, 'pseudo': authorPseudo, 'email': undefined, 'language': authorLanguage })
          .redirects(0)
      })

      it('should call the service with author data', () => {
        // then
        expect(authorService.create).to.have.been.calledWith({
          'name': authorName, 'pseudo': authorPseudo, 'email': undefined, 'language': authorLanguage
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
        expect(response.text).to.contain('&#34;email&#34; is required')
        expect(response.text).to.contain(authorName)
        expect(response.text).to.contain(authorPseudo)
        expect(response.text).to.contain(authorLanguage)
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

        foundAuthor = factory.createAuthor({
          language: filterLanguage
        })
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
        expect(response.text).to.contain(`${foundAuthor.name} (${foundAuthor.pseudo})`)
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

  describe('new Book - GET', () => {

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
        response = await request(app).get(`/authors/${authorId}/books/new`)
      })

      it('should call the author repository with id', () => {
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
        author = factory.createAuthor({ id: authorId })

        authorRepository.get.resolves(author)

        // when
        response = await request(app).get(`/authors/${authorId}/books/new`)
      })

      it('should call the author repository with id', () => {
        // then
        expect(authorRepository.get).to.have.been.calledWith(authorId)
      })

      it('should succeed with a status 200', () => {
        // then
        expect(response).to.have.status(200)
      })

      it('should return the new book page with the author’s name', () => {
        // then
        expect(response).to.be.html
        expect(response.text).to.contain(`Create a new book for ${author.name}`)
      })
    })
  })

  describe('new Book - POST', () => {

    let response

    beforeEach(() => {
      sinon.stub(authorRepository, 'get')
      sinon.stub(bookService, 'create')
    })

    context('when the book creation succeeds', () => {

      let authorId, bookTitle, book

      beforeEach(async () => {
        // given
        bookTitle = 'Germinal'
        authorId = '213'
        book = factory.createBook({ title: bookTitle, authorId })

        bookService.create.resolves(book)

        // when
        response = await request(app)
          .post(`/authors/${authorId}/books/new`)
          .type('form')
          .send({ 'title': bookTitle })
          .redirects(0)
      })

      it('should call the service with author id and book data', () => {
        // then
        expect(bookService.create).to.have.been.calledWith({
          authorId: authorId,
          title: bookTitle
        })
      })

      it('should not call the author repository', () => {
        // then
        expect(authorRepository.get).to.not.have.been.called
      })

      it('should succeed with a status 302', () => {
        // then
        expect(response).to.have.status(302)
      })

      it('should redirect to author show page', () => {
        // then
        expect(response).to.redirectTo(`/authors/${authorId}`)
      })
    })

    context('when the book creation fails with validation errors', () => {

      let validationError
      let errorMessage
      let errorDetails

      let authorId
      let authorName
      let bookTitle

      beforeEach(async () => {
        // given
        errorDetails = [{
          message: '"title" is required',
          path: ['title'],
          type: 'any.required',
          context: { label: 'title', key: 'title' }
        }]
        errorMessage = '"title" is required'
        validationError = new Joi.ValidationError(errorMessage, errorDetails, undefined)

        authorId = '1243'
        authorName = 'Émile Zola'
        bookTitle = 'Germinal'
        const author = factory.createAuthor({ id: authorId, name: authorName })

        authorRepository.get.resolves(author)
        bookService.create.rejects(validationError)

        // when
        response = await request(app)
          .post(`/authors/${authorId}/books/new`)
          .type('form')
          .send({ 'title': bookTitle })
          .redirects(0)
      })

      it('should call the service with author data', () => {
        // then
        expect(bookService.create).to.have.been.calledWith({
          authorId: authorId,
          title: bookTitle
        })
      })

      it('should call the author repository with id', () => {
        // then
        expect(authorRepository.get).to.have.been.calledWith(authorId)
      })

      it('should succeed with a status 200', () => {
        // then
        expect(response).to.have.status(200)
      })

      it('should show new author page with error message and previous values', () => {
        // then
        expect(response).to.be.html
        expect(response.text).to.contain(`Create a new book for ${authorName}`)
        expect(response.text).to.contain('&#34;title&#34; is required')
        expect(response.text).to.contain(bookTitle)
      })
    })
  })
})
