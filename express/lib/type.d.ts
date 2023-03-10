import App from "application";
import methods from "methods";
import Router from "router";
import Layer from "router/layer";
export interface Route {
    path: string;
    method: string;
    handler: Handler;
    layer: Layer;
}
interface Req {
}
interface Res {
}
export type Handler = (req: Req, res: Res) => Promise<void> | void;
export type WithRoutes<T> = T & {
    [K in typeof methods[number]]: Handler;
};
export type AppIns = WithRoutes<App>;
export type RouterIns = WithRoutes<Router>;
export type LayerWithMethod = Layer & {
    method: string;
};
export {};
