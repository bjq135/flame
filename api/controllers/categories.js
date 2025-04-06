const i18n = require('i18n');
const Validator = require('hot-validator');

const commonUtil = require('../../utils/common.js');
const dbUtil = require('../../utils/db.js');

const CategoriesService = require('../services/categories.js');

async function index(req, res) {
  const categoryService = new CategoriesService();
  let categories = await categoryService.getCategories();

  res.json(categories);
}


async function show(req, res) {
  const categoryService = new CategoriesService();
  let category = await categoryService.getCategoryById(req.params.id);

  res.json(category);
}


async function store(req, res) {
  req.body.user_id = req.userId;

  let validator = new Validator();
  let rules = {
    title: { type: 'string', min: 1, max: 50 },
    parent_id: { type: 'integer', required: false},
    description: { type: 'string', required: false},
    list_order: { type: 'integer', required: false },
    is_show: { type: 'integer', required: false }
  };

  var errors = validator.validate(req.body, rules);
  if (errors && errors.length) {
    res.status(400).json({ error: errors[0].message });
    return;
  }  

  try {
    const categoriesService = new CategoriesService();
    var result = await categoriesService.store(req.body);
    var category = await categoriesService.getCategoryById(result.insertId);

    let metaArr = await dbUtil.findAll('tb_category_meta', {
      where:{ category_id:category.id }
    });
    category.meta = {}
    metaArr.forEach((item, index)=>{ category.meta[item.meta_key]=item.meta_value; });

    res.status(201);
    res.json(category);
  } catch (error) {
    res.status(500);
    res.json({ error: error.message });
  }
}


async function update(req, res) {
  req.body.user_id = req.userId;
  req.body.id = req.params.id;

  let validator = new Validator();
  let rules = {
    title: { type: 'string', min: 1, max: 50 },
    parent_id: { type: 'integer', required: false},
    description: { type: 'string', required: false},
    list_order: { type: 'integer', required: false },
    is_show: { type: 'integer', required: false }
  };

  var errors = validator.validate(req.body, rules);
  if (errors && errors.length) {
    res.status(400).json({ error: errors[0].message });
    return;
  }

  try {
    const categoriesService = new CategoriesService();
    var result = await categoriesService.update(req.body);
    if(result.affectedRows == 0){
      res.status(404).json({error: i18n.__(404)});
      return;
    }
    res.json({ message: i18n.__('update success') });
  } catch (error) {
    console.log('error: ', error);
    res.status(500);
    res.json({ error: error.message });
  }
}


async function destroy(req, res) {
  try {
    const categoriesService = new CategoriesService();
    let results = await categoriesService.destroy(req.params.id);
    res.status(204).json({});
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
}



module.exports = {
  index,
  show,
  store,
  update,
  destroy
};

