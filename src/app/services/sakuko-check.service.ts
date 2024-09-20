import { Service } from 'typedi'
import { ChatXService } from './chatx.service'
import { chatx } from 'src/config/env.config'
import { ProductService } from './product.service'
import productCategoryData from 'src/data/product-category.data'
import ProductEntity from '@models/products.model'

@Service()
export class SakukoCheckService {
  constructor(
    protected chatxService: ChatXService,
    protected productService: ProductService,
  ) {}

  async getRedundantSegmentInChatX() {
    const redundantSegmentInChatX = []
    await Promise.all(
      productCategoryData.map(async (category) => {
        const segmentsNotExitInMysql = await this.getSegmentNotExitInMysql(category.name)
        redundantSegmentInChatX.push({ ...segmentsNotExitInMysql, category })
      }),
    )
    return redundantSegmentInChatX
  }

  async deleteRedundantSegmentInChatX() {
    await Promise.all(
      productCategoryData.map(async (category) => {
        const segmentsNotExitInMysql = await this.getSegmentNotExitInMysql(category.name)
        for (const segment of segmentsNotExitInMysql.segmentNotInMysql) {
          await this.chatxService.deleteSegment(segment.segmentId)
        }
      }),
    )
    return { status: true }
  }

  async getChatxNotExitInMysql() {
    const productHaveChatxNotExit = []
    await Promise.all(
      productCategoryData.map(async (category) => {
        const productHaveChatxNotExitByCategory = await this.getProductWithSegmentNotExitByCategory(
          category.name,
        )
        productHaveChatxNotExit.push({ ...productHaveChatxNotExitByCategory, category })
      }),
    )
    return productHaveChatxNotExit
  }

  async deleteChatxNotExitInMysql() {
    await Promise.all(
      productCategoryData.map(async (category) => {
        const productHaveChatxNotExitByCategory = await this.getProductWithSegmentNotExitByCategory(
          category.name,
        )
        productHaveChatxNotExitByCategory.productNotInSegment.map(async (item) => {
          await this.productService.updateChatxId(item.id, null)
        })
      }),
    )
    return { status: true }
  }

  async getProductWithSegmentNotExit() {
    const productHaveChatxNotExit: {
      productNotInSegment: ProductEntity[]
      total: number
      category: { name: string; url: string; startPage?: number }
    }[] = []
    await Promise.all(
      productCategoryData.map(async (category) => {
        const productHaveChatxNotExitByCategory = await this.getProductWithSegmentNotExitByCategory(
          category.name,
        )
        productHaveChatxNotExit.push({ ...productHaveChatxNotExitByCategory, category })
      }),
    )
    return productHaveChatxNotExit
  }

  async getSegmentNotExitInMysql(search?: string) {
    search = search ? search : ''
    const segments: {
      data: { id: string; content: string; keywords: string[] }[]
      doc_form: string
      total: number
    } = await this.chatxService.getSegments(chatx.token, chatx.dataset, chatx.document)
    const segmentsFilter: { productId: number; segmentId: string }[] = segments.data
      .filter((segment) => {
        try {
          const content = JSON.parse(segment.content)
          return content.categoryType.includes(search)
        } catch (error) {
          return false
        }
      })
      .map((segment) => {
        try {
          const content = JSON.parse(segment.content)
          return { productId: content.id, segmentId: segment.id }
        } catch (error) {}
      })

    const productByCategoryType = (
      await this.productService.getWithChatxByCategoryType(search)
    ).map((item) => item.chatxId)

    const segmentNotInMysql = segmentsFilter.filter(({ productId, segmentId }) => {
      return !productByCategoryType.includes(segmentId)
    })
    return { segmentNotInMysql, total: segmentNotInMysql.length }
  }

  async getProductWithSegmentNotExitByCategory(search?: string) {
    search = search ? search : ''
    const segments: {
      data: { content: string; keywords: string[] }[]
      doc_form: string
      total: number
    } = await this.chatxService.getSegments(chatx.token, chatx.dataset, chatx.document)
    const segmentFilter = segments.data
      .filter((segment) => {
        try {
          const content = JSON.parse(segment.content)
          return content.categoryType.includes(search)
        } catch (error) {
          return false
        }
      })
      .map((segment) => {
        try {
          const content = JSON.parse(segment.content)
          return content.id
        } catch (error) {}
      })
    const productByCategoryType = await this.productService.getWithChatxByCategoryType(search)
    const productNotInSegment = productByCategoryType.filter(
      (product) => !segmentFilter.includes(product.id),
    )
    return { productNotInSegment, total: productNotInSegment.length }
  }
}
