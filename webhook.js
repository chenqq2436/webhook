const express = require("express");
const crypto = require("crypto");

// 签名
const SECRET = "123456";
// 验证签名
function sign(body) {
  return `sha1=${crypto.createHmac("sha1", SECRET).update(body).digest("hex")}`;
}

const app = express();

app.post("/webhook", function (req, res) {
  console.log("方法和地址", req.method, req.url);
  let buffers = [];
  req.on("data", (buffer) => {
    buffers.push(buffer);
  });
  res.on("end", () => {
    let body = Buffer.concat(buffers);
    let event = req.header["x-gitHub-event"]; // 类型 push
    let signature = req.header["x-hub-signature"]; // 签名采用hash算法 github请求来的时候，要传递请求体body，还会传来一个signature过来，你需要验证签名是否有效
    // 判断签名是否合法
    if (signature !== sign(body)) {
      return res.end("Not Allowed");
    }
  });
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ ok: true }));
});

app.listen(4000, () => {
  console.log("webhook 服务已启动在4000端口");
});
