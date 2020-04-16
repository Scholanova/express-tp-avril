'use strict';

module.exports = {
  up: function(queryInterface, Sequelize) {

    return queryInterface.addColumn(
      'Authors',
      'language',
     Sequelize.STRING
    );

  },

  down: function(queryInterface, Sequelize) {
    // logic for reverting the changes
    return queryInterface.removeColumn(
      'Authors',
      'language'
    );
  }
}
