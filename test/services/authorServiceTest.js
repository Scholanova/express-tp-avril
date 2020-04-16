const { expect, sinon } = require('../testHelper')

const authorService = require('../../lib/services/authorService')
const authorRepository = require('../../lib/repositories/authorRepository')
const Joi = require('@hapi/joi')
const Author = require('../../lib/models').Author

describe('authorService', () => {

  describe('create', () => {

    let authorData
    let authorCreationPromise

    beforeEach(() => {
      sinon.stub(authorRepository, 'create')
    })

    context('when the author data is valid', () => {

      let author

      beforeEach(() => {
        // given
        authorData = { name: 'Jean-Jacques Rousseau', pseudo: 'JJR', email: 'jj@rousseau.ch', language: 'french' }
        author = new Author(authorData)
        authorRepository.create.resolves(author)

        // when
        authorCreationPromise = authorService.create(authorData)
      })

      // then
      it('should call the author Repository with the creation data', async () => {
        // then
        await authorCreationPromise.catch(() => {})
        expect(authorRepository.create).to.have.been.calledWith(authorData)
      })
      it('should resolve with the created author from reprository', () => {
        // then
        return expect(authorCreationPromise).to.eventually.equal(author)
      })
    })

    context('when the author name is missing', () => {

      beforeEach(() => {
        // given
        authorData = { name: undefined, pseudo: 'JJR', email: 'jj@rousseau.ch', language: 'french' }

        // when
        authorCreationPromise = authorService.create(authorData)
      })

      it('should not call the author Repository', async () => {
        // then
        await authorCreationPromise.catch(() => {})
        expect(authorRepository.create).to.not.have.been.called
      })
      it('should reject with a ValidationError error about missing name', () => {
        // then
        const expectedErrorDetails = [{
          message: '"name" is required',
          path: ['name'],
          type: 'any.required',
          context: { label: 'name', key: 'name' }
        }]

        return expect(authorCreationPromise)
          .to.eventually.be.rejectedWith(Joi.ValidationError)
          .with.deep.property('details', expectedErrorDetails)
      })
    })

    context('when the author name is empty', () => {

      beforeEach(() => {
        // given
        authorData = { name: '', pseudo: 'JJR', email: 'jj@rousseau.ch', language: 'french' }

        // when
        authorCreationPromise = authorService.create(authorData)
      })

      it('should not call the author Repository', async () => {
        // then
        await authorCreationPromise.catch(() => {})
        expect(authorRepository.create).to.not.have.been.called
      })
      it('should reject with a ValidationError error about missing name', () => {
        // then
        const expectedErrorDetails = [{
          message: '"name" is not allowed to be empty',
          path: ['name'],
          type: 'string.empty',
          context: { label: 'name', key: 'name', value: '' }
        }]

        return expect(authorCreationPromise)
          .to.eventually.be.rejectedWith(Joi.ValidationError)
          .with.deep.property('details', expectedErrorDetails)
      })
    })

    context('when the author name is to short', () => {

      beforeEach(() => {
        // given
        authorData = { name: 'JJR', pseudo: 'JJR', email: 'jj@rousseau.ch', language: 'french' }

        // when
        authorCreationPromise = authorService.create(authorData)
      })

      it('should not call the author Repository', async () => {
        // then
        await authorCreationPromise.catch(() => {})
        expect(authorRepository.create).to.not.have.been.called
      })
      it('should reject with a ValidationError error about missing name', () => {
        // then
        const expectedErrorDetails = [{
          message: '"name" length must be at least 4 characters long',
          path: ['name'],
          type: 'string.min',
          context: { label: 'name', key: 'name', value: 'JJR', limit: 4, encoding: 'utf8' }
        }]
        return expect(authorCreationPromise)
          .to.eventually.be.rejectedWith(Joi.ValidationError)
          .with.deep.property('details', expectedErrorDetails)
      })
    })

    context('when the author email is missing', () => {

      beforeEach(() => {
        // given
        authorData = { name: 'Jean-Jacques', pseudo: 'JJR', email: undefined, language: 'french' }

        // when
        authorCreationPromise = authorService.create(authorData)
      })

      it('should not call the author Repository', async () => {
        // then
        await authorCreationPromise.catch(() => {})
        expect(authorRepository.create).to.not.have.been.called
      })
      it('should reject with a ValidationError error about missing email', () => {
        // then
        const expectedErrorDetails = [{
          message: '"email" is required',
          path: ['email'],
          type: 'any.required',
          context: { label: 'email', key: 'email' }
        }]

        return expect(authorCreationPromise)
          .to.eventually.be.rejectedWith(Joi.ValidationError)
          .with.deep.property('details', expectedErrorDetails)
      })
    })

    context('when the author email is not a valid email', () => {

      beforeEach(() => {
        // given
        authorData = { name: 'Jean-Jacques', pseudo: 'JJR', email: 'not an email', language: 'french' }

        // when
        authorCreationPromise = authorService.create(authorData)
      })

      it('should not call the author Repository', async () => {
        // then
        await authorCreationPromise.catch(() => {})
        expect(authorRepository.create).to.not.have.been.called
      })
      it('should reject with a ValidationError error about invalid email format', () => {
          // then
          const expectedErrorDetails = [{
            message: '"email" must be a valid email',
            path: ['email'],
            type: 'string.email',
            context: {
              invalids: ['not an email'], label: 'email', key: 'email', value: 'not an email'
            },

          }]

          return expect(authorCreationPromise)
            .to.eventually.be.rejectedWith(Joi.ValidationError)
            .with.deep.property('details', expectedErrorDetails)
        }
      )
    })

    context('when the author name and email and language are missing', () => {

      beforeEach(() => {
        // given
        authorData = {}

        // when
        authorCreationPromise = authorService.create(authorData)
      })

      it('should not call the author Repository', async () => {
        // then
        await authorCreationPromise.catch(() => {})
        expect(authorRepository.create).to.not.have.been.called
      })
      it('should reject with a ValidationError error about missing email, name and language', () => {
        // then
        const expectedErrorDetails = [
          {
            context: { key: 'name', label: 'name'},
            message: '"name" is required',
            path: ['name'],
            type: 'any.required'
          },
          {
            context: { key: 'email', label: 'email'},
            message: '"email" is required',
            path: ['email'],
            type: 'any.required'
          },
          {
            context: { key: 'language', label: 'language'},
            message: '"language" is required',
            path: ['language'],
            type: 'any.required'
          }
        ]

        return expect(authorCreationPromise)
          .to.eventually.be.rejectedWith(Joi.ValidationError)
          .with.deep.property('details', expectedErrorDetails)
      })
    })

    context('when the author language is missing', () => {

      beforeEach(() => {
        // given
        authorData = { name: 'JJRR', pseudo: 'JJRR', email: 'jj@rousseau.ch', language: undefined }

        // when
        authorCreationPromise = authorService.create(authorData)
      })

      it('should not call the author Repository', async () => {
        // then
        await authorCreationPromise.catch(() => {})
        expect(authorRepository.create).to.not.have.been.called
      })
      it('should reject with a ValidationError error about missing language', () => {
        // then
        const expectedErrorDetails = [{
          message: '"language" is required',
          path: ['language'],
          type: 'any.required',
          context: { label: 'language', key: 'language' }
        }]

        return expect(authorCreationPromise)
          .to.eventually.be.rejectedWith(Joi.ValidationError)
          .with.deep.property('details', expectedErrorDetails)
      })
    })

    context('when the author language is neither french nor english', () => {

      beforeEach(() => {
        // given
        authorData = { name: 'Jean', pseudo: 'JJR', email: 'jj@rousseau.ch', language: 'german' }

        // when
        authorCreationPromise = authorService.create(authorData)
      })

      it('should not call the author Repository', async () => {
        // then
        await authorCreationPromise.catch(() => {})
        expect(authorRepository.create).to.not.have.been.called
      })
      it('should reject with a ValidationError error about unsupported language', () => {
        // then
        const expectedErrorDetails = [{
          message: '"language" must be one of [french, english]',
          path: ['language'],
          type: 'any.only',
          context: { label: 'language', key: 'language', valids: ['french', 'english'], 'value': 'german' }
        }]

        return expect(authorCreationPromise)
          .to.eventually.be.rejectedWith(Joi.ValidationError)
          .with.deep.property('details', expectedErrorDetails)
      })
    })
  })

  describe('listForLanguage', () => {
    //describe('listForLanguage', () => {
      //let result

      let language
      let authorListForLanguagePromise
  
      beforeEach(() => {
        sinon.stub(authorRepository, 'listForLanguage')
      })

      context('when the author language is missing', () => {

        beforeEach(async () => {
          // given
          language = null
  
          // when
          authorListForLanguagePromise = authorService.listForLanguage(language)
        })

        it('should not call the author Repository', async () => {
         // then
         await authorListForLanguagePromise.catch(() => {})
         expect(authorRepository.listForLanguage).to.not.have.been.called
        })

        it('should reject with a ValidationError error about missing language', () => {
          // then
          const errorMessage = '"language" is required' 
  
          return expect(authorListForLanguagePromise)
            .to.eventually.be.rejectedWith(Joi.ValidationError)
            .with.deep.property('message', errorMessage)
        })
      })
      context('when the author language is neither french nor english', () => {

        beforeEach(async () => {
          // given
          
          jjrData = { name: 'Jean-Jacques Rousseau', pseudo: 'JJR', email: 'jj@rousseau.fr', language: 'french' }
          ppData = { name: 'Philip Pullman', pseudo: 'Philip', email: 'philip@pullman.co.uk', language: 'english'}
          language = "german"

          // when
          authorListForLanguagePromise = authorService.listForLanguage(language)
        })
        it('should not call the author Repository', async () => {
          // then
          await authorListForLanguagePromise.catch(() => {})
          expect(authorRepository.listForLanguage).to.not.have.been.called
        })
        it('should reject with a ValidationError error about unsupported language', () => {
          // then
          const errorMessage = '"language" must be "french" or "english"' 
  
          return expect(authorListForLanguagePromise)
            .to.eventually.be.rejectedWith(Joi.ValidationError)
            .with.deep.property('message', errorMessage)
        })
      })
      context('when the author language is either french or english', () => {

        beforeEach(async () => {
          // given
          
          jjrData = { name: 'Jean-Jacques Rousseau', pseudo: 'JJR', email: 'jj@rousseau.fr', language: 'french' }
          ppData = { name: 'Philip Pullman', pseudo: 'Philip', email: 'philip@pullman.co.uk', language: 'english'}

          authorRepository.listForLanguage.resolves([jjrData, ppData])

          language = "french"

          // when
          authorListForLanguagePromise = authorService.listForLanguage(language)
        })

        it('should call the author Repository with the language', async () => {
          // then
          await authorListForLanguagePromise.catch(() => {})
          expect(authorRepository.listForLanguage).to.have.been.calledWith(language)
        })
        it('should resolve with the authors listed from repository', () => {
          // then
          return expect(authorListForLanguagePromise).to.eventually.be.deep.equal([jjrData, ppData])
        })
      })
   // })
  })
})