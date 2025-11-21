import { ISessionData } from './session.types';

export type UnionJWTpayload = {
  sub: number;
  email: string;
  role: roles;
};

type roles = 'ADMIN' | 'USER';

export interface RedisRefreshValue {
  hash: string;
  jti: string;
  sessionData: ISessionData;
  createdAt: number;
}

export type IRefreshPayload = UnionJWTpayload & { deviceId: string };
export type IAccessPayload = UnionJWTpayload & {
  jti: string;
};
