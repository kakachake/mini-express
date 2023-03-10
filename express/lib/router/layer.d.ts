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
    constructor(path: any, handler: any);
    match(pathname: any): boolean;
}
export default Layer;
