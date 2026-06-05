import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { resourceKeys } from './queries';
import { createCommunityResource } from './service';

export const createResourceMutation = mutationOptions({
  mutationFn: createCommunityResource,
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: resourceKeys.all });
  }
});
