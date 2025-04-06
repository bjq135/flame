const nodemailer = require('nodemailer');

const i18n = require('i18n');
const config = require("../../config.js");

class MailService {
  // 发送验证码
  async sendCode(email, code) {
    var title = i18n.__('verification code') + ': ' + code;
    var content = `<div>`+ i18n.__('verification code') +`：${code}</div>`;
    try {
      await this.send(email, title, content);
    } catch (error) {
      throw error;
    }
  }

  // 邮件发送
  send(email, title, content) {
    let transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port, // SMTP 端口
      secureConnection: true, // 使用了 SSL
      auth: {
        user: config.smtp.username,
        pass: config.smtp.password,
      }
    });

    let mailOptions = {
      from: config.smtp.username, // sender address
      to: email, // list of receivers
      subject: title,
      // 发送text或者html格式
      // text: 'Hello 你好啊', // plain text body
      html: content // html body
    };

    return new Promise(function (reslove, reject) {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          reject(error);
        } else {
          reslove(info.messageId);
        }
      });
    });
  }


}

module.exports = MailService;
