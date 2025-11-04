import { Client } from '../shared/types';
/**
 * Sample client data - In production, this would be stored in Azure Cosmos DB or Azure Table Storage
 */
export declare const clients: Client[];
/**
 * Get active clients for billing
 */
export declare function getActiveClients(): Client[];
/**
 * Get client by ID
 */
export declare function getClientById(id: string): Client | undefined;
//# sourceMappingURL=clients.d.ts.map