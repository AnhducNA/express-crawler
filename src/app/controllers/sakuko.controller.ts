import { SakukoService } from '@service/sakuko.service'
import { Get, JsonController, Res } from 'routing-controllers'
import { Service } from 'typedi'

@JsonController('/sakuko')
@Service()
export class UserController {
  private readonly sakukoService = new SakukoService()

  @Get()
  //  QuaTrungThu2024
  async midAutumnFestivalGifts(@Res() res: Response) {
    const data = await this.sakukoService.getMidAutumnFestivalGifts()
    return data
  }
}
