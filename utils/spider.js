/*
 * 爬虫
 * @date: 2021-11-23
 */

import fs from 'node:fs';
import http from 'node:http';
import https from 'node:https';
import iconv from 'iconv-lite';


async function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('sleep for ' + ms + ' ms');
    }, ms);
  });
}

// 下载指定页面 HTML
function getHtml(url, option = { family: 4 }) {
  var httpClient = http;
  if (url.substr(0, 5) == "https") {
    httpClient = https;
  }
  return new Promise(function (resolve, reject) {
    var req = httpClient.get(url, option, function (res) {
      const { statusCode } = res;
      if (statusCode !== 200) {
        resolve("");
      }
      var html = '';
      res.setEncoding('binary');
      res.on('data', function (data) {
        html += data;
      });
      res.on('end', function () {
        // html = iconv.decode(html, "EUC-JP");
        // html = iconv.decode(html, "utf8");
        resolve(html);
      });
    }).on('error', function (err) {
      console.log("下载指定页面 HTML 失败：", url, err);
      reject(false);
    });
    req.setTimeout(5000, function () {
      console.log("下载超时：", url);
      resolve("");
    });
  });
}



// 下载图片
function downloadImage(url, dir) {
  return new Promise(function (resolve, reject) {
    try {
      console.log("下载图片： ", url);
      // 图片地址
      var urlArr = url.split("/");
      var image_url = dir + "/" + urlArr[urlArr.length - 1];

      // 下载图片
      var httpClient = http;
      if (url.substr(0, 5) == "https") {
        httpClient = https;
      }

      var clientRequest = httpClient.get(url, { family: 6 }, function (res) {
        var imgData = "";
        res.setEncoding("binary");
        res.on("data", function (chunk) {
          // console.log(chunk);
          imgData += chunk;
        });
        res.on("end", function () {
          fs.writeFile("../../" + image_url, imgData, "binary", function (err) {
            if (!err) {
              resolve(image_url);
            } else {
              console.log("downloadImage function http res end Error: ", err);
              reject(false);
            }
          });
        });
        res.on("error", function (error) {
          console.log("downloadImage function http res Error: ", error);
          reject(false);
        });
      });

      clientRequest.on("error", function (error) {
        console.log("downloadImage function clientRequest Error: ", error);
        reject(false);
      });

      // clientRequest.setTimeout(30000, function () {
      //   console.log("下载超时：", url);
      //   reject(false);
      // });
    } catch (error) {
      console.log("download img catch: ", error);
      reject(false);
    }
  });
}


// 获取文章页中的图片地址
function getImageArr(str) {
  var pattern = /(?:src=|data-original=)[\'\"]?([^\'\"]*)[\'\"]?/gi;
  var img_arr = [];
  var img_obj = [];
  while (img_obj = pattern.exec(str)) {
    img_arr.push(img_obj[1]);
  }
  return img_arr;
}


// 读取路径信息
function getStat(path) {
  return new Promise((resolve, reject) => {
    fs.stat(path, (err, stats) => {
      if (err) {
        resolve(false);
      } else {
        resolve(stats);
      }
    })
  })
}


// 创建路径
function mkdir(dir) {
  return new Promise((resolve, reject) => {
    fs.mkdir(dir, err => {
      if (err) {
        resolve(false);
      } else {
        resolve(true);
      }
    })
  })
}


// 删除路径
function deleteFolderRecursive(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function (file) {
      var curPath = path + "/" + file;
      if (fs.statSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

export default {
  sleep,
  getHtml,
  downloadImage,
  getImageArr,
  getStat,
  mkdir,
  deleteFolderRecursive
};
