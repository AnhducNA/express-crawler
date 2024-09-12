import { Service } from 'typedi'
import puppeteer, { Page } from 'puppeteer'
import fs from 'fs'

@Service()
export class SakukoService {
  async scrapeData() {
    const categories = [
      {
        name: 'sua-cho-be',
        url: 'https://sakukostore.com.vn/collections/sua-cho-be',
      },
      {
        name: 'me-be',
        url: 'https://sakukostore.com.vn/collections/me-be',
      },
      // {
      //   name: 'cham-soc-sac-dep',
      //   url: 'https://sakukostore.com.vn/collections/cham-soc-sac-dep',
      // },
      // {
      //   name: 'cham-soc-suc-khoe',
      //   url: 'https://sakukostore.com.vn/collections/cham-soc-suc-khoe',
      // },
      // {
      //   name: 'thuc-pham',
      //   url: 'https://sakukostore.com.vn/collections/thuc-pham',
      // },
      // {
      //   name: 'nha-cua-doi-song',
      //   url: 'https://sakukostore.com.vn/collections/nha-cua-doi-song',
      // },
    ]

    const productData = []
    for (const category of categories) {
      const listProduct = await this.scrapeListProductPage(category.url)
      productData.push(...listProduct)
      this.exportJsonFile(listProduct, category.name)
      console.log(`Total scrapedData of ${category.name}: `, listProduct.length)
    }
    console.log('Total scrapedData: ', productData.length)
    console.log('================Completed===================')

    this.exportJsonFile(productData, 'all')
    return productData
  }

  async scrapeListProductPage(urlListProduct: string) {
    const browser = await puppeteer.launch()
    console.log('Opening the browser......')
    const page = await browser.newPage()
    await page.goto(urlListProduct, {
      waitUntil: 'networkidle0',
    })
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
      return scrapedData
    }

    return await scrapeCurrentPage()
  }

  async pageDetailPromise(link: string) {
    try {
      const browser = await puppeteer.launch({ headless: false })
      // Open a new page / tab in the browser.
      console.time('Access browser detail product: ' + link)
      const page = await browser.newPage()
      // Navigate to the URL
      await page.goto(link, {
        waitUntil: 'domcontentloaded',
        timeout: 50000,
      })
      console.timeEnd('End time loading detail product')
      const dataObject = await this.getObjectDetailFromScript(page)
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
      }
      return
    } catch (error) {
      console.log(error)
      return
    }
  }
  async getObjectDetailFromScript(page: Page) {
    return await page.evaluate(() => {
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
    })
  }

  exportJsonFile(scrapedData: object[], nameFile: string) {
    fs.writeFile(`data/${nameFile}.json`, JSON.stringify(scrapedData), 'utf8', function (err) {
      if (err) {
        return console.log(err)
      }
      console.log(
        `The data has been scraped and saved successfully! View it at ./data/${nameFile}.json`,
      )
    })
  }
}
