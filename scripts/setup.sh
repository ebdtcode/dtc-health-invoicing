#!/bin/bash

# DTC Health Invoicing - Local Setup Script
# This script helps you quickly set up the local development environment

set -e  # Exit on error

echo "🚀 DTC Health Invoicing - Local Setup"
echo "======================================"
echo ""

# Check Node.js
echo "📦 Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'.' -f1 | sed 's/v//')
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be 18 or higher. Current: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Check Azure Functions Core Tools
echo "🔧 Checking Azure Functions Core Tools..."
if ! command -v func &> /dev/null; then
    echo "⚠️  Azure Functions Core Tools not found"
    echo "   Install from: https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local"
    echo ""
    read -p "Continue without Azure Functions? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ Azure Functions Core Tools detected"
fi
echo ""

# Install dependencies
echo "📦 Installing npm dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build
echo "✅ Build completed"
echo ""

# Check local.settings.json
if [ ! -f "local.settings.json" ]; then
    echo "⚠️  local.settings.json not found"
    echo "   Creating template file..."
    
    cat > local.settings.json << 'EOF'
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "EMAIL_SERVICE": "Mailjet",
    "MAILJET_API_KEY": "YOUR_MAILJET_API_KEY_HERE",
    "MAILJET_API_SECRET": "YOUR_MAILJET_API_SECRET_HERE",
    "EMAIL_FROM": "finance@dtchealthservices.com",
    "EMAIL_FROM_NAME": "Daytocare Health Services"
  }
}
EOF
    
    echo "✅ Created local.settings.json template"
    echo ""
    echo "⚠️  IMPORTANT: You need to configure Mailjet:"
    echo "   1. Sign up at https://www.mailjet.com/ (free tier: 200 emails/day)"
    echo "   2. Get API credentials: Account → API Keys (REST API)"
    echo "   3. Replace 'YOUR_MAILJET_API_KEY_HERE' and 'YOUR_MAILJET_API_SECRET_HERE'"
    echo "   4. Verify your sender email in Mailjet: Account → Sender Addresses"
    echo ""
else
    echo "✅ local.settings.json already exists"
    
    # Check if Mailjet API credentials are configured
    if grep -q "YOUR_MAILJET_API_KEY_HERE" local.settings.json; then
        echo "⚠️  Mailjet API credentials not configured yet"
        echo "   Edit local.settings.json and add your API key"
        echo ""
    fi
fi

# Summary
echo "======================================"
echo "✅ Setup Complete!"
echo "======================================"
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Frontend (Manual Invoices):"
echo "   open index.html"
echo ""
echo "2. Backend (Automated Invoices):"
echo "   npm start"
echo "   Then test with:"
echo "   curl -X POST http://localhost:7071/api/manualInvoiceTrigger \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"clientId\": \"client-001\"}'"
echo ""
echo "3. Deploy to Azure:"
echo "   See AZURE_SETUP.md for complete guide"
echo ""
echo "📚 Documentation:"
echo "   - README.md - Project overview"
echo "   - AZURE_SETUP.md - Deployment guide"
echo "   - DEPLOYMENT.md - AWS alternative"
echo ""
echo "🆘 Need help?"
echo "   Email: finance@dtchealthservices.com"
echo ""
