const commonUtil = require('../../utils/common.js');
const dbUtil = require('../../utils/db.js');

module.exports = class UsersService {
  /**
   * 获取用户信息
   * @param {integer} userId 用户ID
   * @returns {object} user 对象； null； 
   */
  async getUserById(userId) {
    let sql = "SELECT * FROM tb_user WHERE id=:id";
    let [user, fields] = await dbUtil.execute(sql, { id: userId });
    return user.length ? user[0] : null;
  }

  /**
   * 获取用户公开信息
   * @param {integer} userId 用户ID
   * @returns {object} user 对象； null； 
   */
  async getPublicUserInfo(userId) {
    let sql = `
      SELECT
        id, nickname, email, mobile, gender, avatar_id
      FROM tb_user 
      WHERE id=:id`;
    let [user, fields] = await dbUtil.execute(sql, { id: userId });
    return user.length ? user[0] : null;
  }

  /**
   * 通过手机号或者邮箱账号获取用户
   * @param {string} account 手机或者邮箱
   * @returns {object} user 对象； null； 
   */
  async getUserByAccount(account) {
    let sql = `SELECT * FROM tb_user WHERE mobile=:mobile OR email=:email`;
    let replacements = { mobile: account, email: account };
    let [user, fields] = await dbUtil.execute(sql, replacements);
    return user.length ? user[0] : null;
  }

  /**
   * 通过手机号或者邮箱和密码获取用户信息
   * @param {string} account 手机或者邮箱
   * @param {string} password 密码
   * @returns {object} user 对象； null；
   */
  async getUserByAccountAndPassword(account, password) {
    let sql = "SELECT * FROM tb_user WHERE (mobile=:mobile OR email=:email) AND password=:password";
    let replacements = { mobile: account, email: account, password: password };
    let [user, fields] = await dbUtil.execute(sql, replacements);
    return user.length ? user[0] : null;
  }

  /**
   * 创建用户
   * @param {{ nickname, email, mobile, password }} userData 用户数据对象 
   * @returns {integer} userid 成功返回用户id；失败返回 null； 
   */
  async createUser(userData) {
    let replacements = {
      nickname: userData.nickname ? userData.nickname : commonUtil.createFakeNickname(userData.account),
      email: commonUtil.isEmail(userData.account) ? userData.account : '',
      mobile: commonUtil.isMobile(userData.account) ? userData.account : '',
      password: userData.password ? commonUtil.md5(userData.password) : '',
      created_at: commonUtil.formatDateTime(parseInt(Date.now() / 1000)),
      logined_at: commonUtil.formatDateTime(Date.now()),
      updated_at: commonUtil.formatDateTime(Date.now())
    }
    let sql = `
      INSERT INTO tb_user (
        nickname,
        email,
        mobile, 
        password,
        created_at,
        logined_at,
        updated_at
      ) VALUES (
        :nickname,
        :email,
        :mobile,
        :password,
        :created_at,
        :logined_at,
        :updated_at
      )`;
    let [res, fields] = await dbUtil.execute(sql, replacements);
    return res.insertId ? res.insertId : null;
  }

  /**
   * 更新用户
   * @param {object} userData { nickname, email, mobile, password }
   * @returns {object} userid 成功返回用户id；失败返回 null； 
   */
  async update(userData) {
    let sql = `
      UPDATE tb_user 
      SET 
      nickname=:nickname,
      email=:email, 
      mobile=:mobile,
      password=:password
      `;
    let [res, fields] = await dbUtil.execute(sql, userData);
    return res;
  }

  /**
   * 获取用户列表
   * @param {integer} page 页码
   * @param {integer} perPage 每页显示条数
   * @param {integer} status all 显示全部
   * @param {string} keyword 关键词
   * @returns {array} 用户列表 
   */
  async getUsers(page = 1, perPage = 10, status = 'all', keyword) {
    var sql = "SELECT * FROM tb_user WHERE id>0";

    // 关键词
    if (keyword) {
      sql += " AND (username like :keyword         \
        OR nickname like :keyword                 \
        OR email like :keyword                    \
        OR mobile like :keyword)";
    }

    // 状态
    if (status != 'all') {
      sql += " AND status = :status";
    }

    // 排序
    sql += " ORDER BY id DESC";

    // 分页
    sql += " LIMIT :start,:perPage";

    var replacements = {
      start: perPage * (page - 1),
      perPage: perPage,
      keyword: keyword,
      status: status
    };

    var [users] = await dbUtil.query(sql, replacements);
    users.forEach(function (item, index, array) {
      // users[index]['avatar'] = item['avatar'] ? '/uploads/avatars/' + item['avatar'] : "";
      users[index]['created_at'] = commonUtil.formatDateTime(new Date(item.created_at).getTime())
    });
    return users;
  }

  /**
   * 获取用户数
   * @param {integer} status all 显示全部
   * @param {string} keyword 关键词
   * @returns {array} 用户列表 
   */
  async getUsersCount(status = 'all', keyword) {
    var sql = "SELECT count(*) AS count FROM tb_user ";
    sql += " WHERE id>0";

    // 关键词
    if (keyword) {
      sql += " AND (username like :keyword         \
        OR nickname like :keyword                 \
        OR email like :keyword                    \
        OR mobile like :keyword)";
    }
    // 状态
    if (status != 'all') {
      sql += " AND status = :status";
    }
    // 排序
    sql += " ORDER BY id DESC";

    var replacements = { keyword, status };
    var [users] = await dbUtil.query(sql, replacements);
    return users.length ? users[0].count : 0;
  }



}
