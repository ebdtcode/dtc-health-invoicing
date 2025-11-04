export interface BillingSchedule {
    type: 'daily' | 'weekly' | 'monthly' | 'custom';
    hoursPerDay?: number;
    hoursPerWeek?: number;
    hoursPerMonth?: number;
    daysPerWeek?: number;
    customSchedule?: {
        [key: string]: number;
    };
}
export interface Client {
    id: string;
    facilityName: string;
    address: string;
    city: string;
    phone: string;
    email: string;
    hourlyRate: number;
    billingDay: number;
    billingSchedule: BillingSchedule;
    active: boolean;
    metadata?: {
        contactPerson?: string;
        notes?: string;
        lastInvoiceDate?: string;
    };
}
export interface InvoiceLineItem {
    date: string;
    description: string;
    hours: number;
    rate: number;
    amount: number;
}
export interface InvoiceData {
    invoiceNumber: string;
    invoiceDate: string;
    billingPeriod: string;
    facilityName: string;
    address: string;
    city: string;
    phone: string;
    email: string;
    lineItems: InvoiceLineItem[];
    subtotal: number;
    tax: number;
    total: number;
    notes: string;
}
export interface EmailConfig {
    to: string;
    subject: string;
    body: string;
    attachmentName: string;
    attachmentContent: Buffer;
}
export interface InvoiceGenerationResult {
    success: boolean;
    clientId: string;
    invoiceNumber: string;
    error?: string;
}
//# sourceMappingURL=types.d.ts.map