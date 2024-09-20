import { SakukoCheckService } from '@service/sakuko-check.service'
import { SakukoService } from '@service/sakuko.service'
import * as cron from 'node-cron'
import Container from 'typedi'

export const scheduleCronJobs = () => {
  const sakukoService = Container.get(SakukoService)
  const sakukoCheckService = Container.get(SakukoCheckService)

  cron.schedule(' 00 0 * * *', async () => {
    console.log('Running scrapeData at 0:00 everyday')
    await sakukoCheckService.deleteChatxNotExitInMysql()
  })

  cron.schedule(' 05 0 * * *', async () => {
    console.log('Running scrapeData at 0:00 everyday')
    await sakukoCheckService.deleteRedundantSegmentInChatX()
  })

  cron.schedule(' 10 00 * * *', async () => {
    console.log('Running scrapeData at 0:00 everyday')
    const category = {
      name: 'sieu-sale-sinh-nhat-mung-sakuko-len-13', //181
      url: 'https://sakukostore.com.vn/collections/sieu-sale-sinh-nhat-mung-sakuko-len-13',
    }
    await sakukoService.scrapeDataInCategory(category)
  })

  cron.schedule(' 30 00 * * *', async () => {
    console.log('Running scrapeData at 0:30 everyday')
    const category = {
      name: 'set-qua-trung-thu-2024', //16
      url: 'https://sakukostore.com.vn/collections/set-qua-trung-thu-2024',
    }
    await sakukoService.scrapeDataInCategory(category)
  })

  cron.schedule(' 40 00 * * *', async () => {
    console.log('Running scrapeData at 0:40 everyday')
    const category = {
      name: 'flash-sale-24h', //19
      url: 'https://sakukostore.com.vn/collections/flash-sale-24h',
    }
    await sakukoService.scrapeDataInCategory(category)
  })

  cron.schedule(' 50 00 * * *', async () => {
    console.log('Running scrapeData at 0:50 everyday')
    const category = {
      name: 'sua-cho-be', // 9
      url: 'https://sakukostore.com.vn/collections/sua-cho-be',
    }
    await sakukoService.scrapeDataInCategory(category)
  })

  cron.schedule(' 00 01 * * *', async () => {
    console.log('Running scrapeData at 1:00 everyday')
    const category = {
      name: 'me-be', //174
      url: 'https://sakukostore.com.vn/collections/me-be',
    }
    await sakukoService.scrapeDataInCategory(category)
  })

  cron.schedule(' 45 01 * * *', async () => {
    console.log('Running scrapeData everyday')
    const category = {
      name: 'cham-soc-sac-dep', //394
      url: 'https://sakukostore.com.vn/collections/cham-soc-sac-dep',
    }
    await sakukoService.scrapeDataInCategory(category)
  })

  cron.schedule(' 30 02 * * *', async () => {
    console.log('Running scrapeData at 0:00 everyday')
    const category = {
      name: 'cham-soc-suc-khoe', //224
      url: 'https://sakukostore.com.vn/collections/cham-soc-suc-khoe',
    }
    await sakukoService.scrapeDataInCategory(category)
  })

  cron.schedule(' 30 03 * * *', async () => {
    console.log('Running scrapeData at 0:00 everyday')
    const category = {
      name: 'thuc-pham', // 539
      url: 'https://sakukostore.com.vn/collections/thuc-pham',
    }
    await sakukoService.scrapeDataInCategory(category)
  })

  cron.schedule(' 30 4 * * *', async () => {
    console.log('Running scrapeData at 4:30 everyday')
    const category = {
      name: 'nha-cua-doi-song', // 516
      url: 'https://sakukostore.com.vn/collections/nha-cua-doi-song',
    }
    await sakukoService.scrapeDataInCategory(category)
  })

  cron.schedule(' 30 5 * * *', async () => {
    console.log('Running scrapeData at 5:30 everyday')
    const category = {
      name: 'hang-order', // 546
      url: 'https://sakukostore.com.vn/collections/hang-order',
    }
    await sakukoService.scrapeDataInCategory(category)
  })
}
