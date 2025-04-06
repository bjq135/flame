const i18n = require('i18n');
const Validator = require('hot-validator');

const dbUtil = require("../../utils/db.js");
const commonUtil = require("../../utils/common.js");
const logger = require('../../utils/logger.js');

const ArticlesService = require("../services/articles.js");
const CategoriesService = require('../services/categories.js');


async function index(req, res) {
  var data = {};

  let page = req.query.page > 0 ? parseInt(req.query.page) : 1;
  let perPage = req.query.per_page > 0 ? parseInt(req.query.per_page) : 10;
  let categoryId = req.query.category_id ? parseInt(req.query.category_id) : 0; // 分类ID
  // let sortby = req.query.sortby ? req.query.sortby : 'id'; // 排序字段
  // let order = req.query.order ? req.query.order : 'desc'; // 排序方式

  data.is_show = req.query.is_show ? req.query.is_show : 2;
  data.keyword = req.query.keyword ? req.query.keyword : '';

  const articlesService = new ArticlesService();
  const categoriesService = new CategoriesService();
  const allCategories = await categoriesService.getCategories();
  const currentCategoryIds = await categoriesService.getCategoryChildrenIds(categoryId, allCategories);

  let results = await articlesService.getArticles(currentCategoryIds, page, perPage, 1, data.keyword);
  
  let total = await articlesService.getArticleCounter(currentCategoryIds, perPage, 1, data.keyword);
  res.append('X-Total', total);
  res.append('X-TotalPages', Math.ceil(total/perPage));
  
  res.status(200).json(results);
}


/**
 * 新建文章
 */
async function store(req, res) {
  let validator = new Validator();
  let rules = {
    title: { type: 'string', min: 1, max: 100 },
    categories: { type: 'string', min: 1, max: 200 },
    description: { type: 'string', required: false },
    thumbnail_id: { type: 'integer', required: false },
    content: { type: 'string', required: false },
    tags: { type: 'string', required: false },
    more: { type: 'string', required: false },
    url: { type: 'string', required: false },
    list_order: { type: 'string', required: false },
    is_show: { type: 'integer', required: false }
  };

  var errors = validator.validate(req.body, rules);
  if (errors && errors.length) {
    res.status(400).send({ error: errors[0].message });
    return;
  }

  req.body.user_id = req.userId;
  req.body.created_at = commonUtil.formatDateTime();
  
  try{
    const articlesService = new ArticlesService();
    const article = await articlesService.store(req.body);
    res.status(201).json(article);
  }catch(error){
    console.log(error);
    logger.error("article.store inputParams %s errorMessage %s %s", 
      JSON.stringify(req.body), error.message, Date());
    res.status(500).json({error:error.message});
  }
}


/**
 * 更新文章
 */
async function update(req, res) {
  req.body.id = req.params.id;
  req.body.description = commonUtil.htmlEncode(req.body.description);
  req.body.updated_at = commonUtil.formatDateTime();

  let validator = new Validator();
  let rules = {
    title: { type: 'string', min: 1, max: 100 },
    categories: { type: 'string', min: 1, max: 200 },
    description: { type: 'string', required: false, field: '分类简介' },
    thumbnail_id: { type: 'integer', required: false, field: '缩略图ID' },
    content: { type: 'string', required: false },
    tags: { type: 'string', required: false },
    more: { type: 'string', required: false },
    url: { type: 'string', required: false },
    list_order: { type: 'string', required: false },
    is_show: { type: 'integer', required: false }
  };

  var errors = validator.validate(req.body, rules);
  if (errors && errors.length) {
    res.status(400).send({ error: errors[0].message });
    return;
  }

  try{
    const articlesService = new ArticlesService();
    const article = await articlesService.update(req.body);
    res.status(200).json(article);
  }catch(error){
    logger.error("article.update inputParams %s errorMessage %s %s", 
      JSON.stringify(req.body), error.stack, Date());
    res.status(500).json({error:error.message});
  }
}


/**
 * 删除一篇文章
 */
async function destroy(req, res) {
  var articleID = req.params.id;

  let conn = await dbUtil.getPoolConnection();
  try {
    await conn.query(`START TRANSACTION`);

    // 1.删除文章表记录
    let sql = `DELETE FROM tb_article WHERE id=:id`;
    let [results, fields] = await conn.execute(sql, { id: articleID });

    // 2.删除所有文章分类关系表所有相关记录
    sql = "DELETE FROM tb_article_to_category WHERE article_id=:article_id";
    [results] = await conn.execute(sql, { article_id: articleID });

    // 3.删除 meta
    sql = "DELETE FROM tb_article_meta WHERE article_id=:article_id";
    [results] = await conn.execute(sql, { article_id: articleID });

    // 4.删除 tag
    sql = "DELETE FROM tb_article_to_tag WHERE article_id=:article_id";
    [results] = await conn.execute(sql, { article_id: articleID });

    await conn.query(`COMMIT`);
    res.status(204).json({ message: i18n.__('delete success') });
    return;
  } catch (error) {
    console.error(error);
    await conn.query(`ROLLBACK`);
    res.status(500).json({ error: error.message });
    return;
  } finally {
    conn.release();
  }
}


async function show(req, res){
  let sql = '';
  let articleID = req.params.id;

  const articlesService = new ArticlesService();
  const article = await articlesService.getArticleById(articleID);
  if(!article) res.status(404).json();

  sql = "SELECT id,title FROM tb_category";
  const [allCategories] = await dbUtil.execute(sql);
  article.all_categories = allCategories;

  sql = "SELECT category_id FROM tb_article_to_category WHERE article_id = :id";
  const [rows] = await dbUtil.execute(sql, {'id':articleID});
  let categories = rows.map(row => row.category_id);
  article.categories = categories;

  res.json(article);
}


async function bulkAction(req, res) { 
  let isShow = req.body.action=='is_show=true' ? 1 : 0; 
  
  console.log([isShow, req.body.ids]);
  
  let conn = await dbUtil.getPoolConnection();
  let sql = `UPDATE tb_article SET is_show=? WHERE FIND_IN_SET(id, ?)`;
  let [results] = await conn.execute(sql, [isShow, req.body.ids]);
  await conn.release();
  
  if( results.affectedRows == 0){
    res.status(400).json({error: i18n.__('400')});
    return;
  }
  
  res.json({message:i18n.__('200')});
}


module.exports = {
  index,
  store,
  update,
  destroy,
  show,
  bulkAction
};
