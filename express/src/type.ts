import App from "application";
import methods from "methods";
import Router from "router/index";
import Layer from "router/layer";

export interface Route {
  path: string;
  method: string;
  handler: Handler;
  layer: Layer;
}

interface Req {}
interface Res {}

export type Handler = (
  req: Req,
  res: Res,
  next: Handler
) => Promise<void> | void;
class Class {}
export type WithRoutes<T> = T & {
  [K in typeof methods[number]]: (path, ...Handler) => void;
};

export type AppIns = WithRoutes<App>;
export type RouterIns = WithRoutes<Router>;

export type LayerWithMethod = Layer & {
  method: string;
};
