import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getActiveClients, getClientById } from '../../data/clients';
import { generateInvoiceData } from '../../shared/utils';
import { generateInvoicePDF, getPDFFilename } from '../../shared/pdfGenerator';
import { initializeEmailService, sendInvoiceEmail } from '../../shared/emailService';

/**
 * Azure Function: Manual Invoice Trigger
 * Allows manual invoice generation for testing or ad-hoc billing
 * 
 * POST /api/manualInvoiceTrigger
 * Body: { "clientId": "client-001" } or {} for all clients
 */
export async function manualInvoiceTrigger(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
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
    
    initializeEmailService(mailjetApiKey, mailjetApiSecret);

    // Parse request body
    const body = await request.text();
    const requestData = body ? JSON.parse(body) : {};
    const clientId = requestData.clientId;
    const clients = clientId 
      ? [getClientById(clientId)].filter(Boolean)
      : getActiveClients();

    if (clients.length === 0) {
      return {
        status: 404,
        jsonBody: { error: 'No clients found' }
      };
    }

    const results = [];

    // Process each client
    for (const client of clients) {
      if (!client) continue;
      
      try {
        context.log(`Processing invoice for ${client.facilityName}...`);

        // Generate invoice data with billing schedule
        const invoiceData = generateInvoiceData(
          client.facilityName,
          client.address,
          client.city,
          client.phone,
          client.email,
          client.hourlyRate,
          client.billingSchedule
        );

        const pdfBuffer = await generateInvoicePDF(invoiceData);
        const pdfFilename = getPDFFilename(invoiceData);

        await sendInvoiceEmail({
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

      } catch (error) {
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

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    context.error('Error processing manual invoice trigger:', errorMessage);
    
    return {
      status: 500,
      jsonBody: { error: errorMessage }
    };
  }
}

app.http('manualInvoiceTrigger', {
  methods: ['POST'],
  authLevel: 'function',
  handler: manualInvoiceTrigger
});
