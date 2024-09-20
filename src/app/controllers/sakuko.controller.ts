import { SakukoCheckService } from '@service/sakuko-check.service'
import { SakukoService } from '@service/sakuko.service'
import { Body, Get, JsonController, QueryParam, QueryParams, Res } from 'routing-controllers'
import { Service } from 'typedi'
import reader from 'xlsx'

@JsonController('/sakuko')
@Service()
export class UserController {
  constructor(
    protected sakukoService: SakukoService,
    protected sakukoCheckService: SakukoCheckService,
  ) {}

  @Get('/download-excel')
  async downloadExcel() {
    const file = reader.readFile('./data/data.xlsx')
    let student_data = [
      {
        Student: 'Nikhil',
        Age: 22,
        Branch: 'ISE',
        Marks: 70,
      },
      {
        Student: 'Amitha',
        Age: 21,
        Branch: 'EC',
        Marks: 80,
      },
    ]
    const ws = reader.utils.json_to_sheet(student_data)

    reader.utils.book_append_sheet(file, ws, 'All')

    // Writing to our file
    reader.writeFile(file, './data/data.xlsx')
    return true
  }

  @Get('/refresh-data')
  async handleProductNotUpdated(@Res() res: Response) {
    const productNotUpdated = await this.sakukoCheckService.getProductNotUpdated()
    return productNotUpdated
  }

  @Get('/get-product-have-chatx-not-exit')
  async getProductHaveChatxNotExit(@Res() res: Response) {
    const data = await this.sakukoCheckService.getChatxNotExitInMysql()
    return data
  }

  @Get('/delete-chatx-not-exit-in-mysql')
  async deleteProductHaveChatxNotExit(@Res() res: Response) {
    const data = await this.sakukoCheckService.deleteChatxNotExitInMysql()
    return data
  }

  @Get('/get-redundant-segment-chatx')
  async getRedundantSegmentInChatx(@Res() res: Response) {
    const data = await this.sakukoCheckService.getRedundantSegmentInChatX()
    return data
  }

  @Get('/delete-redundant-segment-chatx')
  async deleteRedundantSegmentInChatx(@Res() res: Response) {
    const data = await this.sakukoCheckService.deleteRedundantSegmentInChatX()
    return data
  }

  @Get('/check-by-category')
  async checkCountCategory(@QueryParam('search') search: string, @Res() res: Response) {
    const data = await this.sakukoCheckService.getProductWithSegmentNotExitByCategory(search)
    return data
  }

  @Get('/by-category')
  async getAllProductOfCategory(
    @QueryParams() queryParams: { name: string; url: string },
    @Res() res: Response,
  ) {
    const data = await this.sakukoService.scrapeDataInCategory(queryParams)
    return data
  }

  @Get()
  async getAllProduct(@Res() res: Response) {
    const data = await this.sakukoService.scrapeAllData()
    return data
  }
}
