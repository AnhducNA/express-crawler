import { IProduct } from '@interfaces/sakuko.product.interface'
import ProductEntity from '@models/products.model'
import { Service } from 'typedi'

@Service()
export class ProductService {
  async findOne(id: number) {
    return await ProductEntity.findOne({ where: { id } })
  }

  async getChatxIdByOne(id: number) {
    return await ProductEntity.findOne({ attributes: ['id', 'chatxId'], where: { id }, raw: true })
  }

  async createOrUpdate(params: IProduct) {
    const data = await ProductEntity.findOne({
      attributes: ['id'],
      where: { id: params.id },
      raw: true,
    })
    if (!data) {
      return await ProductEntity.create(params)
    } else {
      return await ProductEntity.update(params, { where: { id: params.id }})
    }
  }
  async updateChatxId(id: number, chatxId: string) {
    return await ProductEntity.update({ chatxId }, { where: { id }})
  }
}
