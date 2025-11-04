import { EmailConfig } from '../shared/types';
/**
 * Initialize Mailjet with API key and secret
 */
export declare function initializeEmailService(apiKey: string, apiSecret: string): void;
/**
 * Send email with PDF attachment using Mailjet API v3.1
 */
export declare function sendInvoiceEmail(config: EmailConfig): Promise<void>;
//# sourceMappingURL=emailService.d.ts.map