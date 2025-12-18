import * as checkPassword from './checkPassword.util';
import { get6NumberCode, getRandomPass } from './getRandomCodes.util';
import DeviceParser from './deviceParser.util';
import LocationParser from './locationParser.util';
import parseTTL from './parseTTL';
export const utils = {
  parseTTL,
  checkPassword,
  get6NumberCode,
  getRandomPass,
  DeviceParser,
  LocationParser,
};
