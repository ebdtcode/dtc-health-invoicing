"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeEmailService = initializeEmailService;
exports.sendInvoiceEmail = sendInvoiceEmail;
const node_mailjet_1 = __importDefault(require("node-mailjet"));
let mailjetClient = null;
/**
 * Initialize Mailjet with API key and secret
 */
function initializeEmailService(apiKey, apiSecret) {
    if (!mailjetClient) {
        mailjetClient = node_mailjet_1.default.apiConnect(apiKey, apiSecret);
    }
}
/**
 * Send email with PDF attachment using Mailjet API v3.1
 */
async function sendInvoiceEmail(config) {
    if (!mailjetClient) {
        throw new Error('Email service not initialized. Call initializeEmailService first.');
    }
    const fromEmail = process.env.EMAIL_FROM || 'finance@dtchealthservices.com';
    const fromName = process.env.EMAIL_FROM_NAME || 'Daytocare Health Services';
    const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #C9354D 0%, #D84A5F 100%); color: white; padding: 20px; text-align: center;">
        <h1>Invoice from Daytocare Health Services</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <p style="font-size: 16px; line-height: 1.6;">${config.body}</p>
        <p style="margin-top: 20px; font-size: 14px; color: #666;">
          The invoice is attached as a PDF file. Please review and process payment according to the terms specified.
        </p>
      </div>
      <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
        <p><strong>Daytocare Health Services</strong></p>
        <p>Professional Healthcare Staffing Solutions</p>
        <p>finance@dtchealthservices.com | (555) 123-4567</p>
      </div>
    </div>
  `;
    const request = mailjetClient
        .post('send', { version: 'v3.1' })
        .request({
        Messages: [
            {
                From: {
                    Email: fromEmail,
                    Name: fromName
                },
                To: [
                    {
                        Email: config.to
                    }
                ],
                Subject: config.subject,
                TextPart: config.body,
                HTMLPart: htmlContent,
                Attachments: [
                    {
                        ContentType: 'application/pdf',
                        Filename: config.attachmentName,
                        Base64Content: config.attachmentContent.toString('base64')
                    }
                ]
            }
        ]
    });
    try {
        const result = await request;
        if (result.response.status !== 200) {
            throw new Error(`Mailjet API error: ${result.response.statusText}`);
        }
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('Error sending email via Mailjet:', error.message);
            throw error;
        }
        throw new Error('Unknown error sending email via Mailjet');
    }
}
//# sourceMappingURL=emailService.js.map