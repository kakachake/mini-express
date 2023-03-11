import Router from "./router";
import { Handler } from "type";
declare class App {
    _router: any;
    listen(...args: any[]): void;
    use(path: any, ...handlers: Handler[]): void;
}
export { Router };
export default App;
