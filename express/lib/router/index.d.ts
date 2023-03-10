import { LayerWithMethod } from "type";
declare class Router {
    stack: LayerWithMethod[];
    handle(req: any, res: any): void | Promise<void>;
}
export default Router;
