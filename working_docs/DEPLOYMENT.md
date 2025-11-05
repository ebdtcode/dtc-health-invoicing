# Automated Invoice Delivery - Deployment Guide

## Quick Start (Recommended: AWS Lambda + SES)

### Prerequisites
- AWS Account
- AWS CLI installed and configured
- Node.js 18+ installed

### Cost: ~$2-5/month (or FREE if within AWS Free Tier limits)

---

## Option 1: AWS Lambda (Most Cost-Effective) ⭐

### Step 1: Setup AWS SES (Simple Email Service)

```bash
# 1. Verify your email address
aws ses verify-email-identity --email-address finance@dtchealthservices.com

# 2. Check verification status
aws ses get-identity-verification-attributes \
  --identities finance@dtchealthservices.com

# 3. (Optional) Move out of sandbox mode to send to any email
# Go to: AWS Console > SES > Account Dashboard > Request production access
```

### Step 2: Create S3 Bucket for Client Data

```bash
# Create bucket
aws s3 mb s3://dtc-invoice-data-$(aws sts get-caller-identity --query Account --output text)

# Upload client data
aws s3 cp data/clients.json s3://dtc-invoice-data-YOUR_ACCOUNT_ID/data/clients.json
```

### Step 3: Package Lambda Function

```bash
# Install dependencies
cd lambda
npm init -y
npm install @sparticuz/chromium puppeteer-core aws-sdk

# Create deployment package
zip -r invoice-generator.zip invoice-generator.js node_modules/

# Upload to S3
aws s3 cp invoice-generator.zip s3://YOUR_DEPLOYMENT_BUCKET/lambda/
```

### Step 4: Deploy CloudFormation Stack

```bash
# Deploy the stack
aws cloudformation create-stack \
  --stack-name dtc-invoice-automation \
  --template-body file://cloudformation-template.json \
  --capabilities CAPABILITY_IAM \
  --parameters \
    ParameterKey=EmailFrom,ParameterValue=finance@dtchealthservices.com \
    ParameterKey=InvoiceSchedule,ParameterValue="cron(0 9 15 * ? *)"

# Check deployment status
aws cloudformation describe-stacks --stack-name dtc-invoice-automation
```

### Step 5: Test the Function

```bash
# Invoke manually to test
aws lambda invoke \
  --function-name InvoiceGenerator \
  --payload '{}' \
  response.json

# View results
cat response.json
```

### Step 6: Monitor and Manage

```bash
# View CloudWatch logs
aws logs tail /aws/lambda/InvoiceGenerator --follow

# Update client data
aws s3 cp data/clients.json s3://dtc-invoice-data-YOUR_ACCOUNT_ID/data/clients.json
```

---

## Option 2: GitHub Actions + Netlify Functions (FREE)

### Step 1: Setup Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize site
netlify init
```

### Step 2: Create Netlify Function

Create `netlify/functions/send-invoices.js`:

```javascript
const fetch = require('node-fetch');

exports.handler = async (event) => {
  // Your invoice generation logic
  // Use Mailjet API for email delivery
  
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Invoices sent' })
  };
};
```

### Step 3: Setup GitHub Actions

Create `.github/workflows/monthly-invoice.yml`:

```yaml
name: Monthly Invoice Delivery

on:
  schedule:
    - cron: '0 9 15 * *'  # 15th of each month at 9 AM UTC
  workflow_dispatch:  # Manual trigger

jobs:
  send-invoices:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Trigger Netlify Function
        env:
          NETLIFY_FUNCTION_URL: ${{ secrets.NETLIFY_FUNCTION_URL }}
        run: |
          curl -X POST $NETLIFY_FUNCTION_URL
```

### Step 4: Configure Mailjet

```bash
# Sign up for Mailjet (free tier: 200 emails/day, 6000/month)
# Get API credentials from: https://app.mailjet.com/account/apikeys

# Add to GitHub Secrets:
# MAILJET_API_KEY and MAILJET_API_SECRET
```

---

## Option 3: Azure Functions + Logic Apps

### Step 1: Install Azure CLI

```bash
# Install Azure Functions Core Tools
npm install -g azure-functions-core-tools@4

# Login to Azure
az login
```

### Step 2: Create Function App

```bash
# Create resource group
az group create --name dtc-invoice-rg --location eastus

# Create storage account
az storage account create \
  --name dtcinvoicestorage \
  --resource-group dtc-invoice-rg \
  --location eastus

# Create function app
az functionapp create \
  --resource-group dtc-invoice-rg \
  --consumption-plan-location eastus \
  --runtime node \
  --runtime-version 18 \
  --functions-version 4 \
  --name dtc-invoice-function \
  --storage-account dtcinvoicestorage
```

### Step 3: Deploy Function

```bash
# Initialize function project
func init --javascript
func new --name InvoiceGenerator --template "Timer trigger"

# Deploy
func azure functionapp publish dtc-invoice-function
```

---

## Cost Comparison

| Solution | Monthly Cost | Setup Time | Scalability |
|----------|-------------|------------|-------------|
| **AWS Lambda + SES** | $2-5 (FREE tier eligible) | 30 min | Excellent |
| **GitHub Actions + Netlify** | $0 | 20 min | Good |
| **Azure Functions** | $2-5 | 30 min | Excellent |
| **Traditional Server** | $20-50 | 2-3 hours | Limited |

---

## Maintenance

### Update Client List

```bash
# AWS
aws s3 cp data/clients.json s3://YOUR_BUCKET/data/clients.json

# GitHub (commit and push)
git add data/clients.json
git commit -m "Update client list"
git push
```

### Change Schedule

```bash
# AWS - Update CloudFormation stack parameter
aws cloudformation update-stack \
  --stack-name dtc-invoice-automation \
  --use-previous-template \
  --parameters ParameterKey=InvoiceSchedule,ParameterValue="cron(0 12 1 * ? *)"

# GitHub Actions - Edit .github/workflows/monthly-invoice.yml
```

### Monitor Deliveries

```bash
# AWS CloudWatch Logs
aws logs tail /aws/lambda/InvoiceGenerator --follow

# GitHub Actions
# Go to: Repository > Actions > View workflow runs
```

---

## Support & Troubleshooting

### Common Issues

1. **SES Sandbox Mode**: Can only send to verified emails
   - Solution: Request production access in AWS Console

2. **Lambda Timeout**: Function times out generating PDFs
   - Solution: Increase timeout to 300 seconds (already configured)

3. **Client Not Receiving Emails**: Check spam folder
   - Solution: Setup SPF/DKIM records for your domain

### Testing

```bash
# Test locally before deploying
node lambda/invoice-generator.js

# Test Lambda function manually
aws lambda invoke --function-name InvoiceGenerator response.json
```

---

## Next Steps

1. ✅ Choose deployment option (AWS recommended)
2. ✅ Setup email service (Mailjet)
3. ✅ Deploy infrastructure
4. ✅ Upload client data
5. ✅ Test with one client
6. ✅ Monitor first automated run on 15th

**Recommended**: Start with AWS Lambda + SES for best cost/performance ratio.
