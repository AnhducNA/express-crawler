import { IsNotEmpty, IsString } from 'class-validator'

export class TokenChatxDto {
  @IsNotEmpty()
  @IsString()
  token: string
}

export class GetDocumentsDto {
  @IsNotEmpty()
  @IsString()
  token: string

  @IsNotEmpty()
  @IsString()
  datasetId: string
}
