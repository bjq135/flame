/**
 * 自动合并CSS文件
 */


const fs = require('node:fs');
const path = require('node:path');


/**
 * 合并文件的方法
 * @param  {arr} arrUrls 待合并的文件列表
 * @param  {str} strUrl  合并的文件路径，需要手动创建空文件
 * @param  {fun} filter  过滤器
 * @return 
 */
function merge(arrUrls, strUrl, filter) {
  var content = '';
  if (fs.existsSync(strUrl) == false) {
    console.error(strUrl + ' 不存在，合并失败');
    return;
  }
  // 遍历url并读取文件内容
  if (arrUrls && arrUrls.length && strUrl) {
    arrUrls.forEach(function(url) {
      if (fs.existsSync(url) == false) {
        return;
      }
      let st = fs.statSync(url);
      if (st.isFile()) {
        // 如果是文件
        content += fs.readFileSync(url);
      } else if (st.isDirectory()) {
        // 作为文件夹
        fs.readdirSync(url).forEach(function(filename) {
          if(filename.substring(0,1)=='.') return;
          let dir = path.join(url, filename);
          if (fs.statSync(dir).isFile()) {
            content += fs.readFileSync(dir);
          }
        });
      }
    });
    if (typeof filter == 'function') {
      content = filter(content);
    }
    // 写入新目录
    // 写入项目配置数据
    fs.writeFile(strUrl, content.trim(), function() {
      console.log('资源合并为 ' + strUrl + ' 成功');
    });
  }
};


/**
 * 合并 Home 模块的 css 文件
 */
var cssTimer = null;
const cssFileArr = [
  './public/assets/home/css/src/variables.css',
  './public/assets/home/css/src/style.css',
  './public/assets/home/css/src/normalize.css',
  './public/assets/home/css/src/iconfont.css',
  './public/assets/home/css/src/pagination.css',
  './public/assets/home/css/src/page.css',
  './public/assets/home/css/src/sider.css',
  './public/assets/home/css/src/category.css',
  './public/assets/home/css/src/article.css',
  './public/assets/home/css/src/search.css',
  './public/assets/home/css/src/header.css',
  './public/assets/home/css/src/images-item.css',
  './public/assets/home/css/src/media-item.css',
  './public/assets/home/css/src/footer.css',
  './public/assets/home/css/src/breadcrumbs.css',
  './public/assets/home/css/src/bar.css',
  './public/assets/home/css/src/toast.css',
  './public/assets/home/css/src/docs.css',
  './public/assets/home/css/src/home.css',
  './public/assets/home/css/src/login.css',
  './public/assets/home/css/src/slider.css'
];

fs.watch('./public/assets/home/css/src', {
    recursive: true
}, (eventType, filename) => {
    // 定时器让多文件同时变更只会只会执行一次合并
    clearTimeout(cssTimer);
    console.log(filename + ' 发生了 ' + eventType);
    cssTimer = setTimeout(() => {
        merge(cssFileArr,'./public/assets/home/css/style.css');
    }, 100);
});


/**
 * 合并 admin 模块的 css 文件
 */
var adminCssTimer = null;
const adminCssFileArr = [
  './public/assets/admin/css/src/normalize.css',
  './public/assets/admin/css/src/variables.css',
  './public/assets/admin/css/src/button.css',
  './public/assets/admin/css/src/dashboard.css',
  './public/assets/admin/css/src/editor.css',
  './public/assets/admin/css/src/form.css',
  './public/assets/admin/css/src/header.css',
  './public/assets/admin/css/src/home.css',
  './public/assets/admin/css/src/iconfont.css',
  './public/assets/admin/css/src/login.css',
  './public/assets/admin/css/src/pagination.css',
  './public/assets/admin/css/src/preview.css',
  './public/assets/admin/css/src/side-menu.css',
  './public/assets/admin/css/src/style.css',
  './public/assets/admin/css/src/tab.css',
  './public/assets/admin/css/src/table.css',
  './public/assets/admin/css/src/text.css',
  './public/assets/admin/css/src/toast.css',
  './public/assets/admin/css/src/upload.css',
  './public/assets/admin/lib/ui/light-tip.css',
];
fs.watch('./public/assets/admin/css/src', {
    recursive: true
}, (eventType, filename) => {
    clearTimeout(adminCssTimer);
    console.log(filename + ' 发生了 ' + eventType);
    adminCssTimer = setTimeout(() => {
        merge(adminCssFileArr,'./public/assets/admin/css/style.css');
    }, 100);
});


