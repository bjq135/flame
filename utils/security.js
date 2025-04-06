import xss from 'xss';

/**
 * HTML 编码：特殊字符转换成 html 实体
 * 参考《白帽子讲 Web 安全》 3.3.3，为了对抗 XXS，至少转换一下字符。
 * @param {string} str 
 * @returns string
 */
export function htmlEncode(str) {
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
export function htmlDecode(str) {
  str = "" + str;

  str = str.replace(/&amp;/g, "&");
  str = str.replace(/&#38;/g, "&");

  str = str.replace(/&lt;/g, "<");
  str = str.replace(/&#60;/g, "<");

  str = str.replace(/&gt;/g, ">");
  str = str.replace(/&#62;/g, ">");

  str = str.replace(/&quot;/g, '"');
  str = str.replace(/&#34;/g, '"');

  str = str.replace(/&apos;/g, "'");
  str = str.replace(/&#39;/g, "'");
  str = str.replace(/&#x27;/g, "'");

  str = str.replace(/&#x2F;/g, "/");

  return str;
}


// *** 考虑增加一个 javascriptEncode 使用 “\”,对特殊字符进行转义
export function javascriptEncode(str) {
  var hex = new Array('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f');

  function changeTo16Hex(charCode) {
    return "\\x" + charCode.charCodeAt(0).toString(16);
  }

  function encodeCharx(original) {
    var found = true;
    var thecharchar = original.charAt(0);
    var thechar = original.charCodeAt(0);
    switch (thecharchar) {
      case '\n': return "\\n"; break; //newline
      case '\r': return "\\r"; break; //Carriage return
      case '\'': return "\\'"; break;
      case '"': return "\\\""; break;
      case '\&': return "\\&"; break;
      case '\\': return "\\\\"; break;
      case '\t': return "\\t"; break;
      case '\b': return "\\b"; break;
      case '\f': return "\\f"; break;
      case '/': return "\\x2F"; break;
      case '<': return "\\x3C"; break;
      case '>': return "\\x3E"; break;
      default:
        found = false;
        break;
    }
    if (!found) {
      if (thechar > 47 && thechar < 58) { //数字
        return original;
      }

      if (thechar > 64 && thechar < 91) { //大写字母
        return original;
      }

      if (thechar > 96 && thechar < 123) { //小写字母
        return original;
      }

      if (thechar > 127) { //大于127用unicode
        var c = thechar;
        var a4 = c % 16;
        c = Math.floor(c / 16);
        var a3 = c % 16;
        c = Math.floor(c / 16);
        var a2 = c % 16;
        c = Math.floor(c / 16);
        var a1 = c % 16;
        return "\\u" + hex[a1] + hex[a2] + hex[a3] + hex[a4] + "";
      }
      else {
        return changeTo16Hex(original);
      }

    }
  }

  var preescape = str;
  var escaped = "";
  var i = 0;
  for (i = 0; i < preescape.length; i++) {
    escaped = escaped + encodeCharx(preescape.charAt(i));
  }
  return escaped;
}



/**
 * 基于白名单的 xss 过滤
 * 过滤富文本编辑器quill.mjs 的内容
 * @param {sring} htmlString 
 * @returns string
 */
export function xssFilter(htmlString) {
  htmlString = '' + htmlString;
  // xss 包所使用的配置文件
  var options = {
    whiteList: {
      a: ["href", "title", "target"],
      img: ['src'],
      h1: [],
      h2: [],
      h3: [],
      h4: [],
      h5: [],
      h6: [],
      p: ['class'],
      br: [],
      strong: [],
      em: [],
      u: [],
      s: [],
      blockquote: [],
      pre: ['class', 'spellcheck'],
      span: [],
      img: ['src']
    }
  };

  htmlString = xss(htmlString, options);
  return htmlString;
}


/**
 * 基础字符串验证
 * 含有 数字/汉字/字母/下划线 以为的下划线，返回 false，比如使用在用户名验证那里
 * @param {string} str 
 * @returns boolean
 */
export function isBasic(str) {
  return str
}


