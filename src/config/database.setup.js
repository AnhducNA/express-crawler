// @ts-check
'use strict'

require('dotenv').config({
  path: `.env.${process.env.NODE_ENV || 'development'}.local`,
})

module.exports = {
  development: {
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    dialect: process.env.DB_CONNECTION,
    logging: process.env.DB_LOGGING === 'true',
    storage: process.env.DB_STORAGE,
  },
  test: {
    database: process.env.DB_DATABASE,

    dialect: process.env.DB_CONNECTION,
    storage: process.env.DB_STORAGE,
    logging: process.env.DB_LOGGING === 'true',
  },
  staging: {
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    dialect: process.env.DB_CONNECTION,
    logging: process.env.DB_LOGGING === 'true',
  },
  production: {
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    dialect: process.env.DB_CONNECTION,
    logging: process.env.DB_LOGGING === 'true',
  },
}
