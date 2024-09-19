import puppeteer from 'puppeteer'
import { Service } from 'typedi'
import fs from 'fs'
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

  async deleteChatxNotExitInMysql() {
    const productHaveChatxNotExit: {
      productNotInSegment: ProductEntity[]
      total: number
      category: { name: string; url: string; startPage?: number }
    }[] = []
    await Promise.all(
      productCategoryData.map(async (category) => {
        const productHaveChatxNotExitByCategory = await this.checkChatxNotExitInMysql(category.name)
        productHaveChatxNotExitByCategory.productNotInSegment.map(async (item) => {
          await this.productService.updateChatxId(item.id, null)
        })
      }),
    )
    return { status: true }
  }

  async getProductHaveChatxNotExit() {
    const productHaveChatxNotExit: {
      productNotInSegment: ProductEntity[]
      total: number
      category: { name: string; url: string; startPage?: number }
    }[] = []
    await Promise.all(
      productCategoryData.map(async (category) => {
        const productHaveChatxNotExitByCategory = await this.checkChatxNotExitInMysql(category.name)
        productHaveChatxNotExit.push({ ...productHaveChatxNotExitByCategory, category })
      }),
    )
    return productHaveChatxNotExit
  }

  async checkChatxNotExitInMysql(search?: string) {
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
