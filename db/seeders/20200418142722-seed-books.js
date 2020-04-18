'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('People', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */
    return queryInterface.bulkInsert('Books',
      [
        {
          id: 100001,
          title: 'Les confessions',
          authorId: 100001,
          createdAt: new Date('1813-01-01T12:00:00'),
          updatedAt: new Date('1813-01-01T12:00:00')
        },
        {
          id: 100002,
          title: 'La Profession de foi du vicaire savoyard',
          authorId: 100001,
          createdAt: new Date('1762-10-10T12:00:00'),
          updatedAt: new Date('1762-10-10T12:00:00')
        },
        {
          id: 100003,
          title: 'L’Être et le Néant',
          authorId: 100002,
          createdAt: new Date('1943-03-13T12:00:00'),
          updatedAt: new Date('1943-03-13T21:01:00')
        }
      ],
      {})
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
    return queryInterface.bulkDelete('Books', null, {})
  }
}
