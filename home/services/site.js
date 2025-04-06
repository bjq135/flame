/**
 * 站点公共信息，模板渲染用
 */

const dbUtil = require('../../utils/db.js');
const htmlUtil = require('../../utils/html.js');

const TagsService = require('../services/tags.js');
const ArticlesService = require('../services/articles.js');

async function getSite(loginUserId=0) {
  const site = {};

  const tagsService = new TagsService();
  site.tags = await tagsService.getTags();

  var articlesService = new ArticlesService();
  site.radomArticles = await articlesService.getSomeArticle();

  // 菜单
  let sql, rows;
  sql = `SELECT * FROM tb_menu WHERE menu_group='home' AND is_show=1 ORDER BY id ASC`;
  [rows] = await dbUtil.execute(sql);
  let list = rows;
  site.pcNav = htmlUtil.getMenu(0, list, 'pc-nav');
  site.mobileUl = htmlUtil.getMenu(0, list, 'mobile-ul');

  // 登录
  if(loginUserId){
    let sql, rows;
    sql = `SELECT
              id,nickname,avatar_id,signature,
              (SELECT a.file_path FROM tb_asset AS a WHERE a.id=u.avatar) AS path
            FROM tb_user AS u
            WHERE u.id=:id`;
    [rows] = await dbUtil.execute(sql, { id: loginUserId });
    site.loginUser = rows[0];
    site.loginUser.avatarUrl = '/assets/home/images/avatar.jpg';
    site.loginUser.avatarUrl = rows[0].path ? '/uploads/avatars/' + rows[0].path : site.loginUser.avatarUrl;
  }

  // 网站配置
  sql = `SELECT * FROM tb_option WHERE option_name=?`;
  [rows] = await dbUtil.execute(sql, ['site_option']);
  site.siteOption = JSON.parse(rows[0].option_value)

  return site;
}

module.exports = { getSite };
