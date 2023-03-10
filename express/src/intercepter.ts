type handler = (ctx, next: () => Promise<void>) => Promise<void> | void;

class Intercepter {
  methods: handler[];
  constructor() {
    this.methods = [];
  }

  run(ctx) {
    return this.methods.reduceRight(
      (a: () => Promise<void>, b) => {
        return async () => {
          await Promise.resolve(b(ctx, a));
        };
      },
      () => Promise.resolve()
    );
  }

  use(handler: handler) {
    this.methods.push(handler);
  }
}

async function wait(time: number) {
  return new Promise((r) => {
    setTimeout(() => {
      r(1);
    }, time);
  });
}

const inter = new Intercepter();

const task = function (id) {
  return async (ctx, next) => {
    console.log(`task ${id} begin`);
    ctx.count++;
    await wait(1000);
    console.log(`count: ${ctx.count}`);
    await next();
    console.log(`task ${id} end`);
  };
};

// 将多个任务以拦截切面的方式注册到拦截器中
inter.use(task(0));
inter.use(task(1));
inter.use(task(2));
inter.use(task(3));
inter.use(task(4));

(async () => {
  const ctx = { count: 0 };
  await inter.run(ctx)();
  console.log(ctx);
})();
