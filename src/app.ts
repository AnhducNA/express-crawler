import 'reflect-metadata'
import compression from 'compression'
import express from 'express'
import helmet from 'helmet'
import hpp from 'hpp'
import cors from 'cors'
import { useContainer, useExpressServer } from 'routing-controllers'
import { Container } from 'typedi'
import path from 'path'
import mongoose from 'mongoose'
import { corsEnv, PORT } from './config/index.config'

class App {
  public app: express.Application = express()
  public port: string | number

  constructor() {
    this.port = PORT || 3000
    this.initializeMiddlewares()
    this.initializeRoutes()
  }

  public listen() {
    return new Promise((resolve) => {
      this.app.listen(this.port, () => {
        console.log(`🚀 App listening on the port ${this.port}`)
      })
    })
  }

  public getServer() {
    return this.app
  }

  static async closeDB() {
    await mongoose.disconnect()
  }

  private initializeMiddlewares() {
    this.app.use(cors({ origin: '*', credentials: true }))
    this.app.use(hpp())
    this.app.use(helmet())
    this.app.use(compression())
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: true }))
    this.app.use(express.static(path.join(__dirname, '/public')))
  }

  private initializeRoutes() {
    useContainer(Container)
    useExpressServer(this.app, {
      defaultErrorHandler: false,
      routePrefix: '/api',
      middlewares: [path.join(__dirname, '/app/middleware/*')],
      controllers: [path.join(__dirname, '/app/controllers/*')],
    })
  }
}

export default App
