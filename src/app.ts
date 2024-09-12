import 'reflect-metadata'
import compression from 'compression'
import express from 'express'
import helmet from 'helmet'
import hpp from 'hpp'
import cors from 'cors'
import { useContainer, useExpressServer } from 'routing-controllers'
import { Container } from 'typedi'
import path from 'path'
import * as cron from 'node-cron'
import { PORT } from './config/index.config'
import { SakukoService } from '@service/sakuko.service'

class App {
  public app: express.Application = express()
  public port: string | number
  private sakukoService: SakukoService

  constructor() {
    this.port = PORT || 3000
    this.initializeMiddlewares()
    this.initializeRoutes()
    this.sakukoService = new SakukoService()
  }

  public listen() {
    cron.schedule('15 12,22 * * *', async () => {
      console.log('running scrapeData 12 hours')
      await this.sakukoService.scrapeData()
    })
    return new Promise((resolve) => {
      this.app.listen(this.port, () => {
        console.log(`🚀 App listening on the port ${this.port}`)
      })
    })
  }

  public getServer() {
    return this.app
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
