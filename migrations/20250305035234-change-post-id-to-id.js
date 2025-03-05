'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 외래 키 제약 조건 비활성화
    await queryInterface.sequelize.query('PRAGMA foreign_keys=OFF;');

    // 'posts' 테이블에서 'post_id' 컬럼을 'id'로 변경
    await queryInterface.renameColumn('Posts', 'post_id', 'id');

    // 외래 키 제약 조건 활성화
    await queryInterface.sequelize.query('PRAGMA foreign_keys=ON;');
  },

  down: async (queryInterface, Sequelize) => {
    // 외래 키 제약 조건 비활성화
    await queryInterface.sequelize.query('PRAGMA foreign_keys=OFF;');

    // 롤백 시 'id' 컬럼을 'post_id'로 다시 변경
    await queryInterface.renameColumn('Posts', 'id', 'post_id');

    // 외래 키 제약 조건 활성화
    await queryInterface.sequelize.query('PRAGMA foreign_keys=ON;');
  }
};
