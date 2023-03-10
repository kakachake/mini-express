const express = require("my_express");
const app = express();

app.get("/", (req, res) => {
  res.end("hello world");
});

app.get("/about", (req, res) => {
  res.end("get /about");
});

app.listen(3030, () => {
  console.log("Listening on port %d", 3030);
});
