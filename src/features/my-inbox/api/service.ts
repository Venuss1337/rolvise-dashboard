import { fakeInbox } from '@/constants/mock-api-inbox';
import type { InboxItem } from './types';

export async function getInboxItems(communityId: string): Promise<InboxItem[]> {
  return fakeInbox.getInboxItems(communityId);
}
