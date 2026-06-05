'use client';

import * as React from 'react';
import type { ManagedServer } from '../api/types';

const STORAGE_KEY_PREFIX = 'rolvise:selected-server-id';

export function useSelectedServer(servers: ManagedServer[], organizationId?: string | null) {
  const [selectedServerId, setSelectedServerId] = React.useState<string | null>(null);
  const storageKey = `${STORAGE_KEY_PREFIX}:${organizationId ?? 'none'}`;

  React.useEffect(() => {
    const storedServerId = window.localStorage.getItem(storageKey);
    const exists = servers.some((server) => server.id === storedServerId);

    setSelectedServerId(exists ? storedServerId : (servers[0]?.id ?? null));
  }, [servers, storageKey]);

  const selectedServer =
    servers.find((server) => server.id === selectedServerId) ?? servers[0] ?? null;

  const selectServer = React.useCallback(
    (serverId: string) => {
      window.localStorage.setItem(storageKey, serverId);
      setSelectedServerId(serverId);
    },
    [storageKey]
  );

  return {
    selectedServer,
    selectedServerId: selectedServer?.id ?? null,
    selectServer
  };
}
