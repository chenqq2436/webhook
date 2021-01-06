const express = require("express");
const app = express();

app.post("/webhook", function (req, res) {
  console.log("方法和地址", req.method, req.url);
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ ok: true }));
});

app.listen(4000, () => {
  console.log("webhook 服务已启动在4000端口");
});
