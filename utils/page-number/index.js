/*
 * Bootstrap风格的分页
 * 2017年10月28日
 */

var arg = {};
arg.page = 1;        //当前页码
arg.pageNum = 10;     //总页码
arg.url = '';       //地址
arg.bothNum = 3; 		//两边保持数字分页的量
// arg.total = 0;

function prev() {
  if (arg.page == 1) {
    return '<li class="disabled page-item">\
                  <a class="page-link" href="javascript:;" aria-label="Previous">\
                      <span aria-hidden="true">上一页</span>\
                      <span class="sr-only">Previous</span>\
                  </a>\
              </li>\
              ';
  }
  return '\
          <li class="page-item">\
              <a class="page-link" href="' + arg.url + 'page=' + (arg.page - 1) + '"  aria-label="Previous">\
                  <span aria-hidden="true">上一页</span>\
                  <span class="sr-only">Previous</span>\
              </a>\
          </li>\
          ';
}


function pageList() {
  var pageList = '';
  var _page = null;

  for (var i = arg.bothNum; i >= 1; i--) {
    _page = arg.page - i;
    if (_page < 1) continue;
    pageList += ' <li class="page-item"><a class="page-link" href="' + arg.url + 'page=' + _page + '">' + _page + '</a></li>';
  }

  pageList += ' <li class="page-item active"><a class="page-link" >' + arg.page + '</a></li> ';

  for (var i = 1; i <= arg.bothNum; i++) {
    _page = arg.page + i;
    if (_page > arg.pageNum) break;
    pageList += '<li class="page-item"><a class="page-link" href="' + arg.url + 'page=' + _page + '">' + _page + '</a></li>';
  }
  return pageList;
}

function next() {
  if (arg.page == arg.pageNum) {
    return '<li class="disabled page-item">\
                  <a class="page-link" href="javascript:;" aria-label="Next">\
                      <span aria-hidden="true">下一页</span>\
                      <span class="sr-only">Next</span>\
                  </a>\
              </li>';
  }
  return '<li class="page-item">\
              <a class="page-link" href="' + arg.url + 'page=' + (arg.page + 1) + '" aria-label="Next">\
                  <span aria-hidden="true">下一页</span>\
                  <span class="sr-only">Next</span>\
              </a>\
          </li>';
}


function prevMore() {
  var str = '<li class="page-item"><a class="page-link" >...</a></li>';
  if (arg.page > arg.bothNum + 1) {
    return str;
  }
  return "";
}

function nextMore() {
  var str = '<li class="page-item"><a class="page-link" >...</a></li>';
  if (arg.page < (arg.pageNum - arg.bothNum)) {
    return str;
  }
  return "";
}

//req:req参数，page:当前页，total:总条数，page_size:每页显示多少条， bothNum 两边分页量
module.exports = function (req, page, total, page_size = 10, bothNum = 4) {
  if (total <= page_size) { return ""; } //如果，总条数小于每页显示数，不显示分页
  
  arg.url = req.originalUrl.split('?')[0];

  var searchObj = new URLSearchParams(req.originalUrl.split('?')[1]);
  searchObj.delete('page');

  let temp = searchObj.toString();
  if (temp) {
    arg.url += '?' + temp + '&';
  } else {
    arg.url += '?';
  }

  arg.page = page;
  arg.pageNum = Math.ceil(total / page_size);
  arg.bothNum = bothNum;

  var str = '<ul class="pagination pagination-sm nav">';
  str += prev();
  str += prevMore();
  str += pageList();
  str += nextMore();
  str += next();
  str += '</ul>';
  // str += JSON.stringify([page, total, page_size, bothNum]);
  return str;
}


