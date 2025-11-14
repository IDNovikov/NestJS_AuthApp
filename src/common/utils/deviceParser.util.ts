import { UAParser } from 'ua-parser-js';

export function DeviceParser(userAgent: string) {
  const parser = new UAParser(userAgent);
  const deviceType = parser.getDevice().type || 'desktop';
  const os = parser.getOS().name || 'Unknown OS';
  const device =
    deviceType === 'desktop'
      ? 'Desktop'
      : `${os} ${deviceType.charAt(0).toUpperCase() + deviceType.slice(1)}`;
  return device;
}
