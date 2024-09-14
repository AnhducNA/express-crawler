import { ProductDto } from '@dtos/sakuko.dto'
import { ProductService } from '@service/product.service'
import { Body, JsonController, Post, Res } from 'routing-controllers'
import { Service } from 'typedi'

@JsonController('/product')
@Service()
export class ProductController {
  constructor(protected productService: ProductService) {}

  @Post('/store')
  async createOrUpdateProduct(@Body() body: ProductDto, @Res() res: any) {
    const data = await this.productService.createOrUpdate(body)
    return res.status(200).json({ data: data })
  }
}
