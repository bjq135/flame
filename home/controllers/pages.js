const i18n = require('i18n');

const dbUtil = require('../../utils/db.js');
const commonUtil = require('../../utils/common.js');
const htmlUtil = require('../../utils/html.js');
const pagination = require('../../utils/page-number/index.js');

const ArticlesService = require('../services/articles.js');
const siteService = require('../services/site.js');

async function show(req, res){
  const data = {};
  data.site = await siteService.getSite(req.app.locals.loginUserId);

  let pageId = req.query.id ? req.query.id : req.params.id;

  let sql = `SELECT * FROM tb_page WHERE is_show=1 AND (id=? OR route_url=?)`;
  let [rows] = await dbUtil.execute(sql, [pageId, pageId]);
  if (rows.length == 0) {
    res.status(404);
    res.render("home/404.html", data);
    return;
  }

  let page = rows[0];
  page['thumbnail'] = commonUtil.getImageUrl(page['thumbnail']);
  page['created_at'] = commonUtil.formatDate(page.created_at * 1000);
  data.page = page;

  // 更新页面浏览数
  page.hit_counter = parseInt(page.hit_counter) + 1;
  sql = "UPDATE tb_page SET hit_counter=:hit_counter";
  await dbUtil.execute(sql, page);

  // 设置模板
  var template = 'home/page.html';
  if (page['template']) {
    template = 'home/' + page['template'];
  }

  res.render(template, data);
}

module.exports = { show };
