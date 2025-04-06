const commonUtil = require('../../utils/common.js');
const htmlUtil = require('../../utils/html.js');
const pageNumber = require('../../utils/page-number/index.js');

const TagsService = require('../services/tags.js');
const ArticlesService = require('../services/articles.js');
const CategoriesService = require('../services/categories.js');
const siteService = require('../services/site.js');

async function index(req, res) {
  const data = {};
  data.site = await siteService.getSite(req.app.locals.loginUserId);

  var tag_title = req.params.tag_title;
  const tagsService = new TagsService();
  var tag = await tagsService.getTagByTitle(tag_title);
  if (!tag) {
    res.status(404);
    res.render('home/404.html', data);
    return;
  }

  var page = req.query.page ? parseInt(req.query.page) : 1; // 页码;
  var perPage = 10;

  // 获取文章
  var articlesService = new ArticlesService();
  var articles = await articlesService.getArticlesByTagId(tag.id, page, perPage, 1);

  // if (!articles.length) {
  //   res.status(404);
  //   res.render('home/404.html');
  //   return;
  // }

  const categoriesService = new CategoriesService();
  for (let i = 0; i < articles.length; i++) {
    articles[i].categories = await categoriesService.getCategoriesByArticleId(articles[i].id);
  }

  // 创建分页
  var articlesCounter = await articlesService.getArticlesCounterByTagId(tag.id, 1);
  var pager = pageNumber(req, page, articlesCounter, perPage);

  data.tag = tag;
  data.articles = articles;
  data.pagination = pager;

  res.render("home/tags.html", data);
}

module.exports = { index };
