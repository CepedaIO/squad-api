import {randomBytes} from "crypto";

export const createKey = (length: number = 16) =>
  randomBytes(length).toString('hex');
