import { SakukoEventService } from '@service/sakuko-event.service'
import { SakukoService } from '@service/sakuko.service'
import { Body, Get, JsonController, QueryParams, Res } from 'routing-controllers'
import { Service } from 'typedi'
import reader from 'xlsx'

@JsonController('/sakuko')
@Service()
export class UserController {
  constructor(
    protected sakukoService: SakukoService,
    protected sakukoEventService: SakukoEventService,
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

  //  QuaTrungThu2024
  @Get('/autumn-festival')
  async midAutumnFestivalGifts(@Res() res: Response) {
    const data = await this.sakukoEventService.getMidAutumnFestivalGifts()
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
