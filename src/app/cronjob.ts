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

  // cron.schedule(' 00 00 * * *', async () => {
  //   console.log('Running scrapeData  everyday')
  //   await sakukoService.scrapeAllData()
  //   console.log(
  //     '============================= Completed scrapeAllData at ' +
  //       new Date().toLocaleString('vi-VN', {
  //         dateStyle: 'short',
  //         timeStyle: 'medium',
  //         timeZone: 'Asia/Ho_Chi_Minh',
  //       }) +
  //       '============================',
  //   )
  // })

  cron.schedule(' 00 00 * * *', async () => {
    console.log('Running scrapeDataInCategory everyday')
    const category = {
      name: 'all', // 9
      url: 'https://sakukostore.com.vn/collections/all',
      startPage: 1,
      endPage: 50,
    }
    await sakukoService.scrapeDataInCategory(category)
    console.log(
      '============================= Completed scrapeDataInCategory at ' +
        new Date().toLocaleString('vi-VN', {
          dateStyle: 'short',
          timeStyle: 'medium',
          timeZone: 'Asia/Ho_Chi_Minh',
        }) +
        '============================',
    )
  })

  cron.schedule(' 00 01 * * *', async () => {
    console.log('Running scrapeDataInCategory everyday')
    const category = {
      name: 'all', // 9
      url: 'https://sakukostore.com.vn/collections/all',
      startPage: 51,
      endPage: 100,
    }
    await sakukoService.scrapeDataInCategory(category)
    console.log(
      '============================= Completed scrapeDataInCategory at ' +
        new Date().toLocaleString('vi-VN', {
          dateStyle: 'short',
          timeStyle: 'medium',
          timeZone: 'Asia/Ho_Chi_Minh',
        }) +
        '============================',
    )
  })

  cron.schedule(' 00 02 * * *', async () => {
    console.log('Running scrapeDataInCategory everyday')
    const category = {
      name: 'all', // 9
      url: 'https://sakukostore.com.vn/collections/all',
      startPage: 101,
      endPage: 150,
    }
    await sakukoService.scrapeDataInCategory(category)
    console.log(
      '============================= Completed scrapeDataInCategory at ' +
        new Date().toLocaleString('vi-VN', {
          dateStyle: 'short',
          timeStyle: 'medium',
          timeZone: 'Asia/Ho_Chi_Minh',
        }) +
        '============================',
    )
  })

  cron.schedule(' 00 03 * * *', async () => {
    console.log('Running scrapeDataInCategory everyday')
    const category = {
      name: 'all', // 9
      url: 'https://sakukostore.com.vn/collections/all',
      startPage: 151,
      endPage: 200,
    }
    await sakukoService.scrapeDataInCategory(category)
    console.log(
      '============================= Completed scrapeDataInCategory at ' +
        new Date().toLocaleString('vi-VN', {
          dateStyle: 'short',
          timeStyle: 'medium',
          timeZone: 'Asia/Ho_Chi_Minh',
        }) +
        '============================',
    )
  })

  cron.schedule(' 00 04 * * *', async () => {
    console.log('Running scrapeDataInCategory everyday')
    const category = {
      name: 'all', // 9
      url: 'https://sakukostore.com.vn/collections/all',
      startPage: 201,
      endPage: 250,
    }
    await sakukoService.scrapeDataInCategory(category)
    console.log(
      '============================= Completed scrapeDataInCategory at ' +
        new Date().toLocaleString('vi-VN', {
          dateStyle: 'short',
          timeStyle: 'medium',
          timeZone: 'Asia/Ho_Chi_Minh',
        }) +
        '============================',
    )
  })

  cron.schedule(' 00 05 * * *', async () => {
    console.log('Running scrapeDataInCategory everyday')
    const category = {
      name: 'all', // 9
      url: 'https://sakukostore.com.vn/collections/all',
      startPage: 251,
      endPage: 282,
    }
    await sakukoService.scrapeDataInCategory(category)
    console.log(
      '============================= Completed scrapeDataInCategory at ' +
        new Date().toLocaleString('vi-VN', {
          dateStyle: 'short',
          timeStyle: 'medium',
          timeZone: 'Asia/Ho_Chi_Minh',
        }) +
        '============================',
    )
  })

  // cron.schedule(' 30 5 * * *', async () => {
  //   console.log('Running scrapeData at 5:30 everyday')
  //   const category = {
  //     name: 'hang-order', // 546
  //     url: 'https://sakukostore.com.vn/collections/hang-order',
  //   }
  //   await sakukoService.scrapeDataInCategory(category)
  // })

  cron.schedule(' 00 7 * * *', async () => {
    console.log(
      '----------------------------------- Start refresh ----------------------------------------',
    )
    console.log(
      '============================= Start refresh at ' +
        new Date().toLocaleString('vi-VN', {
          dateStyle: 'short',
          timeStyle: 'medium',
          timeZone: 'Asia/Ho_Chi_Minh',
        }) +
        '============================',
    )
    await sakukoCheckService.handleProductNotUpdated()
    console.log(
      '============================= Completed refresh at ' +
        new Date().toLocaleString('vi-VN', {
          dateStyle: 'short',
          timeStyle: 'medium',
          timeZone: 'Asia/Ho_Chi_Minh',
        }) +
        '============================',
    )
  })
}
