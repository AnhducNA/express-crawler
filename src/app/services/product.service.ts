import { IProduct } from '@interfaces/sakuko.product.interface'
import ProductEntity from '@models/products.model'
import { BadRequestError } from 'routing-controllers'
import { Op } from 'sequelize'
import { Service } from 'typedi'

@Service()
export class ProductService {
  async findOne(id: number) {
    return await ProductEntity.findOne({ where: { id } })
  }

  async getChatxIdByOne(id: number) {
    return await ProductEntity.findOne({ attributes: ['id', 'chatxId'], where: { id }, raw: true })
  }
  async getWithChatxByCategoryType(categoryType?: string) {
    if (categoryType) {
      return await ProductEntity.findAll({
        attributes: ['id', 'url', 'chatxId', 'categoryType'],
        where: {
          categoryType,
          chatxId: {
            [Op.not]: null,
          },
        },
        raw: true,
      })
    }
    return await ProductEntity.findAll({
      attributes: ['id', 'url', 'chatxId', 'categoryType'],
      raw: true,
    })
  }
  async createOrUpdate(params: IProduct) {
    try {
      const data = await ProductEntity.findOne({
        attributes: ['id'],
        where: { id: params.id },
        raw: true,
      })
      if (!data) {
        return await ProductEntity.create(params)
      } else {
        return await ProductEntity.update(params, { where: { id: params.id } })
      }
    } catch (error) {
      console.log(error)
      throw new BadRequestError('Error createOrUpdate')
    }
  }

  async updateChatxId(id: number, chatxId?: string | null) {
    if (!chatxId) {
      chatxId = null
    }
    return await ProductEntity.update({ chatxId }, { where: { id } })
  }
}
