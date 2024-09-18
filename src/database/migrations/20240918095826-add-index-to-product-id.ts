module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addIndex('products', ['id'], {
      name: 'product_id_index',
      unique: true,
    })
  },

  down: async (queryInterface) => queryInterface.removeIndex('products', 'product_id_index'),
}
