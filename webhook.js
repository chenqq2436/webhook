const express = require("express");

const crypto = require("crypto");
const { spawn } = require("child_process");

// 签名
const SECRET = "123456";
// 发送邮件模块
const sendMail = require("./sendMail");

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

// 接受githubpush的hook
app.post("/webhook", function (req, res) {
  console.log("------方法和地址------", req.method, req.url);
  let buffers = [];
  req.on("data", (buffer) => {
    console.log("------开始接收流------");
    buffers.push(buffer);
  });
  req.on("end", () => {
    console.log("------流接收结束-----");
    let body = Buffer.concat(buffers);
    let event = req.headers["x-github-event"]; // 类型 push
    let signature = req.headers["x-hub-signature"]; // 签名采用hash算法 github请求来的时候，要传递请求体body，还会传来一个signature过来，你需要验证签名是否有效
    // 判断签名是否合法
    if (signature !== sign(body)) {
      console.log("-------签名信息不合法-----");
      return res.end("Not Allowed");
    }
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: true }));
    // 是push时间
    if (event == "push") {
      // 拿到推送信息
      let payload = JSON.parse(body);
      console.log("------参数信息开始-----");
      console.log(payload);
      console.log("------参数信息结束-----");
      // 开启子进程去执行对应的脚本 目前通过仓库名称匹配
      const child = spawn("sh", [`./${payload.repository.name}.sh`]);
      const logBuffers = [];
      child.stdout.on("data", function (buffer) {
        console.log("------构建中-----");
        logBuffers.push(buffer);
      });
      child.stdout.on("end", function () {
        const logs = Buffer.concat(logBuffers).toString();
        console.log("--------构建完成-------", logs);
        sendMail(`
            <h1>部署日期: ${new Date()}</h1>
            <h2>部署人: ${payload.pusher.name}</h2>
            <h2>部署邮箱: ${payload.pusher.email}</h2>
            <h2>提交信息: ${
              payload.head_commit && payload.head_commit["message"]
            }</h2>
            <h2>布署日志: ${logs.replace("\r\n", "<br/>")}</h2>
        `);
      });
    }
  });
  req.on("error", (err) => {
    console.log("接收流错误了", err);
  });
});

app.listen(4000, () => {
  console.log("webhook 服务已启动在4000端口");
});
