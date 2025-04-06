const config = require('../config.js');

/**
 * <select> 生成带有层级的 option 递归函数
 * @param {*} id 父分类 ID
 * @param {*} arr 所有分类列表
 * @param {*} nbsp 分级符号
 * @param {*} selectedId 当前被选中的分类
 */
function getOptions(id, arr, nbsp, selectedId) {
  var options = "";
  var space = nbsp;
  nbsp += "&nbsp;&nbsp;&nbsp;";
  // 获取一级分类
  var childArr = new Array();
  for (var i in arr) {
    if (arr[i].parent_id == id)
      childArr.push(arr[i]);
  }

  var icon = (id == 0) ? '' : ' ├ ';
  for (var i in childArr) {
    options += '<option value="' + childArr[i].id + '"';
    if (selectedId == childArr[i].id) {
      options += ' selected="selected"';
    }
    options += '>' + space + icon + childArr[i].title + '</option>';
    options += getOptions(childArr[i].id, arr, nbsp, selectedId);
  }

  return options;
}


/**
 * 生成带有层级的 option 递归函数
 * @param {integer} parent_id 父分类 ID
 * @param {array} arr 所有分类列表
 * @param {string} nbsp 分级符号
 * @param {array} ids 所属分类ID数组，没有的话，需要传入一个空数组
 * @param {string} name <select> 标签名
 * @returns {string}
 */
function getManyCategory(parent_id, arr, nbsp, ids, name = 'tags[]') {
  var options = "";
  var space = nbsp;
  nbsp += "&nbsp;&nbsp;&nbsp;";
  // 获取一级分类
  var childArr = new Array();
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].parent_id == parent_id) {
      childArr.push(arr[i]);
    }
  }

  var icon = (parent_id == 0) ? '' : ' ├ ';
  for (let i = 0; i < childArr.length; i++) {
    options += '<label>';
    options += '<input type="checkbox" value="' + childArr[i].id + '"';
    if (ids.indexOf(childArr[i].id) > -1) {
      options += ' checked="checked"';
    }
    // 如果 ids 是空数组，让第一个 option 选中
    if (ids.length == 0 && i == 0 && parent_id == 0) {
      options += ' checked="checked"';
    }
    options += `name="${name}">` + space + icon + childArr[i].title;
    options += '</label>';
    options += getManyCategory(childArr[i].id, arr, nbsp, ids, name);
  }

  return options;
}

function getChildrenHTML(nav) {
  var html = ``;
  for (let item of nav) {
    let hasChildren = item.children && item.children.length;
    html += `<li ${hasChildren ? 'class=\"menu-item-has-children\"' : ''}>`;
    html += `<a href='${item.url}'>
              ${item.title}
              ${hasChildren ? '<i class=\"iconfont\">&#xe8a4;</i>' : ''}
            </a>`;
    if (hasChildren) {
      html += `<ul class="child-menu">`;
      html += getChildrenHTML(item.children);
      html += `</ul>`;
    }
    html += `</li>`;
  }
  return html;
}


function getMenuHtml(n) {
  let html = `<ul class='mobile-ul'>`;
  html += getChildrenHTML(n);
  html += `</ul>`;
  return html;
}

function getMenuHtmlPc(n) {
  let html = `<ul class='pc-nav'>`;
  html += getChildrenHTML(n);
  html += `</ul>`;
  return html;
}


/**
 * 生成菜单
 * @param  {integer} parentId 父ID
 * @param  {Array}   arr      所有数组
 * @param  {String}  classStr ul类名
 * @return {String}           菜单字符串
 */
function getMenu(parentId, arr, classStr="menu"){
  classStr = parentId==0 ? classStr : 'child-menu';

  let html = `<ul class='${classStr}'>`;
  for (var i = 0; i < arr.length; i++) {
    if(arr[i].parent_id != parentId) continue;
    let item = arr[i];
    let children = arr.filter((element) => { return element.parent_id == item.id });
    let hasChildren = children.length > 0 ? true : false;

    html += `<li ${hasChildren ? 'class=\"menu-item-has-children\"' : ''}>`;
    html += `   <a href='${item.url}'>
                  ${item.title}
                  ${hasChildren ? '<i class=\"iconfont arrow\">&#xe8a4;</i>' : ''}
                </a>`;

    if (hasChildren) {
      html += getMenu(item.id, arr, '');
    }

    html += `</li>`;
  }
  html += `</ul>`;

  return html;
}


//获取图片地址
function getImageUrl(url) {
  if (url) {
    return config.imagePath + "/uploads/images/" + url;
  } else {
    return config.imagePath + "/assets/admin/images/no-thumbnail.png";
  }
}


// 获取头像地址
function getAvatarUrl(url) {
  if (url) {
    return config.imagePath + "/uploads/avatars/" + url;
  } else {
    return config.imagePath + "/assets/admin/images/avatar.jpg";
  }
}


function isChecked(type, currentType){
  return type == currentType ? 'checked="checked"' : '';
}


module.exports = {
  getOptions,
  getManyCategory,
  getChildrenHTML,
  getMenuHtml,
  getMenuHtmlPc,
  getImageUrl,
  getAvatarUrl,
  getMenu,
  isChecked
}
