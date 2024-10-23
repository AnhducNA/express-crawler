import { SakukoCheckService } from '@service/sakuko-check.service'
import { SakukoService } from '@service/sakuko.service'
import * as cron from 'node-cron'
import Container from 'typedi'

export const scheduleCronJobs = () => {
  const sakukoService = Container.get(SakukoService)
  const sakukoCheckService = Container.get(SakukoCheckService)

  cron.schedule(' 50 23 * * *', async () => {
    console.log('Running scrapeData at 0:00 everyday')
    await sakukoCheckService.deleteChatxNotExitInMysql()
  })

  cron.schedule(' 55 23 * * *', async () => {
    console.log('Running scrapeData at 0:00 everyday')
    await sakukoCheckService.deleteRedundantSegmentInChatX()
  })

  cron.schedule(' 00 00 * * *', async () => {
    console.log('Running scrapeData at 0:00 everyday')
    await sakukoService.scrapeAllData()
    console.log(
      '============================= Completed at ' +
        new Date().toLocaleString('vi-VN', {
          dateStyle: 'short',
          timeStyle: 'medium',
          timeZone: 'Asia/Ho_Chi_Minh',
        }) +
        '============================',
    )
  })

  // cron.schedule(' 50 00 * * *', async () => {
  //   console.log('Running scrapeData at 0:50 everyday')
  //   const category = {
  //     name: 'sua-cho-be', // 9
  //     url: 'https://sakukostore.com.vn/collections/sua-cho-be',
  //   }
  //   await sakukoService.scrapeDataInCategory(category)
  // })

  // cron.schedule(' 00 01 * * *', async () => {
  //   console.log('Running scrapeData at 1:00 everyday')
  //   const category = {
  //     name: 'me-be', //174
  //     url: 'https://sakukostore.com.vn/collections/me-be',
  //   }
  //   await sakukoService.scrapeDataInCategory(category)
  // })

  // cron.schedule(' 45 01 * * *', async () => {
  //   console.log('Running scrapeData everyday')
  //   const category = {
  //     name: 'cham-soc-sac-dep', //394
  //     url: 'https://sakukostore.com.vn/collections/cham-soc-sac-dep',
  //   }
  //   await sakukoService.scrapeDataInCategory(category)
  // })

  // cron.schedule(' 30 02 * * *', async () => {
  //   console.log('Running scrapeData at 0:00 everyday')
  //   const category = {
  //     name: 'cham-soc-suc-khoe', //224
  //     url: 'https://sakukostore.com.vn/collections/cham-soc-suc-khoe',
  //   }
  //   await sakukoService.scrapeDataInCategory(category)
  // })

  // cron.schedule(' 30 03 * * *', async () => {
  //   console.log('Running scrapeData at 0:00 everyday')
  //   const category = {
  //     name: 'thuc-pham', // 539
  //     url: 'https://sakukostore.com.vn/collections/thuc-pham',
  //   }
  //   await sakukoService.scrapeDataInCategory(category)
  // })

  // cron.schedule(' 30 4 * * *', async () => {
  //   console.log('Running scrapeData at 4:30 everyday')
  //   const category = {
  //     name: 'nha-cua-doi-song', // 516
  //     url: 'https://sakukostore.com.vn/collections/nha-cua-doi-song',
  //   }
  //   await sakukoService.scrapeDataInCategory(category)
  // })

  // cron.schedule(' 30 5 * * *', async () => {
  //   console.log('Running scrapeData at 5:30 everyday')
  //   const category = {
  //     name: 'hang-order', // 546
  //     url: 'https://sakukostore.com.vn/collections/hang-order',
  //   }
  //   await sakukoService.scrapeDataInCategory(category)
  // })

  cron.schedule(' 00 5 * * *', async () => {
    await sakukoCheckService.handleProductNotUpdated()
    console.log(
      '============================= Completed at ' +
        new Date().toLocaleString('vi-VN', {
          dateStyle: 'short',
          timeStyle: 'medium',
          timeZone: 'Asia/Ho_Chi_Minh',
        }) +
        '============================',
    )
  })
}
