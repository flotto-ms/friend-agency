export type OptionalKeys<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? K : never }[keyof T];
export type RequiredKeys<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? never : K }[keyof T];
export type Nullable<T> = { [P in keyof T]: T[P] | null };
export type NullOptional<T> = Omit<T, OptionalKeys<T>> & Nullable<Pick<T, OptionalKeys<T>>>;
export type StringKeys<T> = { [K in keyof T]: T[K] extends string ? K : never }[keyof T];
export type ObjectKeys<T> = { [K in keyof T]: T[K] extends object ? K : never }[keyof T];
