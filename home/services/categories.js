const commonUtil = require('../../utils/common.js');
const dbUtil = require('../../utils/db.js');

class CategoriesService {
  allCategories = [];
  constructor() {

  }
  
  /**
   * 获取一个分类
   * @param {int} id 
   * @returns objcet
   */
  async getCategoryById(id) {
    let sql = `SELECT * FROM tb_category WHERE id=?`;
    let [category] = await dbUtil.execute(sql, [id]);
    return category.length ? category[0] : null;
  }

  /**
   * 获取多个分类
   * @param {array} ids 分类ID组成的数组
   * @returns [{},{}]
   */
  async getCategoryByIds(ids) {
    if (!Array.isArray(ids) || ids.length == 0) {
      throw TypeError("参数不合法");
    }
    let sql = `SELECT id,title FROM tb_category WHERE FIND_IN_SET(id,:ids)`;
    let [categories] = await dbUtil.execute(sql, { ids: ids.toString() });
    return categories.length ? categories : null;
  }

  /**
   * 获取所有分类
   * @returns array
   */
  async getAllCategories() {
    if (this.allCategories.length == 0) {
      let sql = 'SELECT * FROM tb_category ORDER BY list_order DESC, id DESC';
      let [rows, fields] = await dbUtil.execute(sql);
      this.allCategories = rows;
    }
    return this.allCategories;
  }

  /**
   * 获取分类和其子分类 ID 组成的数组
   * @param {*} parentId 
   * @param {*} allCategories 
   * @returns array
   */
  async getCategoryChildrenIds(parentId, allCategories) {
    if (parentId == 0) {
      return this.allCategories.map(c => { return c.id });
    }
    var ids = [parentId];
    var categoryChildren = commonUtil.getChildren(allCategories, parentId);
    if (categoryChildren) {
      ids.push(...categoryChildren.map(c => { return c.id }));
    }
    return ids;
  }
  
  /**
   * 获取文章的所有分类
   * @param {integer} articleId 文章ID
   * @returns {array}
   */
  async getCategoriesByArticleId(articleId){
    let sql = `SELECT ac.category_id, c.title FROM tb_article_to_category AS ac
                LEFT JOIN tb_category AS c ON c.id=ac.category_id
                WHERE ac.article_id=?`;
    let [rows] = await dbUtil.execute(sql, [articleId]);
    return rows;
  }
  
}

module.exports = CategoriesService;
