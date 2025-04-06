const dbUtil = require('../../utils/db.js');
const commonUtil = require('../../utils/common.js');

const TagsService = require('../services/tags.js');

async function index(req, res) {
  let page = req.query.page > 0 ? parseInt(req.query.page) : 1;
  let perPage = req.query.per_page > 0 ? parseInt(req.query.per_page) : 10;
  let start = perPage * (page - 1);
  
  const obj = {
    limit:perPage,
    offset:start,
    order:{id:'desc'}
  };
  
  const tags = await dbUtil.findAll('tb_tag', obj);
  let total = await dbUtil.findCounter('tb_tag', obj);
  res.append('X-Total', total);
  res.append('X-TotalPages', Math.ceil(total/perPage));
  res.json(tags);
}


async function store(req, res) {
  if( String(req.body.title).trim() == ''){
    return res.status(400).json({error:"请输入标签名"});
  }
  
  let data = {};
  data.title = req.body.title;
  data.list_order = req.body.list_order;

  try {
    const tagsService = new TagsService();
    let result = await tagsService.store(data.title, data.list_order);
    result = await tagsService.get(result.insertId);
    res.status(201).json(result);
  } catch (error) {
    console.log('error: ', error);
    res.status(500).json({ error: error.message });
  }
}


async function update(req, res) {
  if( String(req.body.title).trim() == ''){
    return res.status(400).json({error:"请输入标签名"});
  }
  
  let id = req.body.id;
  let tag_title = req.body.title;
  let list_order = req.body.list_order;
  
  try {
    const tagsService = new TagsService();
    let result = await tagsService.update(id, tag_title, list_order);
    result = await tagsService.get(id);
    res.status(200).json(result);
  } catch (error) {
    console.log('error: ', error);
    res.status(500).json({ error: error.message });
  }
}


async function destroy(req, res) {
  let tagID = req.params.id;
  try {
    const tagsService = new TagsService();
    let result = await tagsService.destroy(tagID);
    res.status(204).json({});
  } catch (error) {
    console.log('error: ', error.message);
    res.status(500).json({ error: error.message });
  }
}


async function show(req, res) {
  ctx.body = '查询'
}

module.exports = {
  index,
  store,
  update,
  destroy,
  show
}
