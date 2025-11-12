# DTC Health Invoicing System

Professional automated invoice generation and delivery system for Daytocare Health Services.

## 🎯 Overview

Automated serverless invoicing system for healthcare services:
- **Backend**: Azure Functions serverless automation (TypeScript)
- **Automation**: Scheduled monthly invoice delivery on the 15th
- **Email**: Mailjet API with PDF attachments
- **Cost**: ~$0.02/month (well within Azure Free Tier)

## 📁 Project Structure

```
dtc-health-invoicing/
├── public/                       # Web UI
│   ├── index.html               # Invoice management interface
│   └── README.md                # UI documentation
├── functions/                    # Azure Functions (TypeScript)
│   ├── sendMonthlyInvoices/     # Scheduled automation (15th @ 9 AM)
│   └── manualInvoiceTrigger/    # Manual HTTP trigger for testing
├── shared/                       # Shared business logic
│   ├── types.ts                 # TypeScript interfaces
│   ├── utils.ts                 # Invoice calculations
│   ├── htmlTemplate.ts          # PDF invoice template
│   ├── pdfGenerator.ts          # Puppeteer PDF generation
│   └── emailService.ts          # Mailjet email delivery
├── data/
│   └── clients.ts               # Client database (3 sample clients)
├── assets/                       # Static assets (logo, reference CSS/JS)
│   ├── css/styles.css           # Invoice styling
│   ├── js/script.js             # Client-side logic
│   └── images/dtc_logo.png      # Company logo
├── scripts/                      # Utility scripts
│   └── setup.sh                 # Local environment setup
├── working_docs/                 # Documentation (not tracked in git)
│   ├── AZURE_SETUP.md           # Complete deployment guide
│   ├── DEPLOYMENT.md            # Deployment procedures
│   ├── CLOUD_ARCHITECTURE.md    # Architecture diagrams
│   └── original-invoice.html    # Original HTML invoice UI
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript configuration
├── host.json                     # Azure Functions host config
└── .funcignore                   # Azure Functions deployment exclusions

## 🚀 Quick Start

### Standalone Web App (No Azure Functions Required)

The invoice and timesheet generators work entirely in the browser - no backend needed!

**Option 1: Using npm (Recommended)**
```bash
npm install
npm start
```
This will open http://localhost:8080 in your browser.

**Option 2: Using Python**
```bash
python3 -m http.server 8080
```
Then open http://localhost:8080/home.html

**Option 3: Direct file access**
Just open `home.html` directly in your browser (some features may be limited).

### Features Available Without Backend:
- ✅ Invoice generation (client-side PDF)
- ✅ Timesheet generation (Excel export)
- ✅ Local storage for drafts
- ✅ All calculations and formatting

### Optional: Azure Functions Backend (For Automated Email Delivery)

If you want automated email delivery, see [AZURE_SETUP.md](./working_docs/AZURE_SETUP.md).

### Backend API (Automated Invoicing)

See **[AZURE_SETUP.md](./working_docs/AZURE_SETUP.md)** for complete deployment guide.

**API Usage:**
```bash
# Send to specific client
curl -X POST http://localhost:7071/api/manualInvoiceTrigger \
  -H "Content-Type: application/json" \
  -d '{"clientId": "client-001"}'

# Send to all clients
curl -X POST http://localhost:7071/api/manualInvoiceTrigger \
  -H "Content-Type: application/json" \
  -d '{}'
```

## ⚙️ Features

### Backend Automation
- ✅ Scheduled monthly execution (15th @ 9:00 AM)
- ✅ Automatic PDF generation
- ✅ Email delivery with attachments
- ✅ Error handling and logging
- ✅ Manual trigger for testing
- ✅ Multi-client batch processing
- ✅ Mailjet API integration

## 📅 Automation Schedule

**Scheduled Run**: 15th of each month at 9:00 AM

Billing period: **16th of previous month → 15th of current month**

Example:
- Invoice sent: March 15, 2024 @ 9:00 AM
- Billing period: Feb 16 - Mar 15, 2024
- Invoice number: INV-2024-03-001

## 💰 Cost Breakdown

| Component | Monthly Cost |
|-----------|--------------|
| Azure Functions (Consumption) | $0.00 (FREE tier) |
| Mailjet (200 emails/day) | $0.00 (FREE tier) |
| Azure Storage | ~$0.02 |
| **Total** | **~$0.02/month** |

Perfect for small to medium healthcare facilities!

## 🛠️ Technology Stack

### Backend
- **TypeScript** - Type-safe development
- **Azure Functions v4** - Serverless compute
- **Node.js 18** - Runtime environment
- **Puppeteer** - PDF generation
- **Mailjet** - Email delivery
- **Azure Blob Storage** - Optional invoice archival

## 📊 Sample Clients

Three pre-configured clients:

1. **Sunshine Healthcare Center**
   - Rate: $72.00/hour
   - Email: billing@sunshinehealthcare.com

2. **Green Valley Senior Care**
   - Rate: $68.00/hour  
   - Email: accounts@greenvalleycare.com

3. **Maple Grove Assisted Living**
   - Rate: $70.00/hour
   - Email: finance@maplegroveassisted.com

**Edit** `data/clients.ts` to add more clients.

## 🔧 Configuration

### Environment Variables

Create `local.settings.json`:

```json
{
  "IsEncrypted": false,
  "Values": {
    "MAILJET_API_KEY": "your-api-key-here",
    "MAILJET_API_SECRET": "your-secret-key-here",
    "EMAIL_FROM": "finance@dtchealthservices.com"
  }
}
```

### Invoice Customization

**Change hourly rates**: Edit `data/clients.ts`

**Modify template**: Edit `shared/htmlTemplate.ts`

**Adjust schedule**: Edit timer trigger in `functions/sendMonthlyInvoices/index.ts`

## 🧪 Testing

### Test Backend Locally
```bash
# Start Azure Functions
npm start

# Test single client
curl -X POST http://localhost:7071/api/manualInvoiceTrigger \
  -H "Content-Type: application/json" \
  -d '{"clientId": "client-001"}'

# Test all clients
curl -X POST http://localhost:7071/api/manualInvoiceTrigger \
  -H "Content-Type: application/json" \
  -d '{}'
```

## 📖 Documentation

- **[AZURE_SETUP.md](./working_docs/AZURE_SETUP.md)** - Complete Azure deployment guide
- **[DEPLOYMENT.md](./working_docs/DEPLOYMENT.md)** - Deployment procedures
- **[CLOUD_ARCHITECTURE.md](./working_docs/CLOUD_ARCHITECTURE.md)** - Architecture diagrams
- **[Original Invoice UI](./working_docs/original-invoice.html)** - Reference HTML interface

## 🔐 Security

- **Function-level authentication** on HTTP triggers
- **Mailjet API credentials** stored in Azure Key Vault (production)
- **Environment variables** for sensitive configuration
- **No hardcoded credentials**

## 📈 Scaling

Current setup handles **50 clients** with ease.

For larger scale:
- **500 clients**: Add Application Insights monitoring
- **5,000 clients**: Consider Premium Plan for consistent performance
- **50,000+ clients**: Use Azure Queue Storage for batch processing

## 🐛 Troubleshooting

### Emails not sending
1. Verify Mailjet API credentials
2. Check sender email verification
3. Review function logs: `npm start` or Azure Portal

### PDF generation fails
1. Increase function timeout in `host.json`
2. Check memory allocation
3. Verify Puppeteer dependencies

### Function not triggering
1. Verify timer schedule syntax
2. Check function is enabled in Azure
3. Review Application Insights logs

## 🤝 Contributing

This is a private project for Daytocare Health Services.

For enhancements or bug reports:
- Email: finance@dtchealthservices.com
- Phone: (555) 123-4567

## 📝 License

© 2024 Daytocare Health Services. All rights reserved.

---

**Built with** ❤️ **using TypeScript and Azure Functions**
