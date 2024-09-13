import { SakukoService } from '@service/sakuko.service'
import * as cron from 'node-cron'
import Container from 'typedi';

export const scheduleCronJobs = () => {

  const sakukoService = Container.get(SakukoService);


  cron.schedule('15 12,22 * * *', async () => {
    console.log('Running scrapeData at 12:15 and 22:15 everyday')
    await sakukoService.scrapeData()
  })

  console.log('Cron job scheduled to run at 12:15 and 22:15 everyday')
}
