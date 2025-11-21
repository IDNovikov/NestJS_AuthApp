export function redisRefreshString(id: number): string;

export function redisRefreshString(id: number, deviceId: string): string;

export function redisRefreshString(id: number, deviceId?: string): string {
  if (!id && !deviceId) return `refreshToken`;
  if (!deviceId) return `refreshToken:${id}`;
  return `refreshToken:${id}:${deviceId}`;
}
