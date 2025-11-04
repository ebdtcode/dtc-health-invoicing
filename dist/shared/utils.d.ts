import { InvoiceData, InvoiceLineItem, BillingSchedule } from '../shared/types';
/**
 * Format currency to USD
 */
export declare function formatCurrency(amount: number): string;
/**
 * Format date to readable string
 */
export declare function formatDate(date: Date): string;
/**
 * Get billing period for current month
 */
export declare function getCurrentBillingPeriod(): {
    start: Date;
    end: Date;
    formatted: string;
};
/**
 * Generate invoice number
 */
export declare function generateInvoiceNumber(): string;
/**
 * Generate line items for billing period with flexible schedules
 */
export declare function generateLineItems(startDate: Date, endDate: Date, hourlyRate: number, schedule: BillingSchedule): InvoiceLineItem[];
/**
 * Calculate totals
 */
export declare function calculateTotals(lineItems: InvoiceLineItem[], taxRate?: number): {
    subtotal: number;
    tax: number;
    total: number;
};
/**
 * Generate complete invoice data with flexible billing schedule
 */
export declare function generateInvoiceData(facilityName: string, address: string, city: string, phone: string, email: string, hourlyRate: number, schedule: BillingSchedule): InvoiceData;
//# sourceMappingURL=utils.d.ts.map