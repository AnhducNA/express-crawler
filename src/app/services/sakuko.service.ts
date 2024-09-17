import { Service } from 'typedi'
import puppeteer, { Browser, Page } from 'puppeteer'
import fs from 'fs'
import reader from 'xlsx'
import { ChatXService } from './chatx.service'
import { IProduct } from '@interfaces/sakuko.product.interface'

@Service()
export class SakukoService {
  constructor(protected chatxService: ChatXService) {}

  async scrapeAllData() {
    const categories = [
      // {
      //   name: 'sieu-sale-sinh-nhat-mung-sakuko-len-13', //181
      //   url: 'https://sakukostore.com.vn/collections/sieu-sale-sinh-nhat-mung-sakuko-len-13',
      // },
      // {
      //   name: 'set-qua-trung-thu-2024', //16
      //   url: 'https://sakukostore.com.vn/collections/set-qua-trung-thu-2024',
      // },
      // {
      //   name: 'flash-sale-24h', //19
      //   url: 'https://sakukostore.com.vn/collections/flash-sale-24h',
      // },
      {
        name: 'sua-cho-be', // 9
        url: 'https://sakukostore.com.vn/collections/sua-cho-be',
      },
      // {
      //   name: 'me-be', //174
      //   url: 'https://sakukostore.com.vn/collections/me-be',
      // },
      // {
      //   name: 'cham-soc-sac-dep', //394
      //   url: 'https://sakukostore.com.vn/collections/cham-soc-sac-dep',
      // },
      // {
      //   name: 'cham-soc-suc-khoe', //224
      //   url: 'https://sakukostore.com.vn/collections/cham-soc-suc-khoe',
      // },
      // {
      //   name: 'thuc-pham', // 539
      //   url: 'https://sakukostore.com.vn/collections/thuc-pham',
      // },
      // {
      //   name: 'nha-cua-doi-song', // 516
      //   url: 'https://sakukostore.com.vn/collections/nha-cua-doi-song',
      // },
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
    const productData = await this.scrapeListProductPage(category.url)
    console.log(`Total scrapedData of ${category.name}: `, productData.length)
    return productData
  }

  async scrapeListProductPage(categoryLink: string) {
    const browser = await puppeteer.launch()
    console.log(`Opening the browser ${categoryLink} ......`)
    const page: Page = await browser.newPage()
    try {
      await page.goto(categoryLink, {
        waitUntil: 'networkidle0',
      })
    } catch (error) {
      console.error('Error opening category page:', error)
      return []
    }

    const paginationLinks = await this.getPaginationLinks(page, categoryLink)
    await page.close()
    await browser.close()
    const totalDataOfCategory = []
    for (const paginationLink of paginationLinks) {
      const scrapeCurrentPageData = await this.scrapeCurrentPage(paginationLink)
      totalDataOfCategory.push(...scrapeCurrentPageData)
    }
    return totalDataOfCategory
  }
  async getPaginationLinks(page: Page, categoryLink: string): Promise<string[]> {
    let validMaxPage = 1
    try {
      validMaxPage = await page.$$eval('#pagination li a', (elements) => {
        const validPages = elements
          .map((e) => {
            return +e.textContent
          })
          .filter((pageNum: number) => {
            return pageNum > 0 && pageNum !== null
          })
        if (!validPages || validPages.length === 0) {
          return 1
        }
        return Math.max(...validPages)
      })
    } catch (error) {
      validMaxPage = 1
    }
    const paginationLinks: string[] = []
    for (let page = 1; page <= validMaxPage; page++) {
      paginationLinks.push(categoryLink + '?page=' + page)
    }
    return paginationLinks
  }

  async scrapeCurrentPage(paginationLink: string) {
    const browser: Browser = await puppeteer.launch()
    console.log(`Accessing the page: ${paginationLink}`)
    const page: Page = await browser.newPage()
    try {
      await page.goto(paginationLink, {
        waitUntil: 'networkidle0',
      })
    } catch (error) {
      console.error('Error opening category page:', error)
      return []
    }
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
    } catch (error) {
      urls = []
    }

    const currentPageTotalData: { id: number; title: string; type: string }[] = []
    for (const link of urls) {
      try {
        console.log(`Accessing the page: ${paginationLink}`)
        console.log(`Access browser detail product: ` + link)
        const detailData = await this.pageDetailPromise(link)
        if (detailData.id) {
          currentPageTotalData.push({
            id: detailData.id,
            title: detailData.title,
            type: detailData.type,
          })
          await this.chatxService.createOrUpdateSegmentsWithDatabaseToProduct(detailData)
          console.log(`Detail product: `, {
            id: detailData.id,
            title: detailData.title,
          })
        }
      } catch (error) {
        console.error(`Error accessing detail product at ${link}:`, error)
      }
    }
    await page.close()
    await browser.close()
    return currentPageTotalData
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
      await page.close()
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
