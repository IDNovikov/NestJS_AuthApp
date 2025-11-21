const COOLDOWN_STEPS = [
  5 * 60 * 1000, // 5 мин
  15 * 60 * 1000, // 15 мин
  2 * 60 * 60 * 1000, // 2 часа
  6 * 60 * 60 * 1000, // 6 часов
  2 * 24 * 60 * 60 * 1000, // 2 дня
];

export function getCooldownByLevel(level: number): number {
  return COOLDOWN_STEPS[Math.min(level, COOLDOWN_STEPS.length - 1)];
}

export function timeHumanize(time: number): string {
  if (time < 60000) return `${Math.floor(time / 1000)} sec`;
  if (time > 60000 && time < 60 * 60 * 1000)
    return `${Math.floor(time / 60000)} min`;
  if (time > 60 * 60 * 1000 && time < 24 * 60 * 60 * 1000)
    return `${Math.floor(time / 3600000)} hours ${Math.floor(time / 60000)} min  `;
  if (time > 24 * 60 * 60 * 1000)
    return `${Math.floor((time / 24) * 60 * 60 * 1000)} days ${Math.floor(time / 3600000)} hours ${Math.floor(time / 60000)} min  `;
  return `tooooo long`;
}
