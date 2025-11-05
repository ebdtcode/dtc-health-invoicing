"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCurrency = formatCurrency;
exports.formatDate = formatDate;
exports.getCurrentBillingPeriod = getCurrentBillingPeriod;
exports.generateInvoiceNumber = generateInvoiceNumber;
exports.generateLineItems = generateLineItems;
exports.calculateTotals = calculateTotals;
exports.generateInvoiceData = generateInvoiceData;
/**
 * Format currency to USD
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}
/**
 * Format date to readable string
 */
function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
}
/**
 * Get billing period for current month
 */
function getCurrentBillingPeriod() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    // Previous month's 16th to current month's 15th
    const start = new Date(year, month - 1, 16);
    const end = new Date(year, month, 15);
    const formatted = `${formatDate(start)} to ${formatDate(end)}`;
    return { start, end, formatted };
}
/**
 * Generate invoice number
 */
function generateInvoiceNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 9000) + 1000;
    return `INV-${year}${month}-${random}`;
}
/**
 * Calculate hours per day based on billing schedule
 */
function calculateDailyHours(schedule, dayName, totalDays) {
    switch (schedule.type) {
        case 'daily':
            return schedule.hoursPerDay || 12;
        case 'weekly':
            const daysPerWeek = schedule.daysPerWeek || 7;
            return (schedule.hoursPerWeek || 84) / daysPerWeek;
        case 'monthly':
            return (schedule.hoursPerMonth || 360) / totalDays;
        case 'custom':
            return schedule.customSchedule?.[dayName] || 0;
        default:
            return 12;
    }
}
/**
 * Generate line items for billing period with flexible schedules
 */
function generateLineItems(startDate, endDate, hourlyRate, schedule) {
    const items = [];
    const current = new Date(startDate);
    // Calculate total days in period
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    while (current <= endDate) {
        const dayName = current.toLocaleDateString('en-US', { weekday: 'long' });
        const dateStr = formatDate(current);
        const hours = calculateDailyHours(schedule, dayName, totalDays);
        const amount = hours * hourlyRate;
        // Skip days with 0 hours (for custom schedules)
        if (hours > 0) {
            items.push({
                date: dateStr,
                description: `Nursing Services - ${dayName}`,
                hours: parseFloat(hours.toFixed(2)),
                rate: hourlyRate,
                amount: parseFloat(amount.toFixed(2))
            });
        }
        current.setDate(current.getDate() + 1);
    }
    return items;
}
/**
 * Calculate totals
 */
function calculateTotals(lineItems, taxRate = 0) {
    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;
    return { subtotal, tax, total };
}
/**
 * Generate complete invoice data with flexible billing schedule
 */
function generateInvoiceData(facilityName, address, city, phone, email, hourlyRate, schedule) {
    const { start, end, formatted } = getCurrentBillingPeriod();
    const lineItems = generateLineItems(start, end, hourlyRate, schedule);
    const { subtotal, tax, total } = calculateTotals(lineItems);
    // Add schedule info to notes
    let scheduleInfo = '';
    switch (schedule.type) {
        case 'daily':
            scheduleInfo = `Billing: ${schedule.hoursPerDay} hours/day, ${schedule.daysPerWeek || 7} days/week`;
            break;
        case 'weekly':
            scheduleInfo = `Billing: ${schedule.hoursPerWeek} hours/week`;
            break;
        case 'monthly':
            scheduleInfo = `Billing: ${schedule.hoursPerMonth} hours/month (fixed)`;
            break;
        case 'custom':
            scheduleInfo = 'Billing: Custom schedule';
            break;
    }
    return {
        invoiceNumber: generateInvoiceNumber(),
        invoiceDate: formatDate(new Date()),
        billingPeriod: formatted,
        facilityName,
        address,
        city,
        phone,
        email,
        lineItems,
        subtotal,
        tax,
        total,
        notes: `${scheduleInfo}. Thank you for your business! Payment is due within 30 days.`
    };
}
//# sourceMappingURL=utils.js.map