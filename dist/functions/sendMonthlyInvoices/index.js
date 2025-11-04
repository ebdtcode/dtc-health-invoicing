"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMonthlyInvoices = sendMonthlyInvoices;
const functions_1 = require("@azure/functions");
const clients_1 = require("../../data/clients");
const utils_1 = require("../../shared/utils");
const pdfGenerator_1 = require("../../shared/pdfGenerator");
const emailService_1 = require("../../shared/emailService");
/**
 * Azure Function: Send Monthly Invoices
 * Triggers: Every 15th of the month at 9:00 AM
 * Schedule: "0 0 9 15 * *" (minute hour day-of-month month day-of-week)
 */
async function sendMonthlyInvoices(_myTimer, context) {
    const timeStamp = new Date().toISOString();
    context.log('Invoice generation started at:', timeStamp);
    // Initialize email service
    const mailjetApiKey = process.env.MAILJET_API_KEY;
    const mailjetApiSecret = process.env.MAILJET_API_SECRET;
    if (!mailjetApiKey || !mailjetApiSecret) {
        context.error('MAILJET_API_KEY or MAILJET_API_SECRET environment variable is not set');
        throw new Error('Email service configuration missing');
    }
    (0, emailService_1.initializeEmailService)(mailjetApiKey, mailjetApiSecret);
    // Get active clients
    const clients = (0, clients_1.getActiveClients)();
    context.log(`Found ${clients.length} active clients`);
    const results = [];
    // Process each client
    for (const client of clients) {
        try {
            context.log(`Processing invoice for ${client.facilityName}...`);
            // Generate invoice data with billing schedule
            const invoiceData = (0, utils_1.generateInvoiceData)(client.facilityName, client.address, client.city, client.phone, client.email, client.hourlyRate, client.billingSchedule);
            context.log(`Generated invoice ${invoiceData.invoiceNumber} for ${client.facilityName}`);
            // Generate PDF
            const pdfBuffer = await (0, pdfGenerator_1.generateInvoicePDF)(invoiceData);
            const pdfFilename = (0, pdfGenerator_1.getPDFFilename)(invoiceData);
            context.log(`Generated PDF: ${pdfFilename}`);
            // Send email with PDF attachment
            await (0, emailService_1.sendInvoiceEmail)({
                to: client.email,
                subject: `Invoice ${invoiceData.invoiceNumber} - Daytocare Health Services`,
                body: `Dear ${client.facilityName} Team,\n\nPlease find attached invoice ${invoiceData.invoiceNumber} for the billing period ${invoiceData.billingPeriod}.\n\nTotal Amount Due: $${invoiceData.total.toFixed(2)}\nDue Date: Net 30 Days\n\nThank you for your continued partnership.\n\nBest regards,\nDaytocare Health Services`,
                attachmentName: pdfFilename,
                attachmentContent: pdfBuffer
            });
            context.log(`✓ Invoice sent successfully to ${client.email}`);
            results.push({
                success: true,
                clientId: client.id,
                invoiceNumber: invoiceData.invoiceNumber
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            context.error(`✗ Failed to process invoice for ${client.facilityName}:`, errorMessage);
            results.push({
                success: false,
                clientId: client.id,
                invoiceNumber: '',
                error: errorMessage
            });
        }
    }
    // Summary
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    context.log('=================================');
    context.log('Invoice Generation Summary:');
    context.log(`Total Clients: ${clients.length}`);
    context.log(`Successful: ${successful}`);
    context.log(`Failed: ${failed}`);
    context.log('=================================');
    // Log failed invoices for troubleshooting
    if (failed > 0) {
        context.warn('Failed invoices:');
        results.filter(r => !r.success).forEach(result => {
            context.warn(`- Client ${result.clientId}: ${result.error}`);
        });
    }
    context.log('Invoice generation completed at:', new Date().toISOString());
}
functions_1.app.timer('sendMonthlyInvoices', {
    schedule: '0 0 9 15 * *',
    handler: sendMonthlyInvoices
});
//# sourceMappingURL=index.js.map