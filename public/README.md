# Web UI for DTC Health Invoicing

Simple web interface for managing invoice generation and delivery.

## Usage

### Local Development

1. Start the Azure Functions backend:
   ```bash
   npm start
   ```

2. Open the web UI:
   ```bash
   open public/index.html
   ```
   
   Or visit: `http://localhost:7071/public/index.html` (if served by Functions)

### Features

- **Send Invoice to Single Client**: Select a client and send their invoice immediately
- **Send to All Clients**: Batch send invoices to all active clients
- **View Active Clients**: See all clients with their contact info and rates
- **Connection Status**: Monitor API connectivity

### Configuration

The UI automatically detects the environment:
- **Local**: Uses `http://localhost:7071/api`
- **Production**: Uses `/api` (relative to deployment URL)

### Production Deployment

To serve this UI from Azure:

1. Upload `public/` folder to Azure Blob Storage (Static Website)
2. Or deploy with Azure Static Web Apps
3. Configure CORS in Azure Functions to allow the UI origin

See working_docs/AZURE_SETUP.md for deployment details.
