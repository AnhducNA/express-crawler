module.exports = {
  up: async (QueryInterface, Sequelize) => {
    await QueryInterface.createTable('products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      chatxId: {
        allowNull: true,
        field: 'chatx_id',
        type: Sequelize.STRING(),
      },
      url: {
        type: Sequelize.STRING(255),
        field: 'url',
        allowNull: true,
      },
      title: {
        type: Sequelize.STRING(255),
        field: 'title',
        allowNull: true,
      },
      type: {
        type: Sequelize.STRING(255),
        field: 'type',
        allowNull: true,
      },
      inventoryQuantity: {
        type: Sequelize.INTEGER,
        field: 'inventory_quantity',
        allowNull: true,
      },
      inventoryPolicy: {
        type: Sequelize.STRING(255),
        field: 'inventory_policy',
        allowNull: true,
      },
      sku: {
        type: Sequelize.STRING(255),
        field: 'sku',
        allowNull: true,
      },
      barcode: {
        type: Sequelize.STRING(255),
        field: 'barcode',
        allowNull: true,
      },
      featuredImage: {
        type: Sequelize.STRING(),
        field: 'featured_image',
        allowNull: true,
      },
      images: {
        type: Sequelize.TEXT('medium'),
        field: 'images',
        allowNull: true,
      },
      trademark: {
        type: Sequelize.STRING(255),
        field: 'trademark',
        allowNull: true,
      },
      shortDescription: {
        type: Sequelize.TEXT('medium'),
        field: 'short_description',
        allowNull: true,
      },
      price: {
        type: Sequelize.INTEGER,
        field: 'price',
        allowNull: true,
      },
      originalPrice: {
        type: Sequelize.INTEGER,
        field: 'original_price',
        allowNull: true,
      },
      percentDiscount: {
        type: Sequelize.STRING(255),
        field: 'percent_discount',
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT('long'),
        field: 'description',
        allowNull: true,
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
