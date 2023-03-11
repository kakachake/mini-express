import { LayerWithMethod } from "type";
declare class Router {
    stack: LayerWithMethod[];
    handle(req: any, res: any): void;
}
export default Router;
