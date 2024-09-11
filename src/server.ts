import App from './app'
import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

const app = new App()

app.listen()

const initializeSwagger = () => {
  const options = {
    swaggerDefinition: {
      info: {
        title: 'REST API',
        version: '1.0.0',
        description: 'Example docs',
      },
    },
    apis: ['swagger.yaml'],
  }

  const specs = swaggerJSDoc(options)
  app.getServer().use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))
}
initializeSwagger()
