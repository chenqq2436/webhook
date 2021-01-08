const nodemailer = require("nodemailer");
let transporter = nodemailer.createTransport({
  // host: 'smtp.ethereal.email',
  service: "qq", // 使用了内置传输发送邮件 查看支持列表：https://nodemailer.com/smtp/well-known/
  port: 465, // SMTP 端口
  secureConnection: true, // 使用了 SSL
  auth: {
    user: "1252321427@qq.com",
    // 这里密码不是qq密码，是你设置的smtp授权码 qq邮箱在设置-账户 - IMP/SMTP中开启会给一个授权码
    pass: "krjepmqobsngggia",
  },
});

function sendMail(message) {
  let mailOptions = {
    from: '"1252321427" <1252321427@qq.com>', // 发送地址
    to: "1252321427@qq.com", // 接收者
    subject: "部署通知", // 主题
    html: message, // 内容主体
  };
  console.log("--------开始发送邮件------");
  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Message sent: %s", info.messageId);
  });
}
module.exports = sendMail;
