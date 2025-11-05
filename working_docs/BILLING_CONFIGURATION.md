# Billing Configuration Guide

## Overview

The DTC Health Invoicing System supports flexible billing configurations to accommodate different client schedules and billing requirements. You can configure hours on a **daily**, **weekly**, **monthly**, or **custom** basis.

## Billing Period

**Default Billing Period:** 16th of previous month to 15th of current month

Example:
- Invoice sent: March 15, 2024
- Billing period: February 16 - March 15, 2024

### Changing the Billing Period

To change the billing period, edit `shared/utils.ts`:

```typescript
export function getCurrentBillingPeriod(): { start: Date; end: Date; formatted: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  // Change these dates for different billing periods
  const start = new Date(year, month - 1, 16);  // 16th of previous month
  const end = new Date(year, month, 15);         // 15th of current month
  
  const formatted = `${formatDate(start)} to ${formatDate(end)}`;
  return { start, end, formatted };
}
```

**Common Billing Periods:**
- **1st to end of month:** `start = new Date(year, month, 1); end = new Date(year, month + 1, 0);`
- **1st to 15th:** `start = new Date(year, month, 1); end = new Date(year, month, 15);`
- **Full calendar month:** `start = new Date(year, month - 1, 1); end = new Date(year, month, 0);`

## Billing Schedule Types

### 1. Daily Billing (`type: 'daily'`)

Bill based on a fixed number of hours per day.

**Configuration:**
```typescript
billingSchedule: {
  type: 'daily',
  hoursPerDay: 12,        // Hours worked each day
  daysPerWeek: 7          // Number of working days per week (7 = every day)
}
```

**Example:**
- **12 hours/day, 7 days/week** = 360 hours/month (30 days)
- **8 hours/day, 5 days/week** = 168 hours/month (weekdays only)
- **24 hours/day, 7 days/week** = 720 hours/month (24/7 coverage)

**Use Cases:**
- Round-the-clock nursing coverage
- Consistent daily service hours
- Predictable staffing schedules

### 2. Weekly Billing (`type: 'weekly'`)

Bill based on total hours per week, distributed evenly across working days.

**Configuration:**
```typescript
billingSchedule: {
  type: 'weekly',
  hoursPerWeek: 84,       // Total hours worked per week
  daysPerWeek: 7          // Number of days to distribute hours across
}
```

**Example:**
- **84 hours/week ÷ 7 days** = 12 hours/day
- **40 hours/week ÷ 5 days** = 8 hours/day (Monday-Friday)
- **168 hours/week ÷ 7 days** = 24 hours/day (24/7 coverage)

**Use Cases:**
- Weekly contracted hours
- Variable daily schedules that average to weekly total
- Part-time or contracted services

### 3. Monthly Billing (`type: 'monthly'`)

Bill based on a fixed total number of hours per month, distributed evenly across all days.

**Configuration:**
```typescript
billingSchedule: {
  type: 'monthly',
  hoursPerMonth: 360      // Fixed monthly hours
}
```

**Example:**
- **360 hours/month ÷ 30 days** = 12 hours/day
- **720 hours/month ÷ 30 days** = 24 hours/day
- **200 hours/month ÷ 30 days** = ~6.67 hours/day

**Use Cases:**
- Flat-rate monthly contracts
- Fixed monthly service agreements
- Budget-based billing

### 4. Custom Schedule (`type: 'custom'`)

Bill based on different hours for different days of the week.

**Configuration:**
```typescript
billingSchedule: {
  type: 'custom',
  customSchedule: {
    'Monday': 8,
    'Tuesday': 10,
    'Wednesday': 8,
    'Thursday': 10,
    'Friday': 8,
    'Saturday': 12,
    'Sunday': 12
  }
}
```

**Example:**
- Weekdays: 8-10 hours
- Weekends: 12 hours
- Days not specified: 0 hours (no billing)

**Use Cases:**
- Variable daily schedules
- Weekend-only services
- Specific day-of-week requirements

## Client Configuration Examples

### Example 1: 24/7 Full-Time Coverage

```typescript
{
  id: 'client-001',
  facilityName: 'Sunshine Healthcare Facility',
  hourlyRate: 65.00,
  billingSchedule: {
    type: 'daily',
    hoursPerDay: 24,
    daysPerWeek: 7
  }
}
```

**Result:** 24 hours × 30 days = 720 hours/month @ $65/hr = $46,800/month

### Example 2: Business Hours Only (Monday-Friday)

```typescript
{
  id: 'client-002',
  facilityName: 'Green Valley Care',
  hourlyRate: 70.00,
  billingSchedule: {
    type: 'daily',
    hoursPerDay: 8,
    daysPerWeek: 5
  }
}
```

**Result:** 8 hours × ~22 weekdays = 176 hours/month @ $70/hr = $12,320/month

### Example 3: Fixed Monthly Contract

```typescript
{
  id: 'client-003',
  facilityName: 'Maple Grove Center',
  hourlyRate: 68.00,
  billingSchedule: {
    type: 'monthly',
    hoursPerMonth: 500
  }
}
```

**Result:** 500 hours/month @ $68/hr = $34,000/month (regardless of days in month)

### Example 4: Weekend Shifts Only

```typescript
{
  id: 'client-004',
  facilityName: 'Weekend Care Facility',
  hourlyRate: 75.00,
  billingSchedule: {
    type: 'custom',
    customSchedule: {
      'Saturday': 12,
      'Sunday': 12
    }
  }
}
```

**Result:** 12 hours × ~8 weekend days = 96 hours/month @ $75/hr = $7,200/month

## Modifying Client Billing Schedules

### Adding a New Client

Edit `/data/clients.ts`:

```typescript
export const clients: Client[] = [
  // ... existing clients ...
  {
    id: 'client-004',
    facilityName: 'Your New Facility',
    address: '123 Main St',
    city: 'City, ST 12345',
    phone: '(555) 123-4567',
    email: 'billing@newfacility.com',
    hourlyRate: 72.00,
    billingDay: 15,
    billingSchedule: {
      type: 'daily',           // Choose: daily, weekly, monthly, or custom
      hoursPerDay: 12,
      daysPerWeek: 7
    },
    active: true,
    metadata: {
      contactPerson: 'Billing Manager',
      notes: 'Payment terms: Net 30'
    }
  }
];
```

### Updating an Existing Client

Simply modify the `billingSchedule` object for the client:

```typescript
// Before: Daily billing
billingSchedule: {
  type: 'daily',
  hoursPerDay: 12,
  daysPerWeek: 7
}

// After: Change to weekly billing
billingSchedule: {
  type: 'weekly',
  hoursPerWeek: 84,
  daysPerWeek: 7
}
```

## Invoice Display

The billing schedule information is automatically included in invoice notes:

- **Daily:** "Billing: 12 hours/day, 7 days/week"
- **Weekly:** "Billing: 84 hours/week"
- **Monthly:** "Billing: 360 hours/month (fixed)"
- **Custom:** "Billing: Custom schedule"

## Calculating Total Hours and Costs

### Quick Reference Table

| Schedule Type | Hours/Day | Days/Week | Hours/Month* | @ $70/hr |
|--------------|-----------|-----------|--------------|----------|
| Part-time | 4 | 5 | ~88 | $6,160 |
| Half-time | 8 | 5 | ~176 | $12,320 |
| Full-time | 12 | 7 | ~360 | $25,200 |
| Extended | 16 | 7 | ~480 | $33,600 |
| 24/7 Coverage | 24 | 7 | ~720 | $50,400 |

*Based on 30-day month

### Formula Examples

**Daily Billing:**
```
Total Hours = hoursPerDay × daysInBillingPeriod
Total Cost = Total Hours × hourlyRate
```

**Weekly Billing:**
```
Hours Per Day = hoursPerWeek ÷ daysPerWeek
Total Hours = Hours Per Day × daysInBillingPeriod
Total Cost = Total Hours × hourlyRate
```

**Monthly Billing:**
```
Hours Per Day = hoursPerMonth ÷ daysInBillingPeriod
Total Hours = hoursPerMonth (fixed)
Total Cost = hoursPerMonth × hourlyRate
```

## Testing Billing Changes

After modifying billing schedules:

1. **Rebuild the project:**
   ```bash
   npm run build
   ```

2. **Test locally:**
   ```bash
   npm start
   ```

3. **Send a test invoice via Web UI:**
   - Open `public/index.html`
   - Select the modified client
   - Click "Send Invoice"
   - Verify the hours and totals in the PDF

4. **Or test via API:**
   ```bash
   curl -X POST http://localhost:7071/api/manualInvoiceTrigger \
     -H "Content-Type: application/json" \
     -d '{"clientId": "client-001"}'
   ```

## Best Practices

1. **Document billing agreements** in the client's `metadata.notes` field
2. **Test new schedules** before deploying to production
3. **Communicate changes** to clients before billing period starts
4. **Keep historical records** of billing schedule changes
5. **Validate calculations** manually for first invoice with new schedule

## Troubleshooting

**Issue:** Hours don't match expected total
- **Check:** `daysPerWeek` matches your intended coverage
- **Check:** Billing period days (16th-15th = 30 days typically)
- **Verify:** Schedule type matches billing agreement

**Issue:** Custom schedule not working
- **Check:** Day names match exactly: 'Monday', 'Tuesday', etc.
- **Check:** Days with 0 hours are omitted from invoice
- **Verify:** customSchedule object is properly formatted

**Issue:** Invoice totals seem incorrect
- **Review:** Generated line items in PDF
- **Calculate:** Hours × Rate should equal amount per line
- **Verify:** Billing period includes correct number of days

## Support

For questions or assistance:
- Email: finance@dtchealthservices.com
- Phone: (555) 123-4567
