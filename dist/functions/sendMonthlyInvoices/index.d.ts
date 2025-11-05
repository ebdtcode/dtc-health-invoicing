import { InvocationContext, Timer } from '@azure/functions';
/**
 * Azure Function: Send Monthly Invoices
 * Triggers: Every 15th of the month at 9:00 AM
 * Schedule: "0 0 9 15 * *" (minute hour day-of-month month day-of-week)
 */
export declare function sendMonthlyInvoices(_myTimer: Timer, context: InvocationContext): Promise<void>;
//# sourceMappingURL=index.d.ts.map