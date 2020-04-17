'use strict';

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
          title: 'TitleBookJJ',
          authorId: '1',
          createdAt: new Date('1905-06-21T10:31:00'),
          updatedAt: new Date('1980-04-15T21:01:00')
        },
        {
          title: 'TitleBookff',
          authorId: '2',
          createdAt: new Date('1905-06-21T10:31:00'),
          updatedAt: new Date('1980-04-15T21:01:00')
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
};
