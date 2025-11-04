import puppeteer from 'puppeteer';
import { InvoiceData } from '../shared/types';
import { generateInvoiceHTML } from './htmlTemplate';

/**
 * Generate PDF from invoice data
 */
export async function generateInvoicePDF(invoiceData: InvoiceData): Promise<Buffer> {
  const html = generateInvoiceHTML(invoiceData);
  
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: {
        top: '0.4in',
        right: '0.4in',
        bottom: '0.4in',
        left: '0.4in'
      }
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

/**
 * Get PDF filename for invoice
 */
export function getPDFFilename(invoiceData: InvoiceData): string {
  const facilityName = invoiceData.facilityName.replace(/[^a-zA-Z0-9]/g, '_');
  return `${invoiceData.invoiceNumber}_${facilityName}.pdf`;
}
