"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.manualInvoiceTrigger = manualInvoiceTrigger;
const functions_1 = require("@azure/functions");
const clients_1 = require("../../data/clients");
const utils_1 = require("../../shared/utils");
const pdfGenerator_1 = require("../../shared/pdfGenerator");
const emailService_1 = require("../../shared/emailService");
/**
 * Azure Function: Manual Invoice Trigger
 * Allows manual invoice generation for testing or ad-hoc billing
 *
 * POST /api/manualInvoiceTrigger
 * Body: { "clientId": "client-001" } or {} for all clients
 */
async function manualInvoiceTrigger(request, context) {
    context.log('Manual invoice trigger received');
    try {
        // Initialize email service
        const mailjetApiKey = process.env.MAILJET_API_KEY;
        const mailjetApiSecret = process.env.MAILJET_API_SECRET;
        if (!mailjetApiKey || !mailjetApiSecret) {
            return {
                status: 500,
                jsonBody: { error: 'Email service configuration missing' }
            };
        }
        (0, emailService_1.initializeEmailService)(mailjetApiKey, mailjetApiSecret);
        // Parse request body
        const body = await request.text();
        const requestData = body ? JSON.parse(body) : {};
        const clientId = requestData.clientId;
        const clients = clientId
            ? [(0, clients_1.getClientById)(clientId)].filter(Boolean)
            : (0, clients_1.getActiveClients)();
        if (clients.length === 0) {
            return {
                status: 404,
                jsonBody: { error: 'No clients found' }
            };
        }
        const results = [];
        // Process each client
        for (const client of clients) {
            if (!client)
                continue;
            try {
                context.log(`Processing invoice for ${client.facilityName}...`);
                // Generate invoice data with billing schedule
                const invoiceData = (0, utils_1.generateInvoiceData)(client.facilityName, client.address, client.city, client.phone, client.email, client.hourlyRate, client.billingSchedule);
                const pdfBuffer = await (0, pdfGenerator_1.generateInvoicePDF)(invoiceData);
                const pdfFilename = (0, pdfGenerator_1.getPDFFilename)(invoiceData);
                await (0, emailService_1.sendInvoiceEmail)({
                    to: client.email,
                    subject: `Invoice ${invoiceData.invoiceNumber} - Daytocare Health Services`,
                    body: `Dear ${client.facilityName} Team,\n\nPlease find attached invoice ${invoiceData.invoiceNumber} for the billing period ${invoiceData.billingPeriod}.\n\nTotal Amount Due: $${invoiceData.total.toFixed(2)}\nDue Date: Net 30 Days\n\nThank you for your continued partnership.\n\nBest regards,\nDaytocare Health Services`,
                    attachmentName: pdfFilename,
                    attachmentContent: pdfBuffer
                });
                results.push({
                    success: true,
                    clientId: client.id,
                    clientName: client.facilityName,
                    invoiceNumber: invoiceData.invoiceNumber,
                    total: invoiceData.total
                });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                results.push({
                    success: false,
                    clientId: client.id,
                    clientName: client.facilityName,
                    error: errorMessage
                });
            }
        }
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        return {
            status: 200,
            jsonBody: {
                message: 'Invoice generation completed',
                summary: {
                    total: clients.length,
                    successful,
                    failed
                },
                results
            }
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        context.error('Error processing manual invoice trigger:', errorMessage);
        return {
            status: 500,
            jsonBody: { error: errorMessage }
        };
    }
}
functions_1.app.http('manualInvoiceTrigger', {
    methods: ['POST'],
    authLevel: 'function',
    handler: manualInvoiceTrigger
});
//# sourceMappingURL=index.js.map