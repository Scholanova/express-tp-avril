//During the test the env variable is set to test
process.env.NODE_ENV = 'test'

const chai = require('chai')
const chaiHttp = require('chai-http')
const sinon = require('sinon')
const models  = require('../lib/models');
const factory  = require('./factory');
chai.use(chaiHttp)
chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));

const expect = chai.expect
const request = chai.request
before(async () => {
  await models.sequelize.sync({ force: true, match: /_test$/ })
})

afterEach(() => {
  sinon.restore()
})

module.exports = {
  expect,
  request,
  sinon,
  factory
};
