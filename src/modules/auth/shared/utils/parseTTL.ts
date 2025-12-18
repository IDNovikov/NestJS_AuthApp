type TimeUnit = 's' | 'm' | 'h' | 'd';

const MULTIPLIERS: Record<TimeUnit, number> = {
  s: 1,
  m: 60,
  h: 60 * 60,
  d: 60 * 60 * 24,
};

export function parseTTL(value: string): number {
  if (!value) {
    throw new Error('TTL value is empty');
  }

  const match = value.trim().match(/^(\d+)([smhd])$/i);

  if (!match) {
    throw new Error(
      `Invalid TTL format: "${value}". Expected formats: 15m, 7d, 1h, 30s`,
    );
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase() as TimeUnit;

  return amount * MULTIPLIERS[unit];
}
