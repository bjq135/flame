const commonUtil = require("../../../utils/common.js");
const dbUtil = require("../../../utils/db.js");

module.exports = class LogsService {
  /**
   * 获取 logs 分页
   * @param {integer} page 页面
   * @param {integer} perPage 每页条数 
   * @param {integer} userId 用户ID，默认 0 所用用户
   * @returns {[]} 图片列表
   */
  async getLogs(page = 1, perPage = 10, userId = 0) {
    let replacements = {};
    replacements.start = perPage * (page - 1);
    replacements.offset = parseInt(perPage);
    replacements.user_id = userId;

    let sql = 'SELECT * FROM tb_log WHERE id>0';
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
  async getLogsCounter(page = 1, perPage = 10, userId = 0) {
    let replacements = {};
    replacements.start = perPage * (page - 1);
    replacements.offset = parseInt(perPage);
    replacements.user_id = userId;

    let sql = 'SELECT count(*) as count FROM tb_log WHERE id>0';
    if (userId) {
      sql += ` AND user_id=:user_id`
    }
    let [rows] = await dbUtil.execute(sql, replacements);
    return rows.length ? rows[0].count : 0;
  }


  /**
   * 获取一条记录
   * @param {string} user_id 用户ID
   * @param {string} ip IP地址
   * @param {string} action action 标志
   * @param {string} date 日期
   * @returns {{id,user_id,ip,action,count,created_at}}
   */
  async getLog(user_id = 0, ip, action = 'test', date) {
    let sql = `SELECT * FROM tb_log 
          WHERE user_id=:user_id AND ip=:ip AND action=:action
          AND date(created_at)=:created_at`;
    let data = {
      user_id: user_id,
      ip: ip,
      action: action,
      created_at: date ? date : commonUtil.formatDate()
    };
    let [rows] = await dbUtil.execute(sql, data);
    return rows.length ? rows[0] : null;
  }

  /**
   * 新增或增加记录
   * @param {string} user_id 用户ID
   * @param {string} ip IP地址
   * @param {string} action action 标志
   * @param {string} date 日期
   */
  async createOrIncrease(user_id = 0, ip, action = 'test', date) {
    let sql = '';
    let data = {
      user_id: user_id,
      ip: ip,
      action: action,
      created_at: date ? date : commonUtil.formatDateTime
    };
    let log = await this.getLog(user_id, ip, action, date);

    // 已有记录，count++
    if (log) {
      sql = `UPDATE tb_log SET count=:count 
              WHERE user_id=:user_id AND ip=:ip AND action=:action
              AND date(created_at)=:created_at`;
      data.count = log.count + 1;
      await dbUtil.execute(sql, data);
      return;
    }

    // 没有记录，新建
    sql = `INSERT INTO tb_log (user_id,ip,action,count,created_at)
            VALUES (:user_id,:ip,:action,:count,:created_at)`;
    data.count = 1;
    let [res] = await dbUtil.execute(sql, data);
    return;
  }






}
