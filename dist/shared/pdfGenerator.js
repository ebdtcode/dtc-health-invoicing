"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInvoicePDF = generateInvoicePDF;
exports.getPDFFilename = getPDFFilename;
const puppeteer_1 = __importDefault(require("puppeteer"));
const htmlTemplate_1 = require("./htmlTemplate");
/**
 * Generate PDF from invoice data
 */
async function generateInvoicePDF(invoiceData) {
    const html = (0, htmlTemplate_1.generateInvoiceHTML)(invoiceData);
    const browser = await puppeteer_1.default.launch({
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
    }
    finally {
        await browser.close();
    }
}
/**
 * Get PDF filename for invoice
 */
function getPDFFilename(invoiceData) {
    const facilityName = invoiceData.facilityName.replace(/[^a-zA-Z0-9]/g, '_');
    return `${invoiceData.invoiceNumber}_${facilityName}.pdf`;
}
//# sourceMappingURL=pdfGenerator.js.map