const express = require("my_express");
const app = express();

app.get("/", (req, res) => {
  res.end("hello world");
});

app.get("/about", (req, res) => {
  res.end("get /about");
});

app.get("/ab?cd", (req, res) => {
  res.end("get /ab?cd");
});

app.get("/ab*cd", (req, res) => {
  res.end("get /ab*cd");
});

app.get("/users/:userId/books/:bookId", (req, res) => {
  console.log(req.params);
  res.end(JSON.stringify(req.params));
});

app.post("/about", (req, res) => {
  res.end("post /about");
});

app.patch("/about", (req, res) => {
  res.end("patch /about");
});

app.delete("/about", (req, res) => {
  res.end("delete /about");
});

app.listen(3300, () => {
  console.log("Listening on port %d", 3300);
});
