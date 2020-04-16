'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
        queryInterface.addColumn('Authors', 'language', {
          type: Sequelize.DataTypes.STRING
        })
        return queryInterface.createTable('Authors', {
          id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
          },
          name: {
            type: Sequelize.STRING
          },
          pseudo: {
            type: Sequelize.STRING
          },
          email: {
            type: Sequelize.STRING
          },
          language: {
            type: Sequelize.STRING
          },
          createdAt: {
            allowNull: false,
            type: Sequelize.DATE
          },
          updatedAt: {
            allowNull: false,
            type: Sequelize.DATE
          }
        });
    },
  down: (queryInterface, Sequelize) => {
        queryInterface.removeColumn('Authors', 'language')
  }
};