const jwt = require('jsonwebtoken');

const config = require("../../config.js");


class AuthService {
  /**
   * 生成 JWT Token
   * @param {object} user 用户对象，包含 id
   */
  createToken(id) {
    // 生成 token
    var payload = {
      exp: Math.floor(Date.now() / 1000) + (12 * 60 * 60), // 过期时间
      iat: Math.floor(Date.now() / 1000) - 30, // 签发时间
      data: { id }
    };
    var token = jwt.sign(payload, config.jwt.secret);
    return token;
  }

}

module.exports = AuthService;
