import { Service } from 'typedi'
import puppeteer from 'puppeteer'
import fs from 'fs'

@Service()
export class SakukoService {
  async scrapeData() {
    const categoryUrls = [
      'https://sakukostore.com.vn/collections/sua-cho-be',
      'https://sakukostore.com.vn/collections/me-be',
      'https://sakukostore.com.vn/collections/cham-soc-sac-dep',
      'https://sakukostore.com.vn/collections/cham-soc-suc-khoe',
      'https://sakukostore.com.vn/collections/thuc-pham',
      'https://sakukostore.com.vn/collections/nha-cua-doi-song',
    ]
    const prodcutData = []
    for (const categoryUrl of categoryUrls) {
      prodcutData.push(await this.scrapeListProductPage(categoryUrl))
    }
    console.log('Total scrape Data: ', prodcutData.length)
    this.exportJsonFile(prodcutData)
    return prodcutData
  }

  async scrapeListProductPage(urlListProduct: string) {
    const browser = await puppeteer.launch()
    console.log('Opening the browser......')
    const page = await browser.newPage()
    await page.goto(urlListProduct)
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
      // await this.exportJsonFile(scrapedData)

      return { status: true, data: scrapedData }
    }

    return await scrapeCurrentPage()
  }

  async pageDetailPromise(link: string) {
    const browser = await puppeteer.launch({ headless: false })
    // Open a new page / tab in the browser.
    console.log('Access browser detail product: ' + link)
    const page = await browser.newPage()
    // Navigate to the URL
    await page.goto(link)

    const dataObject = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script'))

      let productCollectScript: string | null = null

      // Find the script tag containing `window.product_collect`
      scripts.forEach((script) => {
        if (script.innerText.includes('window.product_collect')) {
          productCollectScript = script.innerText
        }
      })
      if (productCollectScript) {
        // Extract the product_collect data using a regular expression
        const match = productCollectScript.match(/window\.product_collect\s*=\s*(\{.*?\});/)

        if (match && match[1]) {
          return JSON.parse(match[1])
        }
      }
      return null // Return null if not found
    })
    await browser.close()

    // Handle the case if no product data was found
    if (dataObject) {
      return {
        productId: dataObject.id,
        productUrl: link,
        title: dataObject.title,
        type: dataObject.type,
        inventoryQuantity: dataObject.variants[0].inventory_quantity,
        featuredImage: dataObject.featured_image,
        images: dataObject.images,
        trademark: dataObject.vendor,
        shortDescription: dataObject.metadescription,
        price: dataObject.price,
        originalPrice: dataObject.compare_at_price,
        percentDiscount:
          ((Number(dataObject.compare_at_price) - Number(dataObject.price)) /
            Number(dataObject.compare_at_price)) *
            100 +
          '%',
        description: dataObject.description,
      }
    } else {
      throw new Error('Product data not found.')
    }
  }

  exportJsonFile(scrapedData: object[]) {
    fs.writeFile('data/all.json', JSON.stringify(scrapedData), 'utf8', function (err) {
      if (err) {
        return console.log(err)
      }
      console.log(
        "The data has been scraped and saved successfully! View it at './data/set-qua-trung-thu-2024.json'",
      )
    })
  }
}