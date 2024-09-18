import { JSDOM } from 'jsdom'

export default function extractTextFromHTML(html: string): string {
  // Create a JSDOM instance to parse the HTML
  const dom = new JSDOM(html)
  const document = dom.window.document

  // Extract text content and trim it
  const sectionTitle = document.querySelector('.section-title')?.textContent?.trim() || ''
  const articleContent = document.querySelector('.article-content')?.textContent?.trim() || ''

  // Concatenate the extracted text content
  return sectionTitle + '\n' + articleContent
}
