import { Route } from "type";
declare class Router {
    stack: Route[];
    get(path: any, handler: any): void;
    handle(req: any, res: any): void | Promise<void>;
}
export default Router;
