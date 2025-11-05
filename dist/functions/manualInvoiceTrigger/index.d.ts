import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
/**
 * Azure Function: Manual Invoice Trigger
 * Allows manual invoice generation for testing or ad-hoc billing
 *
 * POST /api/manualInvoiceTrigger
 * Body: { "clientId": "client-001" } or {} for all clients
 */
export declare function manualInvoiceTrigger(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit>;
//# sourceMappingURL=index.d.ts.map