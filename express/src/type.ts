export interface Route {
  path: string;
  method: string;
  handler: Function;
}

export type handler = () => Promise<void> | void;
