module.exports = {
  up: async (QueryInterface, Sequelize) => {
    await QueryInterface.createTable('products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      networkId: {
        type: Sequelize.INTEGER,
        field: 'network_id',
        allowNull: false,
        references: { model: 'networks', key: 'id' },
      },

      name: {
        type: Sequelize.STRING(255),
        field: 'name',
        allowNull: false,
      },

      totalSupply: {
        type: Sequelize.STRING(255),
        field: 'total_supply',
        allowNull: false,
      },

      tokenAddress: {
        type: Sequelize.STRING(255),
        field: 'token_address',
        allowNull: false,
      },

      productsymbol: {
        type: Sequelize.STRING(255),
        field: 'token_symbol',
        allowNull: false,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        field: 'created_at',
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        field: 'updated_at',
      },
    })
  },

  down: async (queryInterface) => queryInterface.dropTable('products'),
}
