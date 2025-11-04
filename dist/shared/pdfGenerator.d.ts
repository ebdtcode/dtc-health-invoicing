import { InvoiceData } from '../shared/types';
/**
 * Generate PDF from invoice data
 */
export declare function generateInvoicePDF(invoiceData: InvoiceData): Promise<Buffer>;
/**
 * Get PDF filename for invoice
 */
export declare function getPDFFilename(invoiceData: InvoiceData): string;
//# sourceMappingURL=pdfGenerator.d.ts.map