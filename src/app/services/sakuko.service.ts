import { Service } from 'typedi'
import puppeteer, { Browser, Page } from 'puppeteer'
import fs from 'fs'
import reader from 'xlsx'
import { ChatXService } from './chatx.service'
import { IProduct } from '@interfaces/sakuko.product.interface'
import productCategoryData from 'src/data/product-category.data'
import extractTextFromHTML from '@common/functions'
import { BadRequestError } from 'routing-controllers'

@Service()
export class SakukoService {
  constructor(protected chatxService: ChatXService) {}

  async scrapeAllData() {
    const categories: { name: string; url: string; startPage?: number }[] = productCategoryData
    const productData = []
    for (const category of categories) {
      const listProduct = await this.scrapeListProductPage(category)
      productData.push(...listProduct)
      console.log(`Total scrapedData of ${category.name}: `, listProduct.length)
    }
    console.log('Total scrapedData: ', productData.length)
    console.log(
      '================Completed at ' +
        new Date().toLocaleString('vi-VN', {
          dateStyle: 'short',
          timeStyle: 'medium',
          timeZone: 'Asia/Ho_Chi_Minh',
        }) +
        '===========================',
    )
    return productData
  }

  async scrapeDataInCategory(category: { name: string; url: string; startPage?: number }) {
    const productData = await this.scrapeListProductPage(category)
    console.log(`Total scrapedData of ${category.name}: `, productData.length)
    return productData
  }

  async scrapeListProductPage(category: { name: string; url: string; startPage?: number }) {
    const browser = await puppeteer.launch({
      ignoreHTTPSErrors: true, // Ignore SSL certificate errors
      headless: false,
    } as any)
    console.log(`Opening the browser ${category.url} ......`)
    const page: Page = await browser.newPage()
    try {
      await page.goto(category.url, {
        waitUntil: 'domcontentloaded',
      })
    } catch (error) {
      console.error('Error opening category browser:', error)
      return []
    }
    const paginationLinks = await this.getPaginationLinks(page, category.url, category.startPage)
    console.log('paginationLinks: ', paginationLinks)

    await page.close()
    await browser.close()
    const totalDataOfCategory = []
    for (const paginationLink of paginationLinks) {
      const scrapeCurrentPageData = await this.scrapePaginationPage(paginationLink, category.name)
      if (!scrapeCurrentPageData || scrapeCurrentPageData.length === 0) {
        throw new BadRequestError()
      }
      totalDataOfCategory.push(...scrapeCurrentPageData)
    }
    return totalDataOfCategory
  }

  async getPaginationLinks(
    page: Page,
    categoryLink: string,
    startPage?: number,
  ): Promise<string[]> {
    let validMaxPage = 1
    startPage = startPage ? startPage : 1
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
    for (let page = startPage; page <= validMaxPage; page++) {
      paginationLinks.push(categoryLink + '?page=' + page)
    }
    return paginationLinks
  }

  async scrapePaginationPage(paginationLink: string, categoryType: string) {
    const browser: Browser = await puppeteer.launch()
    console.log(`Accessing the page: ${paginationLink}`)
    const page: Page = await browser.newPage()
    try {
      await page.goto(paginationLink, {
        waitUntil: 'networkidle2',
        timeout: 30000,
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
    // urls = []
    for (const link of urls) {
      console.log(`Accessing the page: ${paginationLink}`)
      console.log(`Access browser detail product: ` + link)
      let detailData: IProduct
      let numRunsLoadErrorPage = 0
      LOOP_ERROR_PAGE: do {
        try {
          detailData = await this.pageDetailPromise(link)
          break LOOP_ERROR_PAGE
        } catch (error) {
          console.log(error)
          numRunsLoadErrorPage++
          if (numRunsLoadErrorPage >= 3) {
            console.log(`Error accessing detail product at ${link}`)
            break LOOP_ERROR_PAGE
            // throw new BadRequestError(`Error accessing detail product at ${link}`)
          }
          continue LOOP_ERROR_PAGE
        }
      } while (true)
      if (!detailData) {
        continue
      }
      if (detailData && detailData.id) {
        currentPageTotalData.push({
          id: detailData.id,
          title: detailData.title,
          type: detailData.type,
        })
        detailData.categoryType = categoryType
        try {
          await this.chatxService.createOrUpdateSegmentsWithDatabaseToProduct(detailData)
          console.log(`Detail product: `, {
            id: detailData.id,
            title: detailData.title,
            price: detailData.price,
          })
        } catch (error) {
          console.log('Error createOrUpdateSegmentsWithDatabaseToProduct')
          throw new BadRequestError(`Error createOrUpdateSegmentsWithDatabaseToProduct`)
        }
      }
    }
    await page.close()
    await browser.close()
    return currentPageTotalData
  }

  async pageDetailPromise(link: string): Promise<IProduct> {
    const browser = await puppeteer.launch({ headless: false })
    // Open a new page / tab in the browser.
    const page = await browser.newPage()
    // Navigate to the URL
    await page.goto(link, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    })
    const dataObject = await this.getObjectDetailFromScript(page)
    await page.close()
    await browser.close()

    // Handle the case if no product data was found
    if (dataObject) {
      const price = Number(String(dataObject.price).slice(0, -2))
      const originalPrice = Number(String(dataObject.compare_at_price).slice(0, -2))
      const percentDiscount =
        originalPrice || originalPrice !== 0
          ? Math.round(
              ((Number(originalPrice) - Number(price)) / Number(originalPrice)) * 100,
            ).toFixed(2)
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
        price: price,
        originalPrice: originalPrice,
        percentDiscount: percentDiscount + '%',
        description: extractTextFromHTML(dataObject.description),
      }
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
