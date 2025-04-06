const i18n = require('i18n');

const config = require("../../config.js");
const Validator = require('hot-validator');
const commonUtil = require('../../utils/common.js');
const dbUtil = require('../../utils/db.js');

const AuthService = require("../services/auth.js");
const UsersService = require('../services/users.js');
const CodesService = require('../services/codes.js');
// const LogsService = require('../assets/logs.js');
const MailService = require('../services/mail.js');


async function login(req, res, next){
  let { account, password } = req.body;

  // 验证参数
  var validator = new Validator();
  var rules = {
    account: { type: 'string', min: 5, max: 50 },
    password: { type: 'string', min: 6, max: 50 }
  };

  var errors = validator.validate(req.body, rules);
  if (errors && errors.length) {
    let data = { error:  errors[0].message };
    res.status(400).send(data);
    return;
  }

  // 处理账户和密码
  password = commonUtil.md5(password);

  // 确认账户必须是手机号或者邮箱
  if (!commonUtil.isEmail(account) && !commonUtil.isMobile(account)) {
    let data = { error: i18n.__('account is illegal') };
    res.status(400).send(data);
    return;
  }

  // 验证账户密码
  var usersService = new UsersService();
  var user = await usersService.getUserByAccountAndPassword(account, password);
  if (!user) {
    let data = { error: i18n.__("incorrect username or password") };
    res.status(400).send(data);
    return;
  }

  // 检查是否允许登录
  if (config.auth.allowLogin == 0 && user.type == 1) {
    let data = { error: i18n.__('not allow login') };
    res.status(403).send(data);
    return;
  }

  // 生成返回信息
  var authService = new AuthService();
  var token = authService.createToken(user.id);
  var userInfo = await usersService.getPublicUserInfo(user.id);

  // 生成 session，在前后端不分离项目中使用
  req.session.userId = userInfo.id;

  res.cookie('_csrf', Math.round(Math.random()*999999), { maxAge: 60 * 1000 });

  let data = { token, user: userInfo };
  res.status(200).send(data);
}


async function sendCode(req, res, next){
  let { account, flag } = req.body;

  var validator = new Validator();
  var rules = {
    account: { type: 'string', min: 5, max: 50 },
    flag: { type: 'string', min: 6, max: 50 }
  };

  var errors = validator.validate(req.body, rules);
  if (errors && errors.length) {
    let data = { error:  errors[0].message };
    res.status(400).send(data);
    return;
  }

  // 确认账户必须是手机号或者邮箱
  if (!commonUtil.isEmail(account) && !commonUtil.isMobile(account)) {
    res.status(403).json({ error: i18n.__('account is illegal') });
    return;
  }

  // 检查是否允许注册
  if (config.auth.allowRegister == 0 && flag == 'register') {
    res.status(403).json({ error: i18n.__('not allow register') });
    return;
  }

  // IP 限流
  const codesService = new CodesService();
  var code = codesService.createCode(6);
  codesService.saveCode(account, code, flag, req.ip);

  // 邮件验证码
  if (commonUtil.isEmail(account)) {
    try {
      var mailService = new MailService();

      await mailService.sendCode(account, code);
      res.json({ message: i18n.__('mail sending success') });
    } catch (error) {
      res.json({ error: i18n.__('mail sending failed'), detail: error.message });
    }
    return;
  } else {
    res.status(500).json({ error: i18n.__('sms is coming soon') });
  }

}


async function register(req, res, next) {
  // 检查是否允许注册
  if (config.auth.allowRegister == 0) {
    res.status(403).json({ error: i18n.__('prohibit_register') });
    return;
  }

  // 验证参数
  var validator = new Validator();
  var rules = {
    account: { type: 'string', min: 6, max: 60 },
    nickname: { type: 'string', min: 2, max: 20, required: false },
    password: { type: 'string', min: 6, max: 50},
    code: { type: 'string', min: 3, max: 10 }
  };
  var errors = validator.validate(req.body, rules);
  if (errors && errors.length) {
    res.status(400).json({ error: errors[0]['message'] });
    return;
  }

  // 检测验证码
  var codesService = new CodesService();
  if (false == await codesService.isAvailable(req.body.account, req.body.code)) {
    res.status(401).json({ error: i18n.__("code is not exist or expired") });
    return;
  }
  await codesService.updateCode(req.body.account, req.body.code);

  // 1.手机号已经注册，直接返回用户信息和token
  var usersService = new UsersService();
  var authService = new AuthService();
  var someone = await usersService.getUserByAccount(req.body.account);
  if (someone) {
    var token = authService.createToken(someone.id);
    var userInfo = await usersService.getPublicUserInfo(someone.id);
    res.json({ token, isNewUser: false, user: userInfo });
    return;
  }

  // 2. 未注册的话，创建用户数据
  var user = {
    account: req.body.account,
    nickname: req.body.nickname,
    password: req.body.password,
  };

  try {
    var userId = await usersService.createUser(user);
    if (userId) {
      var token = authService.createToken(userId);
      var userInfo = await usersService.getPublicUserInfo(userId);
      res.json({ token, isNewUser: true, user: userInfo });
    } else {
      throw i18n.__("500")
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


async function checkCode(req, res, next){
  let data = {account, code} = req.body;

  // 检查验证码是否存在
  let sql = `
    SELECT id,code,expired_at
    FROM tb_code 
    WHERE
    account=:account AND code=:code AND is_used=0 AND expired_at>:expired_at`;

  data.expired_at = commonUtil.formatDateTime(Date.now());

  let [rows, fields] = await dbUtil.execute(sql, data);
  if (rows && rows.length) {
    res.json({ code: rows[0].code, expired_at: rows[0].expired_at });
    return;
  }

  res.status(404).json({ error: i18n.__('code is not exist or expired') });
}


async function resetPassword(req, res, next) {
  let data = {account, password, code} = req.body;

  // 验证参数
  var validator = new Validator();
  var rules = {
    account: { type: 'string', min: 5, max: 50 },
    password: { type: 'string', min: 6, max: 50},
    code: { type: 'string', min: 3, max: 10 }
  };
  var errors = validator.validate(data, rules);
  if (errors && errors.length) {
    res.status(400).json({ error: errors[0]['message'] });
    return;
  }

  // 检测验证码
  var codesService = new CodesService();
  if (false == await codesService.isAvailable(account, code)) {
    res.status(401).json({ error: i18n.__("code is not exist or expired") });
    return;
  }
  await codesService.updateCode(account, code);

  data.password = commonUtil.md5(data.password);
  
  var sql = `UPDATE tb_user SET password=:password WHERE email=:account OR mobile=:account`;
  var [results, fields] = await dbUtil.execute(sql, data);
  if (results.affectedRows == 1) {
    res.status(200).json({ message: i18n.__('update success') });
  } else {
    res.status(500).json({ error: i18n.__('update failed') });
  }
}


module.exports = {
  login,
  sendCode,
  register,
  checkCode,
  resetPassword
};
