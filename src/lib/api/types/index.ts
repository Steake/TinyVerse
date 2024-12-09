export * from './agent';
export * from './environment';
export * from './story';

export type UUID = string;

export interface QueryParams {
  [key: string]: string | number | boolean | undefined;
}
