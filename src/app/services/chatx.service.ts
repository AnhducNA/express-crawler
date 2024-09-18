import { ProductDto } from '@dtos/sakuko.dto'
import axios from 'axios'
import { chatx } from 'src/config/env.config'
import { Service } from 'typedi'
import { ProductService } from './product.service'
import { IProduct } from '@interfaces/sakuko.product.interface'

@Service()
export class ChatXService {
  constructor(protected productService: ProductService) {}

  async getDatasets(token: string) {
    return await axios
      .get('https://api.chatx.vn/v1/datasets?', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        return res.data.data
      })
      .catch((e) => {
        console.log(e.message)
      })
  }

  async getDocuments(token: string, datasetId: string) {
    return await axios
      .get(`https://api.chatx.vn/v1/datasets/${datasetId}/documents`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        return res.data.data
      })
      .catch((e) => {
        console.log(e.message)
      })
  }

  async getSegments(token: string, datasetId: string, documentId: string) {
    return await axios
      .get(`https://api.chatx.vn/v1/datasets/${datasetId}/documents/${documentId}/segments`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        return res.data
      })
      .catch((e) => {
        console.log(e.message)
      })
  }

  async deleteSegment(token: string, datasetId: string, documentId: string, segmentId: string) {
    return await axios
      .delete(
        `https://api.chatx.vn/v1/datasets/${datasetId}/documents/${documentId}/segments/${segmentId}`,
        {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        },
      )
      .then((res) => {
        console.log(res)

        return res.data
      })
      .catch((e) => {
        console.log(e)
      })
  }

  async createOrUpdateSegmentsWithDatabaseToProduct(segmentParams: IProduct, categoryType: string) {
    try {
      segmentParams.categoryType = categoryType
      await this.productService.createOrUpdate(segmentParams)
      const productInDB = await this.productService.getChatxIdByOne(segmentParams.id)
      if (productInDB.chatxId) {
        return await this.updateSegment(
          chatx.token,
          chatx.dataset,
          chatx.document,
          segmentParams,
          productInDB.chatxId,
        )
      }
      const segmentNew = await this.createSegment(
        chatx.token,
        chatx.dataset,
        chatx.document,
        segmentParams,
      )
      return await this.productService.updateChatxId(productInDB.id, segmentNew.id)
    } catch (error) {
      console.log(error.message)
      return
    }
  }

  async createSegment(
    token: string,
    datasetId: string,
    documentId: string,
    segmentParams: ProductDto,
  ) {
    console.log(
      'Axios call api create segment: ' +
        `https://api.chatx.vn/v1/datasets/${datasetId}/documents/${documentId}/segments`,
    )
    return await axios
      .post(
        `https://api.chatx.vn/v1/datasets/${datasetId}/documents/${documentId}/segments`,
        {
          segments: [
            {
              answer: 1,
              content: JSON.stringify(segmentParams),
              keywords: [
                segmentParams.type,
                segmentParams.sku,
                segmentParams.trademark,
                segmentParams.barcode,
              ],
            },
          ],
        },
        {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        },
      )
      .then((res) => {
        return res.data.data[0]
      })
      .catch((e) => {
        console.log(e.message, e.code)
      })
  }
  async updateSegment(
    token: string,
    datasetId: string,
    documentId: string,
    segmentParams: IProduct,
    segmentIdInChatx: string,
  ) {
    console.log(
      'Axios call api update segment: ' +
        `https://api.chatx.vn/v1/datasets/${datasetId}/documents/${documentId}/segments/${segmentIdInChatx}`,
    )
    return await axios
      .post(
        `https://api.chatx.vn/v1/datasets/${datasetId}/documents/${documentId}/segments/${segmentIdInChatx}`,
        {
          segment: {
            content: JSON.stringify(segmentParams),
            enabled: true,
          },
        },
        {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        },
      )
      .then((res) => {
        return res.data.data
      })
      .catch((e) => {
        console.log(e.message, e.code)
      })
  }
}
