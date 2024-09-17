import { SakukoService } from '@service/sakuko.service'
import * as cron from 'node-cron'
import Container from 'typedi'

export const scheduleCronJobs = () => {
  const sakukoService = Container.get(SakukoService)

  cron.schedule('15 4 * * *', async () => {
    console.log('Running scrapeData at 5:15 everyday')
    const category = {
      name: 'nha-cua-doi-song',
      url: 'https://sakukostore.com.vn/collections/nha-cua-doi-song',
    }
    await sakukoService.scrapeDataInCategory(category)
  })

  cron.schedule('15 22 * * *', async () => {
    console.log('Running scrapeData at 5:15 everyday')
    const category = {
      name: 'cham-soc-sac-dep',
      url: 'https://sakukostore.com.vn/collections/cham-soc-sac-dep',
    }
    await sakukoService.scrapeDataInCategory(category)
  })
}
