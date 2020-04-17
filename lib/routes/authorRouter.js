const authorRepository = require('../repositories/authorRepository')
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

router.post('/filter', function (req, res, next) {
  authorService.listForLanguage({language:req.body['language']})
    .then((authors) => {
      res.render('author/filter', { authors })
    })
    .catch((error) => {
      if (error instanceof Joi.ValidationError) {
        res.render('author/filter', {
          values: {
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
  res.render('author/filter',{ authors:[] })
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

router.get('/:id', function (req, res, next) {
  const authorId = req.params.id

  authorRepository.get(authorId)
    .then((author) => {
      res.render('author/show', { author })
    })
    .catch(next)
})

module.exports = router
