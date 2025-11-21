import { RedisRefreshValue } from './auth.types';

export type ISessionData = {
  userAgent: string;
  device: string;
  location: {
    ip: string;
    city: string;
    country: string;
  };
};

export type RawRedisToken = {
  key: string;
  value: RedisRefreshValue | null;
};

export type StrictRedisToken = {
  key: string;
  value: RedisRefreshValue;
};
