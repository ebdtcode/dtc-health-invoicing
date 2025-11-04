import { Client } from '../shared/types';

/**
 * Sample client data - In production, this would be stored in Azure Cosmos DB or Azure Table Storage
 */
export const clients: Client[] = [
  {
    id: 'client-001',
    facilityName: 'Sunshine Healthcare Facility',
    address: '123 Medical Drive',
    city: 'Springfield, IL 62701',
    phone: '(555) 123-4567',
    email: 'billing@sunshinehealthcare.com',
    hourlyRate: 65.00,
    billingDay: 15,
    billingSchedule: {
      type: 'daily',
      hoursPerDay: 12,
      daysPerWeek: 7  // 7 days/week = 12 hours/day * 30 days = 360 hours/month
    },
    active: true,
    metadata: {
      contactPerson: 'VP of Clinical Services',
      notes: 'Net 30 payment terms - 12 hours daily coverage'
    }
  },
  {
    id: 'client-002',
    facilityName: 'Green Valley Assisted Living',
    address: '456 Care Lane',
    city: 'Riverside, CA 92501',
    phone: '(555) 987-6543',
    email: 'accounts@greenvalley.com',
    hourlyRate: 70.00,
    billingDay: 15,
    billingSchedule: {
      type: 'weekly',
      hoursPerWeek: 84,  // 84 hours/week across 7 days = 12 hours/day average
      daysPerWeek: 7
    },
    active: true,
    metadata: {
      contactPerson: 'Finance Director',
      notes: 'Prefers PDF invoices - Weekly billing at 84 hours/week'
    }
  },
  {
    id: 'client-003',
    facilityName: 'Maple Grove Senior Center',
    address: '789 Elder Street',
    city: 'Portland, OR 97201',
    phone: '(555) 555-0123',
    email: 'billing@maplegrove.org',
    hourlyRate: 68.00,
    billingDay: 15,
    billingSchedule: {
      type: 'monthly',
      hoursPerMonth: 360  // Fixed 360 hours per month
    },
    active: true,
    metadata: {
      contactPerson: 'Billing Manager',
      notes: 'Monthly flat rate - 360 hours per billing period'
    }
  }
];

/**
 * Get active clients for billing
 */
export function getActiveClients(): Client[] {
  return clients.filter(client => client.active);
}

/**
 * Get client by ID
 */
export function getClientById(id: string): Client | undefined {
  return clients.find(client => client.id === id);
}
