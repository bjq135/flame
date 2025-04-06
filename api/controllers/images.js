const fs = require('node:fs/promises');
const path = require('node:path');
const url = require("node:url");

const i18n = require('i18n');

const dbUtil = require("../../utils/db.js");
const commonUtil = require("../../utils/common.js");
const logger = require('../../utils/logger.js');


async function index(req, res) {
  let page = req.query.page > 0 ? parseInt(req.query.page) : 1;
  let perPage = req.query.per_page > 0 ? parseInt(req.query.per_page) : 10;
  let start = perPage * (page - 1);
  
  if(perPage > 50) {
    res.status(400).json({error:i18n.__('per_page is too large')});
    return;
  }
  
  const obj = {
    limit:perPage,
    offset:start,
    order:{id:'desc'}
  };

  const articles = await dbUtil.findAll('tb_asset', obj);
  articles.forEach((item, index)=>{
    articles[index].url = commonUtil.getImageUrl(item.file_path);
  });
  
  let total = await dbUtil.findCounter('tb_asset', obj);
  res.append('X-Total', total);
  res.append('X-TotalPages', Math.ceil(total/perPage));
  res.json(articles);
}


async function show(req, res){
  var imageId = req.params.id; 
  const image = await dbUtil.findOne('tb_asset', imageId);
  if (!image) {
    res.status(404).json({});
    return;
  }

  image.url = commonUtil.getImageUrl(image.file_path);
  res.json(image);
}


async function destroy(req, res) {
  var imageId = req.params.id;
  
  let conn = await dbUtil.getPoolConnection();
  try {
    await conn.query(`START TRANSACTION`);
    
    const image = await dbUtil.findOne('tb_asset', imageId, conn);
    if (!image) {
      res.status(204).json({});
      return;
    }
    
    let imagesPath = '../../public/uploads/images/';
    let filePath = path.join(__dirname, imagesPath) + image.file_path;
    let statInfo = await fs.stat(filePath);
    if(statInfo){
      await fs.unlink(filePath);
    }
    
    await dbUtil.destroy('tb_asset', {where:{id:imageId}}, conn);
    await conn.query(`COMMIT`);
    
    res.status(204);
    res.json({ message: i18n.__('204') });
  } catch (error) {
    await conn.query(`ROLLBACK`);
    logger.error(error.message);
    res.status(500).json({ error: error.message });
  } finally {
    await conn.release();
  }
}


module.exports = {
  index,
  show,
  destroy
};
