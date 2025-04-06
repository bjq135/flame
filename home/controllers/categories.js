const i18n = require('i18n');

const htmlUtil = require('../../utils/html.js');
const dbUtil = require('../../utils/db.js');
const pagination = require('../../utils/page-number/index.js');
const ArticlesService = require('../services/articles.js');
const CategoriesService = require('../services/categories.js');

const siteService = require('../services/site.js');

async function show(req, res) {
  const data = {};
  data.site = await siteService.getSite(req.app.locals.loginUserId);

  let categoryId = req.params.id ? parseInt(req.params.id) : 0;
  let page = req.query.page ? parseInt(req.query.page) : 1; // 页码
  let perPage = 20; // 每页条数

  const articlesService = new ArticlesService();
  const categoriesService = new CategoriesService();

  // 当前分类
  var category = await categoriesService.getCategoryById(categoryId);
  if (category == null || category.is_show == 0) {
    res.status(404);
    res.render("home/404.html", data);
    return;
  }

  // 获取所有子分类
  let allCategories = await categoriesService.getAllCategories();
  let currentCategoryIds = await categoriesService.getCategoryChildrenIds(categoryId, allCategories);

  // 获取所有文章
  let isShow = req.userId ? 2 : 1;
  var articles = await articlesService.getArticles(currentCategoryIds, page, perPage, isShow);
  if (!articles.length) {
    res.status(404);
    res.render('home/404.html', data);
    return;
  }

  for (let i = 0; i < articles.length; i++) {
    articles[i].categories = await categoriesService.getCategoriesByArticleId(articles[i].id);
  }

  // 创建分页
  var counter = await articlesService.getArticleCounter(currentCategoryIds, perPage, isShow);
  var pager = pagination(req, page, counter, perPage);

  data.category = category;
  data.categories =  allCategories;
  data.articles = articles;
  data.pagination =  pager;
  
  let result = await dbUtil.findOne('tb_category_meta', {
    where:{ category_id:categoryId, meta_key:'template'}
  });

  if(result && result.meta_value=='images'){
    res.render("home/categories-images.html", data);
    return;
  }
  
  res.render("home/categories.html", data);
}

module.exports = { show };
