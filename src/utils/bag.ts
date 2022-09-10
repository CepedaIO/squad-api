import {randomBytes} from "crypto";

export const createKey = () => randomBytes(16).toString('hex');
