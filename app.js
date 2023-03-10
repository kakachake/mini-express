const express = require("my_express");
const app = express();
async function wait(time) {
  return new Promise((r) => {
    setTimeout(() => {
      r(1);
    }, time);
  });
}
app.get(
  "/",
  async (req, res, next) => {
    console.log("/ 1");
    await next();
    console.log("/ 1 end");
  },
  async (req, res, next) => {
    console.log("/ 2");
    await wait(1000);
    await next();
    console.log("/ 2 end");
  },
  async (req, res, next) => {
    console.log("/ 3");
    next();
    console.log("/ 3 end");
  }
);

app.get("/", (req, res, next) => {
  console.log("/ end");
  res.end("/ ");
});

app.get("/foo", (req, res, next) => {
  console.log("foo1");
  next();
});

app.get("/foo", (req, res, next) => {
  console.log("foo2");
  next();
});

app.get("/foo", (req, res, next) => {
  console.log("foo3");
  res.end("get /foo ");
});

// app.get("/about", (req, res) => {
//   res.end("get /about");
// });

// app.get("/ab?cd", (req, res) => {
//   res.end("get /ab?cd");
// });

// app.get("/ab*cd", (req, res) => {
//   res.end("get /ab*cd");
// });

// app.get("/users/:userId/books/:bookId", (req, res) => {
//   console.log(req.params);
//   res.end(JSON.stringify(req.params));
// });

// app.post("/about", (req, res) => {
//   res.end("post /about");
// });

// app.patch("/about", (req, res) => {
//   res.end("patch /about");
// });

// app.delete("/about", (req, res) => {
//   res.end("delete /about");
// });

app.listen(3300, () => {
  console.log("Listening on port %d", 3300);
});
