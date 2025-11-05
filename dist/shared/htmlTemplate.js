"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInvoiceHTML = generateInvoiceHTML;
const utils_1 = require("../shared/utils");
/**
 * Generate HTML for invoice PDF
 */
function generateInvoiceHTML(data) {
    const lineItemsHTML = data.lineItems.map(item => `
    <tr>
      <td>${item.date}</td>
      <td>${item.description}</td>
      <td style="text-align: center;">${item.hours}</td>
      <td style="text-align: right;">${(0, utils_1.formatCurrency)(item.rate)}</td>
      <td class="amount-column">${(0, utils_1.formatCurrency)(item.amount)}</td>
    </tr>
  `).join('');
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${data.invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      color: #333;
      line-height: 1.4;
      padding: 20px;
    }
    .invoice-container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
    }
    .invoice-header {
      background: linear-gradient(135deg, #C9354D 0%, #D84A5F 100%);
      color: white;
      padding: 20px;
      text-align: center;
    }
    .invoice-header h1 { font-size: 2em; margin-bottom: 10px; }
    .invoice-body { padding: 30px; }
    .info-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
    }
    .info-box {
      background: #fff5f7;
      padding: 20px;
      border-radius: 10px;
      border-left: 3px solid #C9354D;
    }
    .info-box h3 {
      color: #C9354D;
      font-size: 1em;
      margin-bottom: 15px;
      text-transform: uppercase;
    }
    .info-box p { line-height: 1.8; font-size: 0.95em; }
    .info-box strong { display: inline-block; min-width: 100px; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    thead {
      background: linear-gradient(135deg, #C9354D 0%, #D84A5F 100%);
      color: white;
    }
    th {
      padding: 12px;
      text-align: left;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.85em;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #eee;
      font-size: 0.95em;
    }
    .amount-column {
      text-align: right;
      font-weight: 600;
      color: #C9354D;
    }
    .total-section {
      background: linear-gradient(135deg, #fff5f7 0%, #ffe4e9 100%);
      padding: 20px;
      border-radius: 10px;
      margin-top: 20px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      font-size: 1em;
    }
    .total-row.grand-total {
      font-size: 1.5em;
      font-weight: bold;
      color: #C9354D;
      border-top: 2px solid #C9354D;
      padding-top: 15px;
      margin-top: 15px;
    }
    .notes-section {
      margin-top: 30px;
      padding: 20px;
      background: #f0f4f8;
      border-left: 3px solid #C9354D;
      border-radius: 8px;
    }
    .notes-section h3 { color: #C9354D; margin-bottom: 12px; }
    .footer {
      background: #fff5f7;
      padding: 20px;
      text-align: center;
      color: #666;
      border-top: 2px solid #C9354D;
      margin-top: 30px;
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="invoice-header">
      <h1>INVOICE</h1>
      <p>Professional Nursing Services</p>
    </div>
    
    <div class="invoice-body">
      <div class="info-section">
        <div class="info-box">
          <h3>From</h3>
          <p>
            <strong>Company:</strong> Daytocare Health Services<br>
            <strong>Address:</strong> 123 Healthcare Lane<br>
            <strong>City:</strong> Medical City, MC 12345<br>
            <strong>Email:</strong> finance@dtchealthservices.com<br>
            <strong>Phone:</strong> (555) 123-4567
          </p>
        </div>
        
        <div class="info-box">
          <h3>Bill To</h3>
          <p>
            <strong>Facility:</strong> ${data.facilityName}<br>
            <strong>Address:</strong> ${data.address}<br>
            <strong>City:</strong> ${data.city}<br>
            <strong>Phone:</strong> ${data.phone}<br>
            <strong>Email:</strong> ${data.email}
          </p>
        </div>
      </div>
      
      <div class="info-section">
        <div class="info-box">
          <h3>Invoice Details</h3>
          <p>
            <strong>Invoice #:</strong> ${data.invoiceNumber}<br>
            <strong>Date:</strong> ${data.invoiceDate}<br>
            <strong>Period:</strong> ${data.billingPeriod}
          </p>
        </div>
        
        <div class="info-box">
          <h3>Payment Information</h3>
          <p>
            <strong>Due:</strong> Net 30 Days<br>
            <strong>Terms:</strong> Payment due upon receipt
          </p>
        </div>
      </div>
      
      <h2 style="color: #333; margin-bottom: 15px; border-bottom: 2px solid #C9354D; padding-bottom: 8px;">
        Services Provided
      </h2>
      
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th style="text-align: center;">Hours</th>
            <th style="text-align: right;">Rate</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${lineItemsHTML}
        </tbody>
      </table>
      
      <div class="total-section">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>${(0, utils_1.formatCurrency)(data.subtotal)}</span>
        </div>
        <div class="total-row">
          <span>Tax:</span>
          <span>${(0, utils_1.formatCurrency)(data.tax)}</span>
        </div>
        <div class="total-row grand-total">
          <span>Total Due:</span>
          <span>${(0, utils_1.formatCurrency)(data.total)}</span>
        </div>
      </div>
      
      <div class="notes-section">
        <h3>Notes</h3>
        <p>${data.notes}</p>
      </div>
      
      <div class="footer">
        <p><strong>Daytocare Health Services</strong></p>
        <p>Professional Healthcare Staffing Solutions</p>
        <p>finance@dtchealthservices.com | (555) 123-4567</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}
//# sourceMappingURL=htmlTemplate.js.map