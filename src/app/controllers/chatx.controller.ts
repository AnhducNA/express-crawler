import { GetDocumentsDto, TokenChatxDto } from '@dtos/chatx.dto'
import { ProductDto } from '@dtos/sakuko.dto'
import { ChatXService } from '@service/chatx.service'
import {
  Body,
  Delete,
  Get,
  JsonController,
  Params,
  Post,
  QueryParams,
  Res,
} from 'routing-controllers'
import { Service } from 'typedi'

@JsonController('/chatx')
@Service()
export class ChatXController {
  constructor(protected chatxService: ChatXService) {}

  @Get('/datasets/:datasetId/documents/:documentId/segments')
  async getSegments(
    @Params() params: { datasetId: string; documentId: string },
    @QueryParams() queryParams: TokenChatxDto,
    @Res() res: any,
  ) {
    const data = await this.chatxService.getSegments(
      queryParams.token,
      params.datasetId,
      params.documentId,
    )
    return res.status(200).json(data)
  }

  @Delete('/datasets/:datasetId/documents/:documentId/segments/:segmentId')
  async deleteSegment(
    @Params() params: { datasetId: string; documentId: string; segmentId: string },
    @QueryParams() queryParams: TokenChatxDto,
    @Res() res: any,
  ) {
    const data = await this.chatxService.deleteSegment(
      queryParams.token,
      params.datasetId,
      params.documentId,
      params.segmentId,
    )
    return res.status(200).json({ data })
  }

  @Post('/datasets/:datasetId/documents/:documentId/segments')
  async createSegments(
    @Params() params: { datasetId: string; documentId: string },
    @QueryParams() queryParams: TokenChatxDto,
    @Body() body: ProductDto,
    @Res() res: any,
  ) {
    const data = await this.chatxService.createSegment(
      queryParams.token,
      params.datasetId,
      params.documentId,
      body,
    )
    return res.status(200).json(data)
  }

  @Get('/datasets/:datasetId/documents')
  async getDocuments(
    @Params() params: { datasetId: string },
    @QueryParams() queryParams: TokenChatxDto,
    @Res() res: any,
  ) {
    const data = await this.chatxService.getDocuments(queryParams.token, params.datasetId)
    return res.status(200).json({ data: data })
  }

  @Get('/datasets')
  async getDatasets(@Body() body: TokenChatxDto, @Res() res: any) {
    const data = await this.chatxService.getDatasets(body.token)
    return res.status(200).json({ data: data })
  }
}
