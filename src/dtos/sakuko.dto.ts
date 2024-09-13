import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class ProductDto {
  @IsNotEmpty()
  @IsNumber()
  productId: number

  productUrl: string
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
