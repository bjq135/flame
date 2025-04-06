const fs = require('node:fs');
const path = require('node:path');
const url = require("node:url");

const i18n = require('i18n');
const Jimp = require('jimp');

const commonUtil = require('../../utils/common.js');
const dbUtil = require('../../utils/db.js');
const logger = require('../../utils/logger.js');

async function upload(req, res) {
  var userId = req.userId;
  try {
    // 1，检查文件上传信息
    const file = req.file;
    if (file.size > 2000 * 1000) {
      throw new Error( i18n.__('file size exceeds limit') );
    }

    // 2，检查文件类型，确认文件扩展名
    var allowImageType = ['image/png', 'image/jpeg'];
    if (allowImageType.indexOf(file.mimetype) == -1) {
      res.status(422);
      res.json({ error: file.mimetype + ' ' + i18n.__('422') });
      return;
    }

    // 3, 生成文件名
    var filename = commonUtil.uuid(20, 62);
    var extName = 'jpg';
    switch (file.mimetype) {
      case 'image/png':
        extName = 'png';
        break;
      case 'image/jpeg':
        extName = 'jpg';
        break;
      default:
        extName = 'png';
    }

    // 4, 创建路径
    var destDir = commonUtil.createYmd();
    var destPath = path.join(__dirname, '../../public/uploads/images/') + destDir;
    commonUtil.createFolder(destPath);

    // 5, 处理文件尺寸或者格式
    // var img = await Jimp.read(file.filepath);
    var img = await Jimp.read(file.buffer);
    var width = img.bitmap.width;
    var height = img.bitmap.height;
    
    if (req.query.original == "true") {
      fs.writeFileSync(destPath + '/' + filename + "." + extName, file.buffer);
    } else if (req.query.thumbnail == "true") {
      img = await img.cover(500, 500, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE);
      img = await img.quality(95);
      img = await img.writeAsync(destPath + '/' + filename + "." + extName);
    } else {
      img = await img.scaleToFit(1200, 1200, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE);
      img = await img.quality(95);
      img = await img.writeAsync(destPath + '/' + filename + "." + extName);
    }

    // 6, 添加到数据库
    var data = {};
    data.file_name = filename + "." + extName;
    data.file_path = destDir + "/" + filename + "." + extName;
    data.created_at = commonUtil.formatDateTime();
    data.suffix = extName;
    data.user_id = userId;
    data.parent_id = req.body.parent_id || '0';
    data.file_size = fs.statSync(destPath + '/' + filename + "." + extName).size;
    data.more = '';

    const result = await dbUtil.save('tb_asset', data);
    if (!result) {
      throw new Error(i18n.__('500'));
    }
    
    // 7, 返回信息
    data.id = result.insertId;
    data.url = commonUtil.getImageUrl(data.file_path);
    res.status(201).json(data);
  } catch (error) {
    logger.error('错误咯 错误咯');
    res.status(500);
    res.json({ error: error.message });
  }
}


module.exports = { upload };
