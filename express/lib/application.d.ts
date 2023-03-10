declare class App {
    #private;
    get(path: string, handler: Function): void;
    listen(...args: any[]): void;
}
export default App;
