export interface BillingSchedule {
  type: 'daily' | 'weekly' | 'monthly' | 'custom'; // How hours are defined
  hoursPerDay?: number;        // For daily billing (e.g., 12 hours/day)
  hoursPerWeek?: number;       // For weekly billing (e.g., 84 hours/week)
  hoursPerMonth?: number;      // For monthly billing (e.g., 360 hours/month)
  daysPerWeek?: number;        // Working days per week (default: 7)
  customSchedule?: {           // For custom schedules
    [key: string]: number;     // Day name -> hours (e.g., "Monday": 12)
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
  billingDay: number; // Day of month (1-28)
  billingSchedule: BillingSchedule; // Flexible billing configuration
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
