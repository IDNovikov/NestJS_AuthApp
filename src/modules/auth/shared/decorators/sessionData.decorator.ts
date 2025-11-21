import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { DeviceParser } from '../utils/deviceParser.util';
import { LocationParser } from '../utils/locationParser.util';

export type ISessionData = {
  userAgent: string;
  device: string;
  location: {
    ip: string;
    city: string;
    country: string;
  };
};
export const SessionData = createParamDecorator(
  async (_, ctx: ExecutionContext): Promise<ISessionData> => {
    const headers = ctx.switchToHttp().getRequest().headers;
    const userAgent = headers['user-agent'] || 'Unknown';
    const ip =
      (headers['x-forwarded-for'] as string)?.split(',')[0] || 'Unknown';
    const device = DeviceParser(userAgent);
    const { city, country } = await LocationParser(ip);
    const data = { userAgent, device, location: { ip, city, country } };
    return data;
  },
);
