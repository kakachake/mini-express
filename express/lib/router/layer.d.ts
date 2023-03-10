import { Handler } from "type";
declare class Layer {
    path: string;
    handlers: Handler[];
    regexp: RegExp;
    keys: {
        name: string;
    }[];
    params: {
        [key: string]: string;
    };
    constructor(path: string, handlers: Handler[]);
    match(pathname: any): boolean;
    run(req: any, res: any, next: any): Promise<void>;
}
export default Layer;
