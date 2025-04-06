const i18n = require('i18n');

const commonUtil = require('../../utils/common.js');
const dbUtil = require('../../utils/db.js');
const htmlUtil = require('../../utils/html.js');
const pagination = require('../../utils/page-number/index.js');

const ArticlesService = require('../services/articles.js');
const CategoriesService = require('../services/categories.js');
const TagsService = require('../services/tags.js');

const siteService = require('../services/site.js');

async function show(req, res) {
  const data = {};
  data.site = await siteService.getSite(req.app.locals.loginUserId);

  let id = req.params.id ? parseInt(req.params.id) : 0;

  var articlesService = new ArticlesService();
  var categoriesService = new CategoriesService();
  
  
  var article = await articlesService.getArticleById(id);

  if (article == null) {
    res.status(404);
    res.render("home/404.html", data);
    return;
  }
  
  // 未登录用户看不到隐藏文章
  if (req.session.userId == undefined && article.is_show == 0) {
    res.status(404);
    res.render("home/404.html", data);
    return;
  }
  
  article = commonUtil.dataShow(article);
  article.user.avatar = htmlUtil.getAvatarUrl(article.user.avatar_id);

  let img = await dbUtil.findOne('tb_asset', {where:{id:article['thumbnail_id']}});
  article['thumbnail'] = img && commonUtil.getImageUrl(img.file_path);
  article['created_at'] = commonUtil.formatDate(Date.parse(article['created_at']));
  article['updated_at'] = article.updated_at ? commonUtil.formatDate(Date.parse(article.updated_at)) : '';
  data.article = article;

  // 获取分类
  data.allCategories = await categoriesService.getAllCategories();
  data.currentCategories = await categoriesService.getCategoriesByArticleId(article.id);

  // 获取 tags
  const tagsService = new TagsService();
  data.article.tags = await tagsService.getTagsByArticleId(id);

  // 更新文章浏览数
  article.hit_counter = parseInt(article.hit_counter) + 1;
  let sql = `UPDATE tb_article SET hit_counter=? WHERE id=?`;
  await dbUtil.execute(sql, [article.hit_counter, article.id]);

  // 网站关键词和描述
  data.keywords = req.app.locals.keywords;
  data.description = article['content'];
  data.description = commonUtil.delHtmlTag(data.description);
  data.description = data.description.replace(/"/g, ' ');
  data.description = data.description.replace(/\n/g, ' ');
  data.description = String(data.description).slice(0, 300);

  // 上一篇文章和下一篇文章导航
  sql = `SELECT a.id, a.title, a.created_at
          FROM tb_article AS a, tb_article_to_category AS cat
          WHERE a.id<? AND a.is_show=1 AND cat.category_id != 50 AND cat.article_id=a.id
          ORDER BY a.id DESC LIMIT 1`;
  let [rows] = await dbUtil.execute(sql, [article.id]);
  if (rows[0]) {
    data.prev = rows[0];
    data.prev.created_at = commonUtil.formatDate(new Date(rows[0].created_at));
  } else {
    data.prev = null;
  }
  
  sql = `SELECT a.id, a.title, a.created_at
          FROM tb_article AS a, tb_article_to_category AS cat
          WHERE a.id>? AND a.is_show=1 AND cat.category_id != 50 AND cat.article_id=a.id
          ORDER BY a.id DESC LIMIT 1`;
  [rows] = await dbUtil.execute(sql, [article.id]);
  if (rows[0]) {
    data.next = rows[0];
    data.next.created_at = commonUtil.formatDate(new Date(rows[0].created_at));
  } else {
    data.next = null;
  }

  let loginUserId = req.app.locals.loginUserId ? req.app.locals.loginUserId : 0;
  data.site = await siteService.getSite(loginUserId);

  let template = "home/article.html";

  let condition = { where:{ article_id:article.id, meta_key:'article_type'}};
  let one = await dbUtil.findOne('tb_article_meta', condition);
  if(one && one.meta_value=='video'){
    template = "home/article-video.html";
  }

  res.render(template, data);
}



module.exports = { show };
