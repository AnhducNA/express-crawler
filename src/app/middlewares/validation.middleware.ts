import { plainToClass } from 'class-transformer'
import { validate, ValidationError } from 'class-validator'
import {Request, RequestHandler} from 'express'
import { HttpException } from '@exceptions/http.exception'

const validationMiddleware = (
  type: any,
  value: string | 'body' | 'query' | 'params' = 'body',
  skipMissingProperties = false,
  whitelist = true,
  forbidNonWhitelisted = true,
): RequestHandler => {
  return (req: Request, res, next) => {
    if (!req[value]) {
      next(new HttpException(400, `Validation failed: ${value} is missing`))
      return
    }
    validate(plainToClass(type, req[value]), {
      skipMissingProperties,
      whitelist,
      forbidNonWhitelisted,
    }).then((errors: ValidationError[]) => {
      if (errors.length > 0) {
        const message = errors
          .map((error: ValidationError) => Object.values(error.constraints))
          .join(', ')
        next(new HttpException(400, message))
      } else {
        next()
      }
    })
  }
}

export default validationMiddleware
