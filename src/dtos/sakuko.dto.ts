import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class ProductDto {
  @IsOptional()
  @IsNumber()
  id?: number
  url: string
  title: string
  type: string
  inventoryQuantity: number
  inventoryPolicy: string
  sku: string
  barcode: string
  featuredImage: string
  images: string
  trademark: string
  shortDescription: string
  price: number
  originalPrice: number
  percentDiscount: string
  description: string
}
