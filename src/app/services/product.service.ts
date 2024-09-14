import { IProduct } from '@interfaces/sakuko.product.interface'
import ProductEntity from '@models/products.model'
import { Service } from 'typedi'

@Service()
export class ProductService {
  async findOne(id: number) {
    return await ProductEntity.findOne({ where: { id } })
  }

  async createOrUpdate(params: IProduct) {
    const data = await ProductEntity.findOne({
      attributes: ['id'],
      where: { id: params.id },
      raw: true,
    })
    if (!data) {
      await ProductEntity.create(params)
    } else {
      await ProductEntity.update(params, { where: { id: params.id }, returning: true })
    }
    return await ProductEntity.findOne({
      where: { id: params.id },
      raw: true,
    })
  }
  
}
