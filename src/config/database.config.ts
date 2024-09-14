import { Sequelize, SequelizeOptions } from 'sequelize-typescript'
import { db, NODE_ENV } from './env.config'
import { Dialect } from 'sequelize'
import ProductEntity from '@models/products.model'

const sequelizeOptions: SequelizeOptions = {
  dialect: db.connection as Dialect,
  host: db.host,
  port: Number(db.port),
  storage: db.storage,
  models: [ProductEntity],
  modelMatch: (filename, member) => {
    return filename.substring(0, filename.indexOf('.model')) === member.toLowerCase()
  },
  define: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
    underscored: true,
    freezeTableName: true,
  },
  pool: {
    min: 0,
    max: 5,
  },
  logQueryParameters: NODE_ENV === 'development',
  logging: Boolean(db.logging),
  benchmark: true,
}

const sequelize = new Sequelize(db.database, db.username, db.password, sequelizeOptions)

const DB = {
  sequelize,
  ...sequelize.models,
}

export default DB
