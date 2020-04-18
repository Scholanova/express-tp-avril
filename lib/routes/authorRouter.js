const authorRepository = require('../repositories/authorRepository')
const bookRepository = require('../repositories/bookRepository')
const authorService = require('../services/authorService')
const bookService = require('../services/bookService')
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
  res.render('author/filter', { isBeforeSearch: true })
})

router.post('/filter', function (req, res, next) {
  const filterData = {
    language: req.body['language']
  }
  return authorService.listForLanguage(filterData)
    .then((foundAuthors) => {
      res.render('author/filter', {
        isBeforeSearch: false,
        values: filterData,
        foundAuthors: foundAuthors
      })
    })
    .catch((error) => {
      if (error instanceof Joi.ValidationError) {
        res.render('author/filter', {
          isBeforeSearch: true,
          values: filterData,
          foundAuthors: [],
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
      return Promise.all([
        Promise.resolve(author),
        bookRepository.listForAuthor(author.id)
      ])
    })
    .then(([author, books]) => {
      res.render('author/show', { author, books })
    })
    .catch(next)
})

router.get('/:id/books/new', function (req, res, next) {
  const authorId = req.params.id

  authorRepository.get(authorId)
    .then((author) => {
      res.render('book/new', { author })
    })
    .catch(next)
})

router.post('/:id/books/new', function (req, res, next) {
  const authorId = req.params.id

  const bookData = {
    title: req.body['title'],
    authorId
  }
  return bookService.create(bookData)
    .then((book) => {
      res.redirect(`/authors/${book.authorId}`)
    })
    .catch((error) => {
      if (error instanceof Joi.ValidationError) {
        authorRepository.get(authorId)
          .then((author) => {
            res.render('book/new', {
              author,
              values: {
                title: req.body['title']
              },
              failedFields: error.details
            })
          })
      } else {
        next(error)
      }
    })
})

module.exports = router
