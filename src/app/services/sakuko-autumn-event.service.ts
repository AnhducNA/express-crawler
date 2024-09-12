import { Service } from 'typedi'
import puppeteer, { Browser } from 'puppeteer'
import fs from 'fs'

@Service()
export class SakukoAutumnEventService {
  async getMidAutumnFestivalGifts() {
    const browser = await puppeteer.launch()
    console.log('Opening the browser......')
    const page = await browser.newPage()
    await page.goto('https://sakukostore.com.vn/collections/set-qua-trung-thu-2024')

    const scrapedData = []

    const scrapeCurrentPage = async () => {
      await page.waitForSelector('.wraplist-collection')
      const urls = await page.$$eval('.product-loop', (elements) => {
        // Extract the links from the data
        const links = elements.map(
          (el) => el.querySelector('.proloop-detail > h3 > a.quickview-product').href,
        )
        return links
      })

      for (const link of urls) {
        const currentPageData = await this.pageDetailPromise(link)
        scrapedData.push(currentPageData)
        console.log('currentPageData: ', currentPageData)
      }

      let nextButtonExist = false
      try {
        await page.$eval('#pagination li a i.fa-angle-double-right', () => {})
        nextButtonExist = true
      } catch (err) {
        nextButtonExist = false
      }

      if (!!nextButtonExist) {
        await page.click('#pagination li a i.fa-angle-double-right')
        return await scrapeCurrentPage()
      }
      await page.close()
      console.log('scrapeCurrentPageData: ', scrapedData, scrapedData.length)
      await this.exportJsonFile(scrapedData)

      return { status: true, data: scrapedData }
    }

    return await scrapeCurrentPage()
  }

  async pageDetailPromise(link: string) {
    const browser = await puppeteer.launch()
    console.log('Go to: ' + link)
    const newPage = await browser.newPage()
    await newPage.goto(link, { waitUntil: 'networkidle2' })

    const dataObj = {
      productId: '',
      productUrl: link,
      title: '',
      inventoryStatus: '',
      imageUrl: '',
      trademark: '',
      shortDescription: '',
      price: '',
      promotionalPrice: '',
      percentDiscount: '',
      description: '',
    }
    try {
      // Evaluate the script tag content to extract product_collect object
      dataObj.productId = await newPage.$eval('#pro_sku > strong', (text) =>
        text.textContent.trim(),
      )
      dataObj.title = await newPage.$eval('.product-heading > h1', (text) => text.textContent)
      dataObj.inventoryStatus = await newPage.$eval(
        '.pro-soldold > strong',
        (text) => text.textContent,
      )
      dataObj.imageUrl = await newPage.$eval('.product-gallery img', (img) => img.src)
      dataObj.trademark = await newPage.$eval('.pro-vendor strong a', (a) => a.textContent)
      dataObj.price = await newPage.$eval('.product-price > del', (del) => del.textContent)
      dataObj.promotionalPrice = await newPage.$eval('span.pro-price', (span) => span.textContent)
      dataObj.percentDiscount = await newPage.$eval('span.pro-percent', (span) => span.textContent)
      dataObj.shortDescription = await newPage.$eval('.pd_short_desc', (div) =>
        div.textContent.trim(),
      )
      dataObj.description = await newPage.$$eval('.description-productdetail', (els) => {
        return els[0].textContent.trim()
      })
    } catch (error) {}

    await newPage.close()

    return dataObj
  }

  async exportJsonFile(scrapedData: object[]) {
    fs.writeFile('data.json', JSON.stringify(scrapedData), 'utf8', function (err) {
      if (err) {
        return console.log(err)
      }
      console.log("The data has been scraped and saved successfully! View it at './data.json'")
    })
  }
}
