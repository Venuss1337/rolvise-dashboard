import type { InfractionAppeal } from '../api/types';

export type LocalInfraction = InfractionAppeal & {
  attachments: string[];
};

const STORAGE_KEY = 'rolvise_local_infractions';
export const LOCAL_INFRACTIONS_CHANGED_EVENT = 'rolvise:local-infractions-changed';

export function getLocalInfractions(communityId: string) {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const infractions = stored ? (JSON.parse(stored) as LocalInfraction[]) : [];

    return infractions.filter((infraction) => infraction.communityId === communityId);
  } catch {
    return [];
  }
}

export function saveLocalInfraction(infraction: LocalInfraction) {
  if (typeof window === 'undefined') {
    return;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  const infractions = stored ? (JSON.parse(stored) as LocalInfraction[]) : [];
  const nextInfractions = [infraction, ...infractions];

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextInfractions));
  window.dispatchEvent(new Event(LOCAL_INFRACTIONS_CHANGED_EVENT));
}
