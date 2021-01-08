const express = require("express");
const bodyParser = require("body-parser");

const crypto = require("crypto");
const { spawn } = require("child_process");

// 签名
const SECRET = "123456";

// 验证签名
function sign(body) {
  const secret = `sha1=${crypto
    .createHmac("sha1", SECRET)
    .update(body)
    .digest("hex")}`;
  console.log("签名信息是---", secret);
  return secret;
}

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// 接受githubpush的hook
app.post("/webhook", function (req, res) {
  console.log("方法和地址", req.method, req.url);
  console.log(req.params, req.body);
  // let buffers = [];
  // req.on("data", (buffer) => {
  //   console.log("开始接收流");
  //   buffers.push(buffer);
  // });
  // req.on("error", (err) => {
  //   console.log("接收流错误了", err);
  // });
  // req.on("end", () => {
  //   console.log("流接收结束");
  //   let body = Buffer.concat(buffers);
  //   let event = req.headers["x-github-event"]; // 类型 push
  //   let signature = req.headers["x-hub-signature"]; // 签名采用hash算法 github请求来的时候，要传递请求体body，还会传来一个signature过来，你需要验证签名是否有效
  //   // 判断签名是否合法
  //   if (signature !== sign(body)) {
  //     return res.end("Not Allowed");
  //   }
  //   // 是push时间
  //   if (event == "push") {
  //     // 拿到推送信息
  //     let payload = JSON.parse(body);
  //     console.log("------参数信息-----");
  //     console.log(payload);
  //     // 开启子进程去执行对应的脚本 目前通过仓库名称匹配
  //     const child = spawn("sh", [`./${payload.repository.name}.sh`]);
  //     const logBuffers = [];
  //     child.stdout.on("data", function (buffer) {
  //       logBuffers.push(buffer);
  //     });
  //     child.stdout.on("end", function () {
  //       const log = Buffer.concat(logBuffers);
  //       console.log("--------日志信息-------", log.toString());
  //     });
  //   }
  // });
  let body = req.body;
  let event = req.headers["x-github-event"]; // 类型 push
  let signature = req.headers["x-hub-signature"]; // 签名采用hash算法 github请求来的时候，要传递请求体body，还会传来一个signature过来，你需要验证签名是否有效
  // 判断签名是否合法
  if (signature !== sign(body.toString(), "utf8")) {
    console.log("签名不合法啊----", event, signature);
    return res.end("Not Allowed");
  }
  // 是push时间
  if (event == "push") {
    // 拿到推送信息
    // let payload = JSON.parse(body);
    let payload = body;
    console.log("------参数信息-----");
    console.log(payload);
    // 开启子进程去执行对应的脚本 目前通过仓库名称匹配
    const child = spawn("sh", [`./${payload.repository.name}.sh`]);
    const logBuffers = [];
    child.stdout.on("data", function (buffer) {
      logBuffers.push(buffer);
    });
    child.stdout.on("end", function () {
      const log = Buffer.concat(logBuffers);
      console.log("--------日志信息-------", log.toString());
    });
  }
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ ok: true }));
});

app.listen(4000, () => {
  console.log("webhook 服务已启动在4000端口");
});
