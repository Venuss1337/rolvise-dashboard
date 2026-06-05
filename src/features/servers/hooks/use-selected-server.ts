'use client';

import * as React from 'react';
import type { ManagedServer } from '../api/types';

const STORAGE_KEY = 'rolvise:selected-server-id';

export function useSelectedServer(servers: ManagedServer[]) {
  const [selectedServerId, setSelectedServerId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const storedServerId = window.localStorage.getItem(STORAGE_KEY);
    setSelectedServerId(storedServerId ?? servers[0]?.id ?? null);
  }, [servers]);

  const selectedServer =
    servers.find((server) => server.id === selectedServerId) ?? servers[0] ?? null;

  const selectServer = React.useCallback((serverId: string) => {
    window.localStorage.setItem(STORAGE_KEY, serverId);
    setSelectedServerId(serverId);
  }, []);

  return {
    selectedServer,
    selectedServerId: selectedServer?.id ?? null,
    selectServer
  };
}
