'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Authors', 'language', {
      type: Sequelize.STRING
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Authors');
  }
};