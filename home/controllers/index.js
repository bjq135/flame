const htmlUtil = require('../../utils/html.js');
const commonUtil = require('../../utils/common.js');
const dbUtil = require('../../utils/db.js');
const pagination = require('../../utils/page-number/index.js');

const ArticlesService = require('../services/articles.js');
const CategoriesService = require('../services/categories.js');
const TagsService = require('../services/tags.js');

const siteService = require('../services/site.js');


/**
 * 首页
 */
async function index(req, res) {
  const data = {};
  data.site = await siteService.getSite(req.app.locals.loginUserId);

  let page = req.query.page ? parseInt(req.query.page) : 1; // 页码
  let perPage = 20; // 每页条数

  const articlesService = new ArticlesService();
  const categoriesService = new CategoriesService();
  
  // 获取所有子分类
  let allCategories = await categoriesService.getAllCategories();
  let currentCategoryIds = await categoriesService.getCategoryChildrenIds(0, allCategories);

  // 获取所有文章
  let isShow = req.userId ? 2 : 1;
  var articles = await articlesService.getArticles(currentCategoryIds, page, perPage, isShow, '', '50');
  // if (!articles.length) {
  //   res.status(404);
  //   res.render('home/404.html', data);
  //   return;
  // }

  for (let i = 0; i < articles.length; i++) {
    articles[i].categories = await categoriesService.getCategoriesByArticleId(articles[i].id);
  }
  
  // 创建分页
  var counter = await articlesService.getArticleCounter(currentCategoryIds, perPage, isShow, '', '50');
  var pager = pagination(req, page, counter, perPage);

  data.categories = allCategories;
  data.articles = articles;
  data.pagination = pager;

  res.render("home/index.html", data);
}


/**
 * 搜索页
 */
async function search(req, res) {
  const data = {};
  data.site = await siteService.getSite(req.app.locals.loginUserId);

  let keyword = req.query.keyword;
  if (!keyword || keyword.trim().length == 0) {
    res.status(400);
    res.json({error:'请输入关键词'});
    return;
  }

  let page = req.query.page ? parseInt(req.query.page) : 1; // 页码
  let perPage = 20; // 每页条数

  const articlesService = new ArticlesService();
  const categoriesService = new CategoriesService();
  
  // 获取所有子分类
  let allCategories = await categoriesService.getAllCategories();
  let currentCategoryIds = await categoriesService.getCategoryChildrenIds(0, allCategories);

  // 获取所有文章
  let isShow = req.userId ? 2 : 1;
  var articles = await articlesService.getArticles(currentCategoryIds, page, perPage, isShow, keyword);
  for (let i = 0; i < articles.length; i++) {
    articles[i].categories = await categoriesService.getCategoriesByArticleId(articles[i].id);
  }

  // 创建分页
  var counter = await articlesService.getArticleCounter(currentCategoryIds, perPage, isShow, keyword);
  var pager = pagination(req, page, counter, perPage);

  data.keyword = keyword;
  data.categories = allCategories;
  data.articles = articles;
  data.pagination = pager;

  res.render("home/search.html", data);
}


module.exports = { index, search };
