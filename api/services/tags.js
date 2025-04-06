/*
 * ALTER TABLE tb_tag ADD unique(`tag_title`);
 */
const commonUtil = require('../../utils/common.js');
const dbUtil = require('../../utils/db.js');

module.exports = class TagsService {
  /**
   * 获取所有标签列表
   * @returns [] 标签列表
   */
  async getTags() {
    let sql = `SELECT * FROM tb_tag ORDER BY list_order DESC,id ASC`;
    let [result, fields] = await dbUtil.query(sql);
    return result;
  }

  /**
   * 获取标签分页
   * @returns [] 标签列表
   */
  async getTagsPage(page, perPage) {
    let start = (page - 1) * perPage;
    let sql = `SELECT * FROM tb_tag ORDER BY list_order DESC,id ASC LIMIT :per_page OFFSET :start`;
    let [result, fields] = await dbUtil.query(sql, { per_page: perPage, start: start });
    return result;
  }

  /**
   * 获取标签的总数
   * @returns {int}
   */
  async getTagsCount() {
    let sql = `SELECT count(*) as count FROM tb_tag`;
    let [result, fields] = await dbUtil.query(sql);
    return result[0] ? result[0].count : 0;
  }

  /**
   * 添加标签
   * @param {string} tagTitle 标签名
   * @param {integer} listOrder 排序
   * @returns {object}
   */
  async store(tagTitle, listOrder) {
    let sql = `SELECT * FROM tb_tag WHERE tag_title=:tag_title`;
    let [result, fields] = await dbUtil.execute(sql, { tag_title: tagTitle });
    if (result.length > 0) {
      throw Error('标签已存在');
    }
    sql = `INSERT INTO tb_tag (tag_title, list_order) VALUES (:tag_title, :list_order)`;
    [result, fields] = await dbUtil.execute(sql, { tag_title: tagTitle, list_order: listOrder });
    return result;
  }

  /**
   * 更新标签
   * @param {integer} tagId 标签ID
   * @param {string} title 标签名称
   * @param {string} list_order 排序
   * @returns {object} user 对象； null； 
   */
  async update(id, tagTitle, listOrder) {
    let sql = `UPDATE tb_tag SET tag_title=:tag_title, list_order=:list_order WHERE id=:id`;
    let replacements = { id: id, tag_title: tagTitle, list_order: listOrder };
    let [result, fields] = await dbUtil.execute(sql, replacements);
    return result;
  }

  /**
   * 删除标签
   * @param {integer} tagId 标签ID
   * @returns {object} resultultSetHeader {
   *                    fieldCount: 0,
   *                    affectedRows: 1,
   *                    insertId: 0,
   *                    info: '',
   *                    serverStatus: 2,
   *                    warningStatus: 0
   *                  }
   */
  async destroy(tagId) {
    let sql = `SELECT * FROM tb_tag WHERE id=:id`;
    let [result, fields] = await dbUtil.execute(sql, { id: tagId });
    if (result.length == 0) {
      throw Error('标签不存在');
    }

    sql = `SELECT COUNT(*) as counter FROM tb_article_to_tag WHERE tag_id=:tag_id`;
    [result, fields] = await dbUtil.execute(sql, { tag_id: tagId });
    if (result[0].counter > 0) {
      throw Error('标签下还有文章，不可以删除');
    }

    sql = `DELETE FROM tb_tag WHERE id=:id`;
    [result, fields] = await dbUtil.execute(sql, { id: tagId });
    return result;
  }

  /**
   * 获取一个标签
   * @param {integer} tagId 标签ID
   * @returns {object} 标签对象；
   */
  async get(tagId) {
    let sql = "SELECT * FROM tb_tag WHERE id=:id";
    let [result] = await dbUtil.execute(sql, { id: tagId });
    return result.length ? result[0] : null;
  }

  /**
   * 通过 tag_title 获取一个标签
   * @param {string} tagTitle tag名称
   * @returns 
   */
  async getTagByTitle(tagTitle) {
    let sql = "SELECT * FROM tb_tag WHERE tag_title=:tag_title LIMIT 1";
    let [rows] = await dbUtil.execute(sql, { tag_title: tagTitle });
    return rows.length ? rows[0] : null;
  }
  
  /**
   * 获取文章的所有标签
   * @param {integer} articleId 文章ID
   * @returns 
   */
  async getTagsByArticleId(articleId) {
    let sql = `SELECT t.* FROM tb_article_to_tag AS at 
                LEFT OUTER JOIN tb_tag AS t
                ON at.tag_id = t.id
                WHERE article_id = ?
                ORDER BY list_order DESC`;
    let [rows] = await dbUtil.execute(sql, [articleId]);
    return rows.length ? rows : null;
  }

  /**
   * 接收前端手填的文章标签，格式使用逗号分隔。
   * 删除空数元素
   * @param {str} tags 
   * @returns str 返回合法标签数组.toString()
   */
  async parseTags(tags) {
    tags = tags.replace(/\|/g, ',');
    tags = tags.replace(/\，/g, ',');
    var tagsStrArr = tags.split(',');
    tagsStrArr = tagsStrArr.filter(t => t.trim() ? true : false);
    var tagsArr = tagsStrArr.map(t => {
      return { tag_title: t }
    });

    for (let index = 0; index < tagsArr.length; index++) {
      var tag = await articleTagModel.findOne({
        where: {
          tag_title: tagsArr[index].tag_title
        }
      });
      if (tag) {
        delete tagsArr[index];
      }
    }

    tagsArr = tagsArr.filter(t => t ? true : false);
    var tags = await articleTagModel.bulkCreate(tagsArr);
    return tagsStrArr.toString();
  }


}
