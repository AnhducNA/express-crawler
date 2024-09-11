import { SakukoEventService } from '@service/sakuko-event.service'
import { SakukoService } from '@service/sakuko.service'
import { Get, JsonController, Res } from 'routing-controllers'
import { Service } from 'typedi'

@JsonController('/sakuko')
@Service()
export class UserController {
  private readonly sakukoService = new SakukoService()
  private readonly sakukoEventService = new SakukoEventService()

  //  QuaTrungThu2024
  @Get('/autumn-festival')
  async midAutumnFestivalGifts(@Res() res: Response) {
    const data = await this.sakukoEventService.getMidAutumnFestivalGifts()
    return data
  }

  @Get()
  async getAllProduct(@Res() res: Response) {
    const data = await this.sakukoService.scrapeData()
    return data
  }
}
