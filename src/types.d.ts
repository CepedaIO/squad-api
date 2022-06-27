import {JWT} from "./services/jwt";

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequireBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

export interface AppContext {
  account?: JWT['account'];
}

export type Authenticated = RequireBy<AppContext, 'account'>;
export type Roles = 'USER' | 'ADMIN';
