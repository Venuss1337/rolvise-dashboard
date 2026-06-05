import { delay } from './mock-api';

export type SessionRange = '24h' | '7d' | '30d' | '90d';

export type SessionPlayerPoint = {
  label: string;
  players: number;
};

type SessionAnalyticsFilters = {
  communityId: string;
  range: SessionRange;
};

const rangeConfig: Record<SessionRange, { points: number; step: number; labelEvery: number }> = {
  '24h': { points: 24, step: 1, labelEvery: 4 },
  '7d': { points: 7, step: 1, labelEvery: 1 },
  '30d': { points: 30, step: 1, labelEvery: 5 },
  '90d': { points: 30, step: 3, labelEvery: 5 }
};

const communitySeeds: Record<string, number> = {
  'liberty-county-rp': 17,
  'river-city-response': 9,
  'statewide-operations': 23
};

export const fakeSessionAnalytics = {
  async getPlayersOverTime({ communityId, range }: SessionAnalyticsFilters) {
    await delay(250);

    const seed = communitySeeds[communityId] ?? 12;
    const config = rangeConfig[range];

    return Array.from({ length: config.points }, (_, index) => {
      const wave = Math.sin((index + seed) / 2.6) * 10;
      const rush = Math.cos((index + seed) / 5) * 7;
      const trend = range === '24h' ? index * 0.35 : index * 0.7;
      const players = Math.max(0, Math.round(34 + seed + wave + rush + trend));

      return {
        label: formatRangeLabel(range, index, config.step, config.labelEvery),
        players
      };
    });
  }
};

function formatRangeLabel(range: SessionRange, index: number, step: number, labelEvery: number) {
  if (range === '24h') {
    return `${String(index).padStart(2, '0')}:00`;
  }

  const day = index * step + 1;

  if ((index + 1) % labelEvery !== 0 && index !== 0) {
    return '';
  }

  return `Day ${day}`;
}
