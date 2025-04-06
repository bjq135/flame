const fs = require('node:fs');
const crypto = require('node:crypto');
const config = require('../config.js');

function isMobile(s) {
  var mobilePattern = /^1[3-9][0-9]{9}$/;
  // mobilePattern = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(14[0-9]{1})|)+\d{8})$/;
  return mobilePattern.test(s);
};

function isEmail(email) {
  var emailPattern = /^[a-z0-9\!\#\$\%\&\'\*\+\/\=\?\^\_\`\{\|\}\~\-]+(?:\.[a-z0-9\!\#\$\%\&\'\*\+\/\=\?\^\_\`\{\|\}\~\-]+)*@(?:[a-z0-9](?:[a-z0-9\-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9\-]*[a-z0-9])?$/i;
  return emailPattern.exec(email);
}

function md5(v) {
  var md5 = crypto.createHash('md5');
  var str = md5.update(v).digest('hex');
  return str;
}

/**
 * 创建时间戳
 * @returns String
 */
// function createTimestamp() {
//   return Math.round(new Date() / 1000);
// }

/**
 * 格式化时间为 2021-12-10 08:56:23
 * @param {string} inputTime 秒或者微秒的时间戳
 * @returns {string}
 */
function formatDateTime(inputTime) {
  inputTime = +inputTime || new Date().getTime();

  if (('' + inputTime).length === 10) {
    inputTime = parseInt(inputTime) * 1000;
  }

  var date = new Date(inputTime);
  var y = date.getFullYear();
  var m = date.getMonth() + 1;
  m = m < 10 ? ('0' + m) : m;
  var d = date.getDate();
  d = d < 10 ? ('0' + d) : d;
  var h = date.getHours();
  h = h < 10 ? ('0' + h) : h;
  var minute = date.getMinutes();
  var second = date.getSeconds();
  minute = minute < 10 ? ('0' + minute) : minute;
  second = second < 10 ? ('0' + second) : second;
  return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;
}

/**
 * 格式化时间为 2021-12-10
 * @param {string} inputTime 秒或者微秒的时间戳，参数为空时，当前的时间戳
 * @returns 
 */
function formatDate(inputTime) {
  inputTime = +inputTime || new Date().getTime();

  if (('' + inputTime).length === 10) {
    inputTime = parseInt(inputTime) * 1000;
  }

  var date = new Date(inputTime);
  var y = date.getFullYear();
  var m = date.getMonth() + 1;
  m = m < 10 ? ('0' + m) : m;
  var d = date.getDate();
  d = d < 10 ? ('0' + d) : d;

  return y + '-' + m + '-' + d;
}

/**
 * 删除字符换中的 HTML 标签
 * @param {string} str HTML 字符串
 * @returns 
 */
function delHtmlTag(str) {
  if (typeof str != 'string') { return ''; }
  str = str.replace(/<\/?[^>]*>/g, ''); //去除HTML tag
  str = str.replace(/[ | ]*\n/g, '\n'); //去除行尾空白
  str = str.replace(/\n[\s| | ]*\r/g, '\n'); //去除多余空行
  str = str.replace(/&nbsp;/ig, ' ');//去掉&nbsp;
  str = str.replace(/&gt;/ig, ' '); //去掉 >
  str = str.replace(/&lt;/ig, ' '); //去掉 <
  return str.replace(/<[^>]+>/g, "");
}

/**
 * HTML 编码：特殊字符转换成 html 实体
 * 参考《白帽子讲 Web 安全》 3.3.3，为了对抗 XXS，至少转换一下字符。
 * @param {string} str 
 * @returns string
 */
function htmlEncode(str) {
  str = "" + str;

  str = str.replace(/&/g, "&amp;");
  str = str.replace(/</g, "&lt;");
  str = str.replace(/>/g, "&gt;");
  str = str.replace(/"/g, "&quot;");
  str = str.replace(/'/g, "&#x27;"); //&apos;不推荐
  str = str.replace(/\//g, "&#x2F;"); //反斜线可能会闭合一些HTML entity

  return str;
}

// HTML 解码：html 实体转特殊字符
function htmlDecode(str) {
  str = "" + str;

  str = str.replace(/&amp;/g, "&");
  str = str.replace(/&lt;/g, "<");
  str = str.replace(/&gt;/g, ">");
  str = str.replace(/&quot;/g, '"');
  str = str.replace(/&apos;/g, "'");
  str = str.replace(/&#x27;/g, "'");
  str = str.replace(/&#x2F;/g, "/");

  return str;
}

// 获取文章详情中图片的 url
function getContent(str) {
  var pattern = /(?:src=|data-original=)[\'\"]?([^\'\"]*)[\'\"]?/gi;
  matches = str.match(pattern);
  matches && matches.forEach(function (item, index) {
    var url = item.match(/src=[\'\"]?([^\'\"]*)[\'\"]?/i)[1];
    console.log(url);
    if (url.substr(0, 4) != 'http') {
      str = str.replace(url, config.imagePath + url);
    }
  });
  return str;
}


//获取图片地址，【接口专用】
function getImageUrl(url) {
  if (url) {
    return config.imagePath + "/uploads/images/" + url;
  } else {
    return "";
  }
}

// 获取头像地址，【接口专用】
function getAvatarUrl(url) {
  if (url) {
    return config.imagePath + "/uploads/avatars/" + url;
  } else {
    return "";
  }
}

// 生成月日年
function createYmd() {
  var year = new Date().getFullYear().toString();
  var month = new Date().getMonth() + 1 < 10 ? '0' + (new Date().getMonth() + 1).toString() : (new Date().getMonth() + 1).toString();
  var date = new Date().getDate() < 10 ? '0' + new Date().getDate().toString() : new Date().getDate().toString();
  return year + month + date;
}

// 创建文件夹
function createFolder(folder) {
  try {
    fs.accessSync(folder);
  } catch (e) {
    fs.mkdirSync(folder);
  }
};

// Stream Pipe 复制文件
function pipe(dst, target) {
  var reader = fs.createReadStream(dst);
  var writer = fs.createWriteStream(target);
  reader = reader.pipe(writer);

  var promise = new Promise(function (resolve, reject) {
    reader.on('error', function (err) {
      reject(err)
    });
    reader.on('close', function () {
      resolve(reader);
    });
  });
  return promise;
}


/**
 * uuid 生成函数
 * // 8 character ID (base=2)  uuid(8, 2)  //  "01001010"
 * // 8 character ID (base=10) uuid(8, 10) // "47473046"
 * @param {int} len 长度
 * @param {int} radix 基数
 * @returns {string}
 */
function uuid(len, radix) {
  var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
  var uuid = [], i;
  radix = radix || chars.length;

  if (len) {
    // Compact form
    for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
  } else {
    // rfc4122, version 4 form
    var r;

    // rfc4122 requires these characters
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
    uuid[14] = '4';

    // Fill in random data.  At i==19 set the high bits of clock sequence as
    // per rfc4122, sec. 4.1.5
    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | Math.random() * 16;
        uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
      }
    }
  }

  return uuid.join('');
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + " Bytes";
  else if (bytes < 1048576) return (bytes / 1024).toFixed(3) + " KB";
  else if (bytes < 1073741824) return (bytes / 1048576).toFixed(3) + " MB";
  else return (bytes / 1073741824).toFixed(3) + " GB";
};

// 对象处理，查询数据字段 'user.nickname' 转对象 user:{nickname}
function dataShow(obj) {
  for (const key in obj) {
    let keyArr = key.split('.');
    if (keyArr.length >= 2) {
      obj[String(keyArr[0])] = obj[String(keyArr[0])] ? obj[String(keyArr[0])] : {};
      obj[String(keyArr[0])][String(keyArr[1])] = obj[key];
      delete obj[key];
    }
  }
  return obj;
}

/**
 * 获取自己的所有子标签
 * @param {array} all [{id,title,parent_id},{id,title,parent_id}...]
 * @param {int} parentId 父ID
 */
function getChildren(all, parentId) {
  var children = [];
  for (var i = 0; i < all.length; i++) {
    if (all[i].parent_id == parentId) {
      children.push(all[i]);
      children.push(...getChildren(all, all[i].id));
    }
  }
  return children;
}

/**
 * 获取自己的所有父标签 （返回数组的第一项是顶级父元素）
 * @param {array} all [{id,title,parent_id},{id,title,parent_id}...]
 * @param {int} childId 子ID
 */
function getParents(all, childId) {
  var parents = [];
  for (var i = 0; i < all.length; i++) {
    if (all[i].id == childId) {
      parents.unshift(all[i]);
      parents.unshift(...getParents(all, all[i].parent_id));
    }
  }
  return parents;
}

/**
 * 获取自己的所有子对象树
 * @param {array} all [{id,title,parent_id},{id,title,parent_id}...]
 * @param {int} parentId 父ID
 */
function getChildrenTree(all, parentId) {
  var children = [];
  for (var i = 0; i < all.length; i++) {
    if (all[i].parent_id == parentId) {
      let c = getChildrenTree(all, all[i].id);
      if (c.length) {
        all[i]['children'] = c;
      }
      children.push(all[i]);
    }
  }
  return children;
}

/**
 * 截取邮箱或者手机号作为昵称
 * @param {string} account 
 * @returns {string}
 */
function createFakeNickname(account) {
  let nickname = account.slice(0, 3) + '****' + account.slice(account.length - 4);
  return nickname;
}

function getUserId(ctx) {
  let userId = ctx.state.userId;
  if (userId === undefined) {
    ctx.status = 401;
    return ctx.body = { error: i18n.__('401') };
  }
  return userId;
}

/**
 * 格式化金额
 * @param {float} num 
 * @returns {string}
 */
function formatAmount(num) {
  var result = [], temp_arr = [], counter = 0;
  num = (num || 0);

  //先用小数点分割，格式化整数部分
  temp_arr = num.toString().split('.');
  //整数部分
  num = temp_arr[0];
  //把整数部分分割成单个字符数组
  num = num.split('');

  for (var i = num.length - 1; i >= 0; i--) {
    counter++;
    result.unshift(num[i]);
    if (!(counter % 3) && i != 0) {
      result.unshift(',');
    }
  }
  // result.unshift("¥");

  //temp_arr数组长度为2表示有小数
  if (temp_arr.length == 2) {
    result.push('.' + temp_arr[1]);
  }

  result = result.join('');
  return result;
}

/**
 * 获取浏览器类型
 * @param  {string} ua navigator.userAgent
 * @return {string} 浏览器名称
 */
function getBrowserType(ua) {
  var isOpera = ua.indexOf('Opera') > -1
  if (isOpera) { return 'Opera' }
  var isIE = (ua.indexOf('compatible') > -1) && (ua.indexOf('MSIE') > -1) && !isOpera
  var isIE11 = (ua.indexOf('Trident') > -1) && (ua.indexOf("rv:11.0") > -1)
  if (isIE11) { return 'IE11'
  } else if (isIE) {
    var re = new RegExp('MSIE (\\d+\\.\\d+);')
    re.test(ua)
    var ver = parseFloat(RegExp["$1"])
    if (ver == 7) { return 'IE7'
    } else if (ver == 8) { return 'IE8'
    } else if (ver == 9) { return 'IE9'
    } else if (ver == 10) { return 'IE10'
    } else { return "IE" }
  }
  var isEdge = ua.indexOf("Edge") > -1
  if (isEdge) { return 'Edge' }
  var isFirefox = ua.indexOf("Firefox") > -1
  if (isFirefox) { return 'Firefox' }
  var isSafari = (ua.indexOf("Safari") > -1) && (ua.indexOf("Chrome") == -1)
  if (isSafari) { return "Safari" }
  var isChrome = (ua.indexOf("Chrome") > -1) && (ua.indexOf("Safari") > -1) && (ua.indexOf("Edge") == -1)
  if (isChrome) { return 'Chrome' }
  var isUC= ua.indexOf("UBrowser") > -1
  if (isUC) { return 'UC' }
  var isQQ= ua.indexOf("QQBrowser") > -1
  if (isUC) { return 'QQ' }
  return ''
}


function makeMenu(arr){
  let menus = '';
  if(arr.length){
    menus += '<ul class="article-list">';
    for(var i in arr){
      menus += `<li class="article-item ${arr[i].children ? ' has-child' : ''}">`;
      menus += `<a href="${arr[i].url ? arr[i].url : 'javascript:;'}" target="_blank">${arr[i].title}</a>`
      if(arr[i].children){
        menus += makeMenu(arr[i].children);
      }
      menus += '</li>';
    }
    menus += '</ul>';
  }
  return menus;
}


module.exports = {
  isMobile,
  isEmail,
  md5,
  formatDateTime,
  formatDate,
  delHtmlTag,
  htmlEncode,
  htmlDecode,
  getContent,
  getImageUrl,
  getAvatarUrl,
  createYmd,
  createFolder,
  pipe,
  uuid,
  formatBytes,
  dataShow,
  getChildren,
  getParents,
  getChildrenTree,
  createFakeNickname,
  formatAmount,
  getBrowserType,
  makeMenu
};
