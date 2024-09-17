import { Service } from 'typedi'
import puppeteer, { Page } from 'puppeteer'
import fs from 'fs'
import reader from 'xlsx'
import { ChatXService } from './chatx.service'
import { IProduct } from '@interfaces/sakuko.product.interface'

@Service()
export class SakukoService {
  constructor(protected chatxService: ChatXService) {}

  async scrapeAllData() {
    const categories = [
      {
        name: 'sieu-sale-sinh-nhat-mung-sakuko-len-13', //181 
        url: 'https://sakukostore.com.vn/collections/sieu-sale-sinh-nhat-mung-sakuko-len-13',
      },
      {
        name: 'set-qua-trung-thu-2024', //16
        url: 'https://sakukostore.com.vn/collections/set-qua-trung-thu-2024',
      },
      {
        name: 'flash-sale-24h', //19
        url: 'https://sakukostore.com.vn/collections/flash-sale-24h',
      },
      {
        name: 'sua-cho-be', // 9
        url: 'https://sakukostore.com.vn/collections/sua-cho-be',
      },
      {
        name: 'me-be', //174
        url: 'https://sakukostore.com.vn/collections/me-be',
      },
      {
        name: 'cham-soc-sac-dep', //394
        url: 'https://sakukostore.com.vn/collections/cham-soc-sac-dep',
      },
      {
        name: 'cham-soc-suc-khoe', //224
        url: 'https://sakukostore.com.vn/collections/cham-soc-suc-khoe',
      },
      {
        name: 'thuc-pham', // 539
        url: 'https://sakukostore.com.vn/collections/thuc-pham',
      },
      {
        name: 'nha-cua-doi-song', // 516
        url: 'https://sakukostore.com.vn/collections/nha-cua-doi-song',
      },
    ]

    const productData = []
    for (const category of categories) {
      const listProduct = await this.scrapeListProductPage(category.url)
      productData.push(...listProduct)
      console.log(`Total scrapedData of ${category.name}: `, listProduct.length)
    }
    console.log('Total scrapedData: ', productData.length)
    console.log('================Completed===================')
    return productData
  }
  async scrapeDataInCategory(category: { name: string; url: string }) {
    const productData = []
    const listProduct = await this.scrapeListProductPage(category.url)
    productData.push(...listProduct)
    console.log(`Total scrapedData of ${category.name}: `, listProduct.length)
    return productData
  }

  async scrapeListProductPage(urlListProduct: string) {
    const browser = await puppeteer.launch()
    console.log('Opening the browser......')
    const page = await browser.newPage()
    try {
      await page.goto(urlListProduct, {
        waitUntil: 'networkidle0',
      })
    } catch (error) {
      console.error('Error opening product list page:', error)
      return []
    }

    const scrapedData = []
    let scrapeCurrentNumPage = 1
    const scrapeCurrentPage = async () => {
      console.log(`Access page ${scrapeCurrentNumPage} of ${urlListProduct}`)
      let urls = []
      try {
        await page.waitForSelector('.wraplist-collection')
        urls = await page.$$eval('.product-loop', (elements) => {
          // Extract the links from the data
          const links = elements.map(
            (el) =>
              'https://sakukostore.com.vn' +
              el.querySelector('.proloop-detail > h3 > a.quickview-product').getAttribute('href'),
          )
          return links
        })
      } catch (error) {}

      // try {
      //   console.log(`Access browser detail product: ` + urls[1])
      //   const currentPageData = await this.pageDetailPromise(urls[1])
      //   if (currentPageData.id) {
      //     scrapedData.push({
      //       id: currentPageData.id,
      //       title: currentPageData.title,
      //       type: currentPageData.type,
      //     })
      //     await this.chatxService.createOrUpdateSegmentsWithDatabaseToProduct(currentPageData)
      //     console.log(`Detail product: `, {
      //       id: currentPageData.id,
      //       title: currentPageData.title,
      //     })
      //   }
      // } catch (error) {
      //   console.error(`Error accessing detail product at ${urls[1]}:`, error)
      // }

      for (const link of urls) {
        try {
          console.log(`Access page ${scrapeCurrentNumPage} of ${urlListProduct}`)
          console.log(`Access browser detail product: ` + link)
          const currentPageData = await this.pageDetailPromise(link)
          if (currentPageData.id) {
            scrapedData.push({
              id: currentPageData.id,
              title: currentPageData.title,
              type: currentPageData.type,
            })
            await this.chatxService.createOrUpdateSegmentsWithDatabaseToProduct(currentPageData)
            console.log(`Detail product: `, {
              id: currentPageData.id,
              title: currentPageData.title,
            })
          }
        } catch (error) {
          console.error(`Error accessing detail product at ${link}:`, error)
        }
      }

      let nextButtonExist = false
      try {
        await page.$eval('#pagination li a i.fa-angle-double-right', () => {})
        nextButtonExist = true
      } catch (err) {
        nextButtonExist = false
      }

      if (nextButtonExist) {
        scrapeCurrentNumPage++
        await page.click('#pagination li a i.fa-angle-double-right')
        return await scrapeCurrentPage()
      }
      await page.close()
      await browser.close()
      return scrapedData
    }
    return await scrapeCurrentPage()
  }

  async pageDetailPromise(link: string): Promise<IProduct> {
    try {
      const browser = await puppeteer.launch({ headless: false })
      // Open a new page / tab in the browser.
      const page = await browser.newPage()
      // Navigate to the URL
      await page.goto(link, {
        waitUntil: 'domcontentloaded',
        timeout: 0,
      })
      const dataObject = await this.getObjectDetailFromScript(page)
      await browser.close()

      // Handle the case if no product data was found
      if (dataObject) {
        const percentDiscount = dataObject.compare_at_price
          ? ((Number(dataObject.compare_at_price) - Number(dataObject.price)) /
              Number(dataObject.compare_at_price)) *
            100
          : 0
        return {
          id: dataObject.id,
          url: link,
          title: dataObject.title,
          type: dataObject.type,
          inventoryQuantity: dataObject.variants[0].inventory_quantity,
          inventoryPolicy: dataObject.variants[0].inventory_policy,
          sku: dataObject.variants[0].sku,
          barcode: dataObject.variants[0].barcode,
          featuredImage: dataObject.featured_image,
          images: Array(dataObject.images).toString(),
          trademark: dataObject.vendor,
          shortDescription: dataObject.metadescription,
          price: dataObject.price,
          originalPrice: dataObject.compare_at_price,
          percentDiscount: percentDiscount + '%',
          description: dataObject.description,
        }
      }
      return
    } catch (error) {
      console.log(error)
      return null
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

  exportJsonFile(scrapedData: object[], nameFile?: string) {
    nameFile = nameFile ? nameFile : 'product'
    try {
      fs.writeFile(`data/${nameFile}.json`, JSON.stringify(scrapedData), 'utf8', function (err) {
        if (err) {
          return console.log(err)
        }
        console.log(
          `The data has been scraped and saved successfully! View it at ./data/${nameFile}.json`,
        )
      })
    } catch (error) {
      console.log(error)
    }
  }

  async exportExcelFile(dataArray: object[], nameSheet?: string) {
    try {
      nameSheet = nameSheet ? nameSheet : 'all'
      const file = reader.readFile('./data/data.xlsx')
      const ws = reader.utils.json_to_sheet(dataArray)
      reader.utils.book_append_sheet(file, ws, nameSheet + new Date().getTime())
      // Writing to our file
      reader.writeFile(file, './data/data.xlsx')
    } catch (error) {
      console.log(error)
    }
  }
}
