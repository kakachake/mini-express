import { Handler, LayerWithMethod } from "type";
import Layer from "./layer";
declare class Router {
    stack: (LayerWithMethod | Layer)[];
    handle(req: any, res: any): Promise<void>;
    use(path: any, handlers: Handler[]): void;
}
export default Router;
