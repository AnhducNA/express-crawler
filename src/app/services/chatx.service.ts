import { ProductDto } from '@dtos/sakuko.dto'
import axios from 'axios'
import { Service } from 'typedi'

@Service()
export class ChatXService {
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
        return res.data.data
      })
      .catch((e) => {
        console.log(e.message)
      })
  }

  async deleteSegment(token: string, datasetId: string, segmentId: string) {
    return await axios
      .delete(`https://api.chatx.vn/v1/datasets/${datasetId}/segments/${segmentId}`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      })
      .then((res) => {
        console.log(res);
        
        return res.data
      })
      .catch((e) => {
        console.log(e)
      })
  }

  async createSegments(
    token: string,
    datasetId: string,
    documentId: string,
    segmentParams: ProductDto,
  ) {
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
        return res.data.data
      })
      .catch((e) => {
        console.log(e.message, e.code)
      })
  }
}
