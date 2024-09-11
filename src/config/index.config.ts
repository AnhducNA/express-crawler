import dotenv from 'dotenv'
import process from 'process'

dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` })

const checkEnv = (envVar: string, defaultValue?: string) => {
  if (!process.env[envVar]) {
    if (defaultValue) {
      return defaultValue
    }
    throw new Error(`Please define the Environment variable"${envVar}"`)
  } else {
    return process.env[envVar] as string
  }
}

export const PORT: number = parseInt(checkEnv('PORT'), 10)

export const corsEnv = {
  origin: checkEnv('CORS_ORIGIN'),
  credentials: checkEnv('CORS_CREDENTIALS'),
}
export const jwt = {
  secret: checkEnv('JWT_SECRET'),
  accessExpireIn: checkEnv('JWT_ACCESS_EXPIRE_IN'),
  accessExpireFormat: checkEnv('JWT_ACCESS_EXPIRE_FORMAT'),
  refreshExpireIn: checkEnv('JWT_REFRESH_EXPIRE_IN'),
  refreshExpireFormat: checkEnv('JWT_REFRESH_EXPIRE_FORMAT'),
  resetPasswordExpireIn: checkEnv('JWT_RESET_PASSWORD_EXPIRE_IN'),
  resetPasswordExpireFormat: checkEnv('JWT_RESET_PASSWORD_EXPIRE_FORMAT'),
}
