const i18n = require('i18n');

const commonUtil = require('../../utils/common.js');
const dbUtil = require('../../utils/db.js');

class ArticlesService {
  allCategories = [];
  
  constructor() {

  }
  
  
  async store(data){
    const { meta } = data;

    let conn = await dbUtil.getPoolConnection();
    try {
      await conn.query(`START TRANSACTION`);
      
      // 1.插入文章表
      let results = await dbUtil.save('tb_article', data, conn);
      if (results.affectedRows == 0) {
        throw new Error(i18n.__('create failed'));
      }
      var articleId = results.insertId;    
    
      // 2.删除所有文章分类关系表所有相关记录
      let sql = "DELETE FROM tb_article_to_category WHERE article_id=:article_id";
      [results] = await conn.execute(sql, { article_id: articleId });
    
      // 3.检查分类是否合法
      sql = 'SELECT id FROM tb_category WHERE FIND_IN_SET(id, ?)';
      [results] = await conn.execute(sql, [data.categories]);
      let categoriesArr = data.categories.split(',');
      if (results.length == 0 || results.length != categoriesArr.length) {
        throw new Error(i18n.__('category_id_is_not_valid'));
      }
    
      // 4.批量添加文章分类关系
      sql = `INSERT INTO tb_article_to_category (article_id, category_id) VALUES (?,?)`;
      for (let i = 0; i < categoriesArr.length; i++) {
        [results] = await conn.execute(sql, [articleId, categoriesArr[i]]);
      }
    
      // 5.处理 tags
      if (data.tags) {
        let tagsArr = data.tags.split(',');
        
        sql = "INSERT INTO tb_article_to_tag (article_id, tag_id) VALUES (:article_id, :tag_id)";
        for (let i = 0; i < tagsArr.length; i++) {
          let replacement = {article_id:articleId, tag_id:tagsArr[i]};
          await conn.execute(sql, replacement);
        }
      }

      // 6.处理 meta
      if(meta){
        for (const key in meta) {
          if(meta[key]==null) continue;
          let data = {article_id:articleId, meta_key:key, meta_value:meta[key]};
          await dbUtil.save('tb_article_meta', data, conn);
        }
      }
    
      await conn.query(`COMMIT`);

      const article = await this.getArticleById(articleId);
      return article;

    } catch (error) {
      await conn.query(`ROLLBACK`);
      throw error;

    } finally {
      conn.release();
    }
  }


  async update(data){
    const { user_id, meta, tags } = data;
    delete data.user_id;

    let conn = await dbUtil.getPoolConnection();
    try {
      await conn.query(`START TRANSACTION`);

      // 1.更新文章表
      let results = await dbUtil.update('tb_article', data, {where:{id:data.id}}, conn);
      if (results.affectedRows == 0) {
        throw new Error(i18n.__('article is not exist'));
      }

      // 2.删除文章分类关系表所有相关记录
      let sql = "DELETE FROM tb_article_to_category WHERE article_id=:article_id";
      [results] = await conn.execute(sql, { article_id: data.id });

      // 3.检查分类是否合法
      sql = 'SELECT id FROM tb_category WHERE FIND_IN_SET(id, ?)';
      [results] = await conn.execute(sql, [data.categories]);
      let categoriesArr = data.categories.split(',');
      if (categoriesArr.length == 0 || results.length != categoriesArr.length) {
        throw new Error(i18n.__('category id is not valid'));
      }

      // 4.批量添加文章分类关系
      sql = `INSERT INTO tb_article_to_category (article_id, category_id) VALUES (?,?)`;
      for (let i = 0; i < categoriesArr.length; i++) {
        [results] = await conn.execute(sql, [data.id, categoriesArr[i]]);
      }

      // 5.处理 tags
      sql = "DELETE FROM tb_article_to_tag WHERE article_id=?"
      await conn.execute(sql, [data.id]);
      if (tags) {
        let tagsArr = tags.split(',');
        sql = "INSERT INTO tb_article_to_tag (article_id, tag_id) VALUES (:article_id, :tag_id)";
        for (let i = 0; i < tagsArr.length; i++) {
          let replacement = {article_id:data.id, tag_id:tagsArr[i]};
          await conn.execute(sql, replacement);
        }
      }

      // 6.处理 meta
      if(meta){
        for (const key in meta) {
          let where = { article_id:data.id, meta_key:key };

          if(meta[key] == null){
            await dbUtil.destroy('tb_article_meta', {where}, conn);
            continue;
          }

          let metaData = {article_id:data.id, meta_key:key, meta_value:meta[key]};
          let metaItem = await dbUtil.findOne('tb_article_meta', {where});
          if(metaItem){
            await dbUtil.update('tb_article_meta', metaData, {where}, conn);
          } else {
            await dbUtil.save('tb_article_meta', metaData, conn);
          }
        }
      }

      await conn.query(`COMMIT`);

      // 7.获取返回信息
      const article = await this.getArticleById(data.id);
      return article;
    } catch (error) {
      console.log(error)
      await conn.query(`ROLLBACK`);
      throw error;
    } finally {
      conn.release();
    }
  }


  /**
   * 获取文章详情
   * @param {integer} id 文章ID
   * @return {object} 文章对象
   */
  async getArticleById(id) {
    let sql = `SELECT
                a.*,
                u.id AS 'user.id', u.nickname AS 'user.nickname', u.avatar_id AS 'user.avatar_id'
              FROM tb_article AS a
              LEFT JOIN tb_user AS u ON u.id = a.user_id
              WHERE a.id=:id`;
    let [rows, fields] = await dbUtil.execute(sql, { id });

    if(rows.length == 0){
      return null;
    }

    var article = rows[0];
    article = commonUtil.dataShow(article);

    const meta = await dbUtil.findAll('tb_article_meta', { where:{article_id:id } });
    if(meta && meta.length){
      article.meta = {};
      meta.forEach((item,index)=>{
        article.meta[item.meta_key] = item.meta_value;
      })
    }

    return article;
  }


  /**
   * 通过分类ID数组，获取文章列表
   * @param {array} ids 多个分类ID，比如 12,20,23
   * @param {int} page 页面
   * @param {int} perPage 每页显示条数
   * @param {int} isShow 0,获取所有“隐藏”记录；1,获取状态是“显示”的记录；2, 显示所有记录
   * @param {string} keyword 要搜索的关键词
   * @returns array
   */
  async getArticles(ids, page, perPage, isShow = 2, keyword = '') {
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
      ORDER BY a.id DESC
      LIMIT :start,:perPage
    `;

    var [articles] = await dbUtil.execute(sql, replacements);
    articles.forEach(function (a, index) {
      articles[index] = commonUtil.dataShow(a);
      articles[index].user.avatar_id = commonUtil.getAvatarUrl(articles[index].user.avatar_id);
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
  async getArticleCounter(ids, perPage, isShow = 2, keyword = '') {
    var replacements = { ids: ids.toString(), perPage };
    
    var sql = `
      SELECT COUNT(id) AS count FROM (
        SELECT id FROM tb_article AS a
        LEFT JOIN tb_article_to_category AS r 
        ON r.article_id = a.id
        WHERE FIND_IN_SET(r.category_id, :ids)`;

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
                u.id AS 'user.id', u.nickname AS 'user.nickname', u.avatar_id AS 'user.avatar_id'
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
      articles[index] = dbUtil.dataShow(a);
      articles[index].user.avatar_id = commonUtil.getAvatarUrl(articles[index].user.avatar_id);
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



}


module.exports = ArticlesService;
