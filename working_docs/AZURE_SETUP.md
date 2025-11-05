# DTC Health Invoicing - Azure Functions Setup Guide

Complete guide for deploying automated monthly invoice generation using Azure Functions with TypeScript.

## 📋 Prerequisites

Before starting, ensure you have:

- **Node.js 18+** installed
- **npm** package manager
- **Azure CLI** ([Install here](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli))
- **Azure Functions Core Tools v4** ([Install here](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local))
- **Mailjet Account** (free tier: 200 emails/day, 6000/month)
- **Azure Subscription**

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create `local.settings.json` in the root directory:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "MAILJET_API_KEY": "your-mailjet-api-key-here",
    "MAILJET_API_SECRET": "your-mailjet-secret-key-here",
    "EMAIL_FROM": "finance@dtchealthservices.com"
  }
}
```

### 3. Get Mailjet API Credentials

1. Sign up at [Mailjet](https://www.mailjet.com/)
2. Navigate to: **Account → API Keys (REST API)**
3. Copy both **API Key** and **Secret Key**
4. Add both credentials to `local.settings.json`
5. **Verify sender email**: Account Settings → Sender Addresses & Domains

### 4. Build TypeScript

```bash
npm run build
```

### 5. Test Locally

```bash
# Start Azure Functions local runtime
npm start

# In another terminal, test the manual trigger
curl -X POST http://localhost:7071/api/manualInvoiceTrigger \
  -H "Content-Type: application/json" \
  -d '{"clientId": "client-001"}'
```

## 🏗️ Project Structure

```
.
├── functions/
│   ├── sendMonthlyInvoices/         # Scheduled timer trigger
│   │   ├── index.ts                 # Main function
│   │   └── function.json            # Trigger binding
│   └── manualInvoiceTrigger/        # Manual HTTP trigger
│       ├── index.ts                 # Main function
│       └── function.json            # HTTP binding
├── shared/
│   ├── types.ts                     # TypeScript interfaces
│   ├── utils.ts                     # Utility functions
│   ├── htmlTemplate.ts              # Invoice HTML template
│   ├── pdfGenerator.ts              # PDF generation with Puppeteer
│   └── emailService.ts              # Mailjet email service
├── data/
│   └── clients.ts                   # Client data store
├── assets/                          # Frontend assets
│   ├── css/
│   ├── js/
│   └── images/
├── dist/                            # Compiled JavaScript (generated)
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
├── host.json                        # Azure Functions host config
└── local.settings.json              # Local environment (create this)
```

## ⚙️ Configuration

### Timer Trigger Schedule

The automated function runs on the **15th of each month at 9:00 AM**.

Schedule is configured in `functions/sendMonthlyInvoices/index.ts`:

```typescript
app.timer('sendMonthlyInvoices', {
  schedule: '0 0 9 15 * *',  // CRON format
  handler: sendMonthlyInvoices
});
```

**CRON Format**: `{second} {minute} {hour} {day} {month} {day-of-week}`

Examples:
- `0 0 9 15 * *` - 15th at 9:00 AM every month
- `0 0 8 1 * *` - 1st at 8:00 AM every month
- `0 30 17 * * 5` - Every Friday at 5:30 PM

### Client Data Management

Edit `data/clients.ts` to add/update clients:

```typescript
{
  id: 'client-004',
  facilityName: 'New Healthcare Center',
  address: '123 Main St',
  city: 'Boston, MA 02101',
  phone: '(555) 123-4567',
  email: 'billing@newhealthcare.com',
  hourlyRate: 72.00,
  billingDay: 15,
  active: true
}
```

## 🧪 Testing

### Local Testing

```bash
# Start functions locally
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

### Response Format

```json
{
  "message": "Invoice generation completed",
  "summary": {
    "total": 3,
    "successful": 3,
    "failed": 0
  },
  "results": [
    {
      "success": true,
      "clientId": "client-001",
      "clientName": "Sunshine Healthcare",
      "invoiceNumber": "INV-2024-03-001",
      "total": 3456.00
    }
  ]
}
```

## 🚀 Deploy to Azure

### Step 1: Login to Azure

```bash
az login
```

### Step 2: Create Resource Group

```bash
az group create \
  --name dtc-invoice-rg \
  --location eastus
```

### Step 3: Create Storage Account

```bash
az storage account create \
  --name dtcinvoicestorage \
  --resource-group dtc-invoice-rg \
  --location eastus \
  --sku Standard_LRS
```

### Step 4: Create Function App

```bash
az functionapp create \
  --name dtc-invoice-functions \
  --resource-group dtc-invoice-rg \
  --storage-account dtcinvoicestorage \
  --consumption-plan-location eastus \
  --runtime node \
  --runtime-version 18 \
  --functions-version 4 \
  --os-type Linux
```

### Step 5: Configure Application Settings

```bash
az functionapp config appsettings set \
  --name dtc-invoice-functions \
  --resource-group dtc-invoice-rg \
  --settings \
    "MAILJET_API_KEY=your-mailjet-api-key" \
    "MAILJET_API_SECRET=your-mailjet-secret-key" \
    "EMAIL_FROM=finance@dtchealthservices.com" \
    "EMAIL_FROM_NAME=Daytocare Health Services"
```

### Step 6: Deploy

```bash
# Build
npm run build

# Deploy using Azure Functions Core Tools
func azure functionapp publish dtc-invoice-functions

# Or deploy using VS Code Azure Functions extension
```

### Step 7: Verify Deployment

```bash
# List functions
az functionapp function list \
  --name dtc-invoice-functions \
  --resource-group dtc-invoice-rg

# View logs
az functionapp log tail \
  --name dtc-invoice-functions \
  --resource-group dtc-invoice-rg
```

## 🔐 Security

### Get Function URLs

```bash
# Get manual trigger URL
az functionapp function show \
  --name dtc-invoice-functions \
  --resource-group dtc-invoice-rg \
  --function-name manualInvoiceTrigger \
  --query "invokeUrlTemplate" -o tsv

# Get function key
az functionapp keys list \
  --name dtc-invoice-functions \
  --resource-group dtc-invoice-rg \
  --query "functionKeys.default" -o tsv
```

### Test Deployed Function

```bash
FUNCTION_URL="https://dtc-invoice-functions.azurewebsites.net/api/manualInvoiceTrigger"
FUNCTION_KEY="your-function-key"

curl -X POST "${FUNCTION_URL}?code=${FUNCTION_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"clientId": "client-001"}'
```

## 📊 Monitoring

### Application Insights (Recommended)

```bash
# Create Application Insights
az monitor app-insights component create \
  --app dtc-invoice-insights \
  --resource-group dtc-invoice-rg \
  --location eastus

# Get instrumentation key
INSTRUMENTATION_KEY=$(az monitor app-insights component show \
  --app dtc-invoice-insights \
  --resource-group dtc-invoice-rg \
  --query "instrumentationKey" -o tsv)

# Link to Function App
az functionapp config appsettings set \
  --name dtc-invoice-functions \
  --resource-group dtc-invoice-rg \
  --settings "APPINSIGHTS_INSTRUMENTATIONKEY=${INSTRUMENTATION_KEY}"
```

### View Logs

```bash
# Live log streaming
az functionapp log tail \
  --name dtc-invoice-functions \
  --resource-group dtc-invoice-rg

# View execution history in Azure Portal
# Navigate to: Function App → Functions → sendMonthlyInvoices → Monitor
```

## 💰 Cost Estimate

**Monthly costs for 50 clients:**

| Service | Cost |
|---------|------|
| Azure Functions (Consumption Plan) | ~$0.00 |
| - First 1M executions | FREE |
| - First 400,000 GB-s | FREE |
| - Actual usage: ~12 executions/month | $0.00 |
| Mailjet (Free Tier) | $0.00 |
| - 100 emails/day | FREE |
| Azure Storage (Standard LRS) | ~$0.02 |
| **Total** | **~$0.02/month** |

**Note**: Well within Azure Free Tier limits!

## 🛠️ Troubleshooting

### Issue: Function not triggering on schedule

**Solution:**
```bash
# Check timer status
az functionapp function show \
  --name dtc-invoice-functions \
  --resource-group dtc-invoice-rg \
  --function-name sendMonthlyInvoices

# Verify timer is enabled
az functionapp config appsettings set \
  --name dtc-invoice-functions \
  --resource-group dtc-invoice-rg \
  --settings "AzureWebJobs.sendMonthlyInvoices.Disabled=false"
```

### Issue: Email not sending

**Check:**
1. Verify Mailjet API credentials in Application Settings
2. Confirm sender email is verified in Mailjet
3. Check Mailjet statistics and logs
4. Review function logs for errors

### Issue: PDF generation fails

**Solution:**
```bash
# Increase memory allocation
az functionapp config set \
  --name dtc-invoice-functions \
  --resource-group dtc-invoice-rg \
  --linux-fx-version "NODE|18"

# Increase timeout (max 10 minutes on Consumption Plan)
# Edit host.json: "functionTimeout": "00:10:00"
```

### Issue: Module not found errors

**Solution:**
```bash
# Ensure dependencies are installed
npm install

# Rebuild
npm run build

# Redeploy
func azure functionapp publish dtc-invoice-functions
```

## 📈 Scaling

Current configuration handles:

- **50 clients**: $0.02/month
- **500 clients**: $0.20/month
- **5,000 clients**: $2.00/month

For larger scale:
- Consider **Premium Plan** for consistent performance
- Use **Azure Queue Storage** for batch processing
- Implement **Cosmos DB** for client data

## 🔄 Updates & Maintenance

### Update Client Data

```bash
# Edit data/clients.ts
# Rebuild and redeploy

npm run build
func azure functionapp publish dtc-invoice-functions
```

### Change Schedule

Edit `functions/sendMonthlyInvoices/index.ts`:

```typescript
app.timer('sendMonthlyInvoices', {
  schedule: '0 0 8 1 * *',  // New schedule
  handler: sendMonthlyInvoices
});
```

Then rebuild and redeploy.

### Update Dependencies

```bash
npm update
npm audit fix
npm run build
```

## 📚 Additional Resources

- [Azure Functions Documentation](https://docs.microsoft.com/en-us/azure/azure-functions/)
- [Mailjet Documentation](https://dev.mailjet.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Puppeteer Documentation](https://pptr.dev/)

## 🆘 Support

For issues or questions:
- **Email**: finance@dtchealthservices.com
- **Phone**: (555) 123-4567

## 📝 License

© 2024 Daytocare Health Services. All rights reserved.
