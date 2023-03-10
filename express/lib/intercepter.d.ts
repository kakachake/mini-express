type handler = (ctx: any, next: () => Promise<void>) => Promise<void> | void;
declare class Intercepter {
    methods: handler[];
    constructor();
    run(ctx: any): () => Promise<void>;
    use(handler: handler): void;
}
declare function wait(time: number): Promise<unknown>;
declare const inter: Intercepter;
declare const task: (id: any) => (ctx: any, next: any) => Promise<void>;
