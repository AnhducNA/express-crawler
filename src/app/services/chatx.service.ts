import { ProductDto } from '@dtos/sakuko.dto'
import axios from 'axios'
import { chatx } from 'src/config/env.config'
import { Service } from 'typedi'
import { ProductService } from './product.service'
import { IProduct } from '@interfaces/sakuko.product.interface'
import { BadRequestError } from 'routing-controllers'
import { HttpException } from '@exceptions/http.exception'

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

  async deleteSegment(segmentId: string) {
    return await axios
      .delete(
        `https://api.chatx.vn/v1/datasets/${chatx.dataset}/documents/${chatx.document}/segments/${segmentId}`,
        {
          headers: { Authorization: `Bearer ${chatx.token}`, 'Content-Type': 'application/json' },
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

  async createOrUpdateSegmentsWithDatabaseToProduct(segmentParams: IProduct) {
    try {
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
      if (!segmentNew) return
      return await this.productService.updateChatxId(productInDB.id, segmentNew.id)
    } catch (error) {
      throw new BadRequestError('Error createOrUpdateSegmentsWithDatabaseToProduct 1234654')
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
        console.log(`Error axios create segment with code: ${e.code}: ` + e)
        switch (e.code) {
          case 'CERT_HAS_EXPIRED':
          case 400:
            return
          default:
            throw new BadRequestError('Error axios createSegment')
        }
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
            answer: '1',
            keywords: [
              segmentParams.type,
              segmentParams.sku,
              segmentParams.trademark,
              segmentParams.barcode,
            ],
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
        console.log(`Error axios update segment with code: ${e.code}: ` + e)
        switch (e.code) {
          case 'CERT_HAS_EXPIRED':
          case 400:
            return
          default:
            throw new BadRequestError('Error axios updateSegment')
        }
      })
  }
}
