import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator'

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsNotEmpty()
  @IsEmail()
  email: string

  @MinLength(6)
  @IsNotEmpty()
  password: string
}

export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  email: string

  @MinLength(6)
  @IsNotEmpty()
  password: string
}

export class LogoutDto {
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}

export default class ForgotPasswordDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}