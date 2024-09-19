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
    protected sakukoEventService: SakukoCheckService,
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

  @Get('/delete-chatx-not-exit-in-mysql')
  async deleteChatxNotExitInMysql(@Res() res: Response) {
    const data = await this.sakukoEventService.deleteChatxNotExitInMysql()
    return data
  }

  @Get('/check-by-category')
  async checkCountCategory(@QueryParam('search') search: string, @Res() res: Response) {
    const data = await this.sakukoEventService.checkChatxNotExitInMysql(search)
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
