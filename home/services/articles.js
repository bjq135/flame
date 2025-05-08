const commonUtil = require('../../utils/common.js');
const htmlUtil = require('../../utils/html.js');
const dbUtil = require('../../utils/db.js');

class ArticlesService {
  allCategories = [];
  constructor() {}
  
  /**
   * 通过分类ID数组，获取文章列表
   * @param {array} ids 多个分类ID，比如 12,20,23
   * @param {int} page 页面
   * @param {int} perPage 每页显示条数
   * @param {int} isShow 0,获取所有“隐藏”记录；1,获取状态是“显示”的记录；2, 显示所有记录
   * @param {string} keyword 要搜索的关键词
   * @returns array
   */
  async getArticles(ids, page, perPage, isShow = 2, keyword = '', notInIds='') {
    var sql = ``;
    var replacements = {
      ids: ids.toString(),
      start: perPage * (page - 1),
      perPage
    };

    sql = `
      SELECT 
        a.id,
        ANY_VALUE(a.user_id) AS user_id, 
        ANY_VALUE(a.title) AS title, 
        ANY_VALUE(a.description) AS description, 
        ANY_VALUE(a.content) AS content, 
        ANY_VALUE(a.hit_counter) AS hit_counter, 
        ANY_VALUE(a.created_at) AS created_at, 
        ANY_VALUE(a.is_show) AS is_show,
        ANY_VALUE(u.id) AS 'user.id', 
        ANY_VALUE(u.nickname) AS 'user.nickname', 
        ANY_VALUE(u.avatar_id) AS 'user.avatar_id',
        ANY_VALUE(asset.file_path) as thumbnail
      FROM tb_article AS a
      LEFT JOIN tb_article_to_category AS r ON r.article_id = a.id
      LEFT JOIN tb_user AS u ON u.id = a.user_id
      LEFT JOIN tb_asset AS asset ON asset.id = a.thumbnail_id
      WHERE FIND_IN_SET(r.category_id, :ids)`;
      
    if(notInIds){
      sql += `AND r.category_id NOT IN (:notInIds)`;
      replacements.notInIds = notInIds;
    }
    // WHERE r.category_id IN (:ids)`;

    if (isShow == 1) {
      sql += ` AND a.is_show = 1 `;
    } else if (isShow == 0) {
      sql += ` AND a.is_show = 0 `;
    }
    if (keyword != "") {
      sql += ` AND a.title LIKE CONCAT('%',:keyword,'%') `;
      replacements.keyword = keyword;
    }

    sql += `
      GROUP BY a.id
      ORDER BY a.list_order DESC, a.id DESC
      LIMIT :start,:perPage
    `;

    var [articles] = await dbUtil.execute(sql, replacements);
    articles.forEach(function (a, index) {
      articles[index] = commonUtil.dataShow(a);
      articles[index].user.avatar = htmlUtil.getAvatarUrl(articles[index].user.avatar_id);
      articles[index].thumbnail = commonUtil.getImageUrl(articles[index].thumbnail);
      // articles[index].more = a.more ? JSON.parse(a.more) : { images: [] };
      articles[index].content = commonUtil.delHtmlTag(a.content);
      articles[index].created_at = commonUtil.formatDate(Date.parse(a.created_at));
      delete articles[index].article_id;
      delete articles[index].category_id;
    });

    return articles;
  }



  /**
   * 通过分类 ids 获取文章总数，供分页使用
   * @param {array} ids 
   * @param {int} perPage 
   * @param {int} isShow 0,获取所有“隐藏”记录；1,获取状态是“显示”的记录；2, 显示所有记录
   * @param {string} keyword 要搜索的关键词
   * @returns int
   */
  async getArticleCounter(ids, perPage, isShow = 2, keyword = '', notInIds='') {
    var replacements = { ids: ids.toString(), perPage };
    
    var sql = `
      SELECT COUNT(id) AS count FROM (
        SELECT id FROM tb_article AS a
        LEFT JOIN tb_article_to_category AS r 
        ON r.article_id = a.id
        WHERE FIND_IN_SET(r.category_id, :ids)`;

    if(notInIds){
      sql += `AND r.category_id NOT IN (:notInIds)`;
      replacements.notInIds = notInIds;
    }

    if (isShow == 1) {
      sql += ` AND a.is_show = 1 `;
    } else if (isShow == 0) {
      sql += ` AND a.is_show = 0 `;
    }

    if (keyword != "") {
      sql += ` AND a.title LIKE CONCAT('%',:keyword,'%') `;
    }

    sql += ` 
        GROUP BY a.id
      ) t
    `;

    if (keyword != "") {
      replacements.keyword = keyword;
    }

    var [res, fields] = await dbUtil.execute(sql, replacements);
    var counter = res[0].count;
    return counter;
  }
  
  /**
   * 获取随机文章
   */
  async getSomeArticle() {
    var lastYear = new Date().getFullYear() - 3;
    var sql = "SELECT * FROM tb_article WHERE is_show=1 AND year(created_at)>:last_year ORDER BY rand() LIMIT 8";
    var [rows] = await dbUtil.execute(sql, { last_year: lastYear });
    return rows;
  }
  
  /**
   * 获取文章详情
   * @param {integer} id 文章ID
   * @return {object} 文章对象
   */
  async getArticleById(id) {
    let sql = `SELECT
                a.*,
                u.id AS 'user.id', u.nickname AS 'user.nickname',
                (SELECT file_path FROM tb_asset AS tb_asset WHERE tb_asset.id=u.avatar_id) AS 'user.avatar_id'
              FROM tb_article AS a
              LEFT JOIN tb_user AS u ON u.id = a.user_id
              WHERE a.id=:id`;
    let [res, fields] = await dbUtil.execute(sql, { id });
    return res.length ? res[0] : null;
  }
  
  
  /**
   * 通过 tag id 获取文章分页
   * @param  {[integer]} id      tag id
   * @param  {Number} page    页码
   * @param  {Number} perPage 每页条数
   * @param  {Number} isShow  0，隐藏；1，显示；2，所有
   * @return {[array]} 
   */
  async getArticlesByTagId(id, page=1, perPage=15, isShow = 2) {
    let sql = '';
    var replacements = {
      id: id,
      start: perPage * (page - 1),
      perPage
    };

    sql = `SELECT
                att.tag_id, a.*,
                u.id AS 'user.id', u.nickname AS 'user.nickname',
                (SELECT file_path FROM tb_asset AS tb_asset WHERE tb_asset.id=u.avatar_id) AS 'user.avatar_id'
              FROM tb_article_to_tag AS att 
              LEFT OUTER JOIN tb_article AS a ON att.article_id=a.id
              LEFT OUTER JOIN tb_user AS u ON u.id=a.user_id
              WHERE att.tag_id=:id`;
    if (isShow == 1) {
      sql += ` AND a.is_show = 1 `;
    } else if (isShow == 0) {
      sql += ` AND a.is_show = 0 `;
    }

    sql += ` ORDER BY a.list_order DESC, a.id DESC
            LIMIT :start,:perPage`;

    let [articles] = await dbUtil.query(sql, replacements);

    articles.forEach(function (a, index) {
      articles[index] = commonUtil.dataShow(a);
      articles[index].user.avatar = commonUtil.getAvatarUrl(articles[index].user.avatar_id);
      articles[index].thumbnail = commonUtil.getImageUrl(articles[index].thumbnail);
      // articles[index].more = a.more ? JSON.parse(a.more) : { images: [] };
      articles[index].content = commonUtil.delHtmlTag(a.content);
      articles[index].created_at = commonUtil.formatDate(Date.parse(a.created_at));
      delete articles[index].article_id;
      delete articles[index].category_id;
    });

    let data = articles;
    return data;
  }
  
  
  async getArticlesCounterByTagId(id, isShow = 2) {
    let sql = '';
    var replacements = { id: id};

    sql = `SELECT count(att.article_id) AS count, a.is_show
            FROM tb_article_to_tag AS att 
            LEFT OUTER JOIN tb_article AS a ON att.article_id=a.id
            WHERE att.tag_id=:id`;

    if (isShow == 1) {
      sql += ` AND a.is_show = 1 `;
    } else if (isShow == 0) {
      sql += ` AND a.is_show = 0 `;
    }

    var [results, fields] = await dbUtil.execute(sql, replacements);
    var counter = results[0].count;
    return counter;
  }
  
  
  async getAllArticleCounter(){
    let sql = `SELECT count(a.id) AS count, a.is_show FROM tb_article AS a WHERE a.is_show=1`;
    
    var [results, fields] = await dbUtil.execute(sql);
    var counter = results[0].count;
    return counter;
  }


}


module.exports = ArticlesService;
