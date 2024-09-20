import { Service } from 'typedi'
import { ChatXService } from './chatx.service'
import { chatx } from 'src/config/env.config'
import { ProductService } from './product.service'
import productCategoryData from 'src/data/product-category.data'
import ProductEntity from '@models/products.model'
import { IProduct } from '@interfaces/sakuko.product.interface'
import { SakukoService } from './sakuko.service'

@Service()
export class SakukoCheckService {
  constructor(
    protected chatxService: ChatXService,
    protected productService: ProductService,
    protected sakukoService: SakukoService,
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

  async handleProductNotUpdated() {
    const productsNotUpdate = await this.productService.getProductNotUpdate()
    if (!productsNotUpdate || productsNotUpdate.length === 0) return []
    const productUpdated: { id: number; chatxId: string; url: string; categoryType: string }[] = []
    for (const product of productsNotUpdate) {
      console.log(`Access browser detail product: ` + product.url)
      let detailData: IProduct
      let numRunsLoadErrorPage = 0
      LOOP_ERROR_PAGE: do {
        try {
          detailData = await this.sakukoService.pageDetailPromise(product.url)
          break LOOP_ERROR_PAGE
        } catch (error) {
          console.log(error)
          numRunsLoadErrorPage++
          if (numRunsLoadErrorPage >= 3) {
            await this.productService.deleteById(product.id)
            await this.chatxService.deleteSegment(product.chatxId)
            console.log(`Delete detail product at ${product.url}`)
            // break LOOP_ERROR_PAGE
            // throw new BadRequestError(`Error accessing detail product at ${link}`)
          }
          continue LOOP_ERROR_PAGE
        }
      } while (true)
      if (!detailData) {
        continue
      }
      if (detailData && detailData.id) {
        detailData.categoryType = product.categoryType
        productUpdated.push(product)
        try {
          await this.chatxService.createOrUpdateSegmentsWithDatabaseToProduct(detailData)
          console.log(`Detail product: `, {
            id: detailData.id,
            title: detailData.title,
            price: detailData.price,
          })
        } catch (error) {
          console.log('Error createOrUpdateSegmentsWithDatabaseToProduct')
        }
      }
    }
    return productUpdated
  }
}
