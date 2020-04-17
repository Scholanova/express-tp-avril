const authorRepository = require('../repositories/authorRepository')
const bookRepository = require('../repositories/bookRepository')
const authorService = require('../services/authorService')
const router = require('express').Router()
const Joi = require('@hapi/joi')

router.get('/', function (req, res, next) {
  authorRepository.listAll()
    .then((authors) => {
      res.render('author/list', { authors })
    })
    .catch(next)
})

router.get('/new', function (req, res, next) {
  res.render('author/new')
})

router.post('/new', function (req, res, next) {
  const authorData = {
    name: req.body['name'],
    pseudo: req.body['pseudo'],
    email: req.body['email'],
    language: req.body['language']
  }
  return authorService.create(authorData)
    .then((author) => {
      res.redirect(`/authors/${author.id}`)
    })
    .catch((error) => {
      if (error instanceof Joi.ValidationError) {
        res.render('author/new', {
          values: {
            name: req.body['name'],
            pseudo: req.body['pseudo'],
            email: req.body['email'],
            language: req.body['language']
          },
          failedFields: error.details
        })
      } else {
        next(error)
      }
    })
})

router.get('/filter', function (req, res, next) {
  res.render('author/filter', { authors: [], error: null })
})

router.post('/filter', function (req, res, next) {
  const authorLanguage = req.body['language']

  return authorService.listForLanguage(authorLanguage)
    .then((authors) => {
      res.render('author/filter', { authors, error: null })
    })
    .catch((error) => {
      if (error instanceof Joi.ValidationError) {
        res.render('author/filter', { authors: [], error: error.message })
      } else {
        next(error)
      }
    })
})

router.get('/:id', function (req, res, next) {
  const authorId = req.params.id

  authorRepository.get(authorId)
    .then((author) => {
      bookRepository.listForAuthor(author.id)
        .then((books) => {
          res.render('author/show', { author, books })
        })
        .catch(next)
    })
    .catch(next)
})


module.exports = router
