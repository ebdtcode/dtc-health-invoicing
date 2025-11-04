// Constants
const STORAGE_KEY_PREFIX = 'invoice_counter_';

// State management
let lineItemCount = 1;

// Utility Functions
function getCurrentYearMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getInvoiceNumber() {
    const yearMonth = getCurrentYearMonth();
    const storageKey = STORAGE_KEY_PREFIX + yearMonth;
    let counter = localStorage.getItem(storageKey);
    
    if (!counter) {
        counter = 1;
    } else {
        counter = parseInt(counter) + 1;
    }
    
    localStorage.setItem(storageKey, counter);
    return String(counter).padStart(4, '0');
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function getCurrentDate() {
    return new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Invoice Display Functions
function updateInvoiceDisplay() {
    const facilityName = document.getElementById('facilityName').value || 'Facility Name';
    const address = document.getElementById('address').value || 'Address';
    const city = document.getElementById('city').value || 'City, State ZIP';
    const phone = document.getElementById('phone').value || 'Phone';
    const email = document.getElementById('email').value || 'Email';
    const invoiceNumber = document.getElementById('invoiceNumberInput').value || '0001';
    const invoiceDate = document.getElementById('invoiceDate').value || getCurrentDate();
    const billingPeriod = document.getElementById('billingPeriod').value || 'Billing Period';
    const notes = document.getElementById('notes').value || 'Thank you for your business!';

    document.getElementById('displayFacilityName').textContent = facilityName;
    document.getElementById('displayAddress').textContent = address;
    document.getElementById('displayCity').textContent = city;
    document.getElementById('displayPhone').textContent = phone;
    document.getElementById('displayEmail').textContent = email;
    document.getElementById('displayInvoiceNumber').textContent = invoiceNumber;
    document.getElementById('displayInvoiceDate').textContent = invoiceDate;
    document.getElementById('displayBillingPeriod').textContent = billingPeriod;
    document.getElementById('displayNotes').textContent = notes;

    updateLineItemsTable();
}

function updateLineItemsTable() {
    const tbody = document.getElementById('lineItemsTableBody');
    tbody.innerHTML = '';
    
    let subtotal = 0;

    document.querySelectorAll('.line-item').forEach((item, index) => {
        const date = item.querySelector('input[placeholder="Date"]').value;
        const description = item.querySelector('input[placeholder="Description"]').value;
        const hours = parseFloat(item.querySelector('input[placeholder="Hours"]').value) || 0;
        const rate = parseFloat(item.querySelector('input[placeholder="Rate"]').value) || 0;
        const amount = hours * rate;

        if (date || description || hours || rate) {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${date}</td>
                <td>${description}</td>
                <td style="text-align: center;">${hours}</td>
                <td style="text-align: right;">${formatCurrency(rate)}</td>
                <td class="amount-column">${formatCurrency(amount)}</td>
            `;
            subtotal += amount;
        }
    });

    const taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;

    document.getElementById('displaySubtotal').textContent = formatCurrency(subtotal);
    document.getElementById('displayTax').textContent = formatCurrency(tax);
    document.getElementById('displayTotal').textContent = formatCurrency(total);
}

// Line Item Management
function addLineItem() {
    const container = document.getElementById('lineItemsContainer');
    const newItem = document.createElement('div');
    newItem.className = 'line-item';
    newItem.innerHTML = `
        <input type="date" placeholder="Date" oninput="updateLineItemsTable()">
        <input type="text" placeholder="Description" oninput="updateLineItemsTable()">
        <input type="number" placeholder="Hours" step="0.5" min="0" oninput="updateLineItemsTable()">
        <input type="number" placeholder="Rate" step="0.01" min="0" oninput="updateLineItemsTable()">
        <button class="remove-line" onclick="removeLineItem(this)" title="Remove line item">×</button>
    `;
    container.appendChild(newItem);
}

function removeLineItem(button) {
    button.parentElement.remove();
    updateLineItemsTable();
}

function prefillLineItems() {
    const hourlyRate = parseFloat(document.getElementById('hourlyRate').value) || 0;
    const billingPeriod = document.getElementById('billingPeriod').value;
    
    if (!billingPeriod || hourlyRate === 0) {
        alert('Please enter the billing period and hourly rate first.');
        return;
    }

    const [startDateStr, endDateStr] = billingPeriod.split(' to ');
    if (!startDateStr || !endDateStr) {
        alert('Please use the format "MM/DD/YYYY to MM/DD/YYYY" for the billing period.');
        return;
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        alert('Invalid date format. Please use MM/DD/YYYY format.');
        return;
    }

    const container = document.getElementById('lineItemsContainer');
    container.innerHTML = '';

    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
        
        const newItem = document.createElement('div');
        newItem.className = 'line-item';
        newItem.innerHTML = `
            <input type="date" value="${dateStr}" placeholder="Date" oninput="updateLineItemsTable()">
            <input type="text" value="Nursing Services - ${dayName}" placeholder="Description" oninput="updateLineItemsTable()">
            <input type="number" value="12" placeholder="Hours" step="0.5" min="0" oninput="updateLineItemsTable()">
            <input type="number" value="${hourlyRate}" placeholder="Rate" step="0.01" min="0" oninput="updateLineItemsTable()">
            <button class="remove-line" onclick="removeLineItem(this)" title="Remove line item">×</button>
        `;
        container.appendChild(newItem);

        currentDate.setDate(currentDate.getDate() + 1);
    }

    updateLineItemsTable();
}

function fillSampleData() {
    document.getElementById('facilityName').value = 'Sunshine Healthcare Facility';
    document.getElementById('address').value = '123 Medical Drive';
    document.getElementById('city').value = 'Springfield, IL 62701';
    document.getElementById('phone').value = '(555) 123-4567';
    document.getElementById('email').value = 'billing@sunshinehealthcare.com';
    document.getElementById('billingPeriod').value = '01/01/2025 to 01/07/2025';
    document.getElementById('hourlyRate').value = '45';
    document.getElementById('taxRate').value = '0';
    document.getElementById('notes').value = 'Thank you for your business! Payment is due within 30 days.';
    document.getElementById('paypalEmail').value = 'payments@dtchealthservices.com';
    
    const newInvoiceNumber = getInvoiceNumber();
    document.getElementById('invoiceNumberInput').value = newInvoiceNumber;
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('invoiceDate').value = today;

    updateInvoiceDisplay();
}

// Payment Functions
function openPayPalPayment(event) {
    event.preventDefault();
    
    const paypalEmail = document.getElementById('paypalEmail').value;
    if (!paypalEmail || paypalEmail === 'your.paypal@email.com') {
        alert('Please configure your PayPal email/username in the control panel first.');
        return;
    }

    const totalElement = document.getElementById('displayTotal');
    if (!totalElement) {
        alert('Unable to find invoice total. Please generate the invoice first.');
        return;
    }

    const totalText = totalElement.textContent;
    const amount = parseFloat(totalText.replace(/[^0-9.-]+/g, ''));
    
    if (isNaN(amount) || amount <= 0) {
        alert('Invalid invoice amount. Please check the invoice details.');
        return;
    }

    const paypalUsername = paypalEmail.split('@')[0];
    const paypalUrl = `https://www.paypal.me/${paypalUsername}/${amount.toFixed(2)}`;
    
    window.open(paypalUrl, '_blank');
}

function openZellePayment(event) {
    event.preventDefault();
    alert('Zelle Payment Instructions:\n\n1. Open your Zelle app\n2. Send payment to: finance@dtchealthservices.com\n3. Include invoice number in the memo');
}

// PDF Generation
async function downloadPDF() {
    const invoiceElement = document.querySelector('.invoice-container');
    const controlPanel = document.querySelector('.control-panel');
    
    controlPanel.style.display = 'none';
    
    try {
        const canvas = await html2canvas(invoiceElement, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jspdf.jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        
        const invoiceNumber = document.getElementById('displayInvoiceNumber').textContent;
        const facilityName = document.getElementById('displayFacilityName').textContent.replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `INV-${invoiceNumber}_${facilityName}.pdf`;
        
        pdf.save(filename);
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Failed to generate PDF. Please try again.');
    } finally {
        controlPanel.style.display = 'block';
    }
}

// Initialization
function initializeInvoice() {
    const newInvoiceNumber = getInvoiceNumber();
    document.getElementById('invoiceNumberInput').value = newInvoiceNumber;
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('invoiceDate').value = today;
    
    updateInvoiceDisplay();
}

// Event listener for page load
document.addEventListener('DOMContentLoaded', initializeInvoice);
