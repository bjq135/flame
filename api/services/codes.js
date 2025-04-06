const dbUtil = require('../../utils/db.js');
const commonUtil = require('../../utils/common.js');

class CodesService {
  /**
   * 获取 logs 分页
   * @param {integer} page 页面
   * @param {integer} perPage 每页条数 
   * @param {integer} userId 用户ID，默认 0 所用用户
   * @returns {[]} 图片列表
   */
  async getCodes(page = 1, perPage = 10, userId = 0) {
    let replacements = {};
    replacements.start = perPage * (page - 1);
    replacements.offset = parseInt(perPage);
    replacements.user_id = userId;

    let sql = 'SELECT * FROM tb_code WHERE id>0';
    if (userId) {
      sql += ` AND user_id=:user_id`
    }
    sql += ` ORDER BY id DESC LIMIT :start,:offset`;
    return await dbUtil.execute(sql, replacements);
  }

  /**
   * 获取 logs 数量
   * @param {integer} page 页面
   * @param {integer} perPage 每页条数 
   * @param {integer} userId 用户ID，默认 0 所用用户
   * @returns {[]} 图片列表
   */
  async getCodesCounter(page = 1, perPage = 10, userId = 0) {
    let replacements = {};
    replacements.start = perPage * (page - 1);
    replacements.offset = parseInt(perPage);
    replacements.user_id = userId;

    let sql = 'SELECT count(*) as count FROM tb_code WHERE id>0';
    if (userId) {
      sql += ` AND user_id=:user_id`
    }
    let [rows] = await dbUtil.execute(sql, replacements);
    return rows.length ? rows[0].count : 0;
  }

  /**
   * 创建验证码
   * @param {int} length 验证码长度
   */
  createCode(length = 4) {
    return Math.random().toString().substring(2, 2 + length);
  }

  /**
   * 检查验证码是否可用
   * new Date(codeItem.expired_at) < new Date() //验证码已超时
   * @param {string} account 手机或者邮箱
   * @param {string} code 验证码
   */
  async isAvailable(account, code) {
    let replacements = { account, code };
    let sql = `
      SELECT * FROM tb_code 
      WHERE 
      account=:account 
      AND code=:code 
      AND is_used=0 
      AND expired_at>DATE_FORMAT(NOW(), '%Y-%c-%d %H:%i:%s')`;
    let [res, fields] = await dbUtil.execute(sql, replacements);
    return res.length ? true : false;
  }

  /**
   * 保存验证码
   * @param {string} account 手机或者邮箱
   * @param {string} code 验证码
   * @param {string} flag 标记，register，login，reset-password
   * @param {string} ip IP地址
   */
  async saveCode(account, code, flag, ip) {
    let time = Date.now();
    let replacements = {
      code,
      account: account,
      is_used: 0,
      ip: ip,
      flag: flag,
      created_at: commonUtil.formatDateTime(time),
      expired_at: commonUtil.formatDateTime(time + 10 * 60 * 1000)
    };
    let sql = `
      INSERT INTO 
      tb_code( code, account, is_used, ip, flag, created_at, expired_at)
      VALUE( :code, :account, :is_used, :ip, :flag, :created_at, :expired_at);
    `;
    const [res, fields] = await dbUtil.execute(sql, replacements);
    return res;
  }

  /**
   * 设置验证码被使用过
   * @param {string} account 手机或者邮箱
   * @param {string} code 验证码
   */
  async updateCode(account, code) {
    let sql = `UPDATE tb_code SET is_used=1 WHERE account=:account AND code=:code`;
    let replacements = { account, code };
    let [res, fields] = await dbUtil.execute(sql, replacements);
    return res;
  }

}

module.exports = CodesService;
