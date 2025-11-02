import { randomBytes, randomInt } from 'crypto';

export const get6NumberCode = (): string => {
  return String(randomInt(100000, 999999));
};

export const getRandomPass = (length: number): string => {
  return randomBytes(length).toString('base64');
};
