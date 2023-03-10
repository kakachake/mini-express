import { Handler } from "type";
declare class Layer {
    path: string;
    handler: Handler;
    regexp: RegExp;
    keys: {
        name: string;
    }[];
    params: {
        [key: string]: string;
    };
    isUseMiddleware: boolean;
    constructor(path: string, handler: Handler);
    match(pathname: string): boolean;
}
export default Layer;
