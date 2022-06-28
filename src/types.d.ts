export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequireBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
export type Roles = 'USER' | 'ADMIN';
