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
    return queryInterface.bulkInsert('Authors',
      [
        {
          name: 'Jean-Jacques Rousseau',
          pseudo: 'JJR',
          email: 'jj@rousseau.ch',
          language: 'french',
          createdAt: new Date('1712-06-28T15:24:00'),
          updatedAt: new Date('1778-07-02T03:56:00')
        },
        {
          name: 'Jean-Paul Sartre',
          pseudo: undefined,
          language: 'french',
          email: 'jp_sartre@academie-francaise.fr',
          createdAt: new Date('1905-06-21T10:31:00'),
          updatedAt: new Date('1980-04-15T21:01:00')
        }
      ],
      {})
      return queryInterface.bulkInsert('Books',
      [
        {
          authorId: 1,
          title: 'Du contrat social',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          authorId: 1,
          title: 'Discours sur l\'origine et les fondements de l\'inégalité parmi les hommes',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          authorId: 1,
          title: 'Les Confessions',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          authorId: 1,
          title: 'Les rêveries du promeneur solitaire',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          authorId: 2,
          title: 'La Nausée',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          authorId: 2,
          title: 'L\'Être et le Néant',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          authorId: 2,
          title: 'L\'existentialisme est un humanisme',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          authorId: 2,
          title: 'Les Mots',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ],
      {})
  },
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
    return queryInterface.bulkDelete('Authors', null, {})
  }
}
