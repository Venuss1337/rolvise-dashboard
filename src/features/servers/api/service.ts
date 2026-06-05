import { fakeManagedServers } from '@/constants/mock-api-servers';
import type { ManagedServer } from './types';

export async function getManagedServers(): Promise<ManagedServer[]> {
  return fakeManagedServers.getServers();
}

export async function getManagedServerById(id: string): Promise<ManagedServer | undefined> {
  return fakeManagedServers.getServerById(id);
}
