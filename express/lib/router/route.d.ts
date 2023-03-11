import { LayerWithMethod } from "type";
declare class Route {
    stack: LayerWithMethod[];
    constructor();
    dispatch(req: any, res: any, out: any): Promise<void>;
}
export default Route;
