'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'sex', {
      type: Sequelize.STRING,
      allowNull: true, // 또는 false
    });
    await queryInterface.addColumn('Users', 'birth', {
      type: Sequelize.STRING, // 예시로 STRING 타입 사용
      allowNull: true, // 또는 false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'sex');
    await queryInterface.removeColumn('Users', 'birth');
  }
};
