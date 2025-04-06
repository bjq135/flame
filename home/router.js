const express = require("express");
const router = express.Router();

const auth = require('../middlewares/auth.js');
const home = require('../middlewares/home.js');

const indexController = require('./controllers/index.js');
const articlesController = require('./controllers/articles.js');
const categoriesController = require('./controllers/categories.js');
const pagesController = require('./controllers/pages.js');
const tagsController = require('./controllers/tags.js');

router.use(auth.authInit);
router.use(home);

router.get(`/`, indexController.index);
router.get(`/search`, indexController.search);

router.get(`/categories/:id`, categoriesController.show);

router.get(`/articles/:id`, articlesController.show);
router.get(`/pages/:id`, pagesController.show);
router.get(`/tags/:tag_title`, tagsController.index);

// 兼容之前的旧地址
router.get(`/article`, (req,res)=>{ res.redirect('/articles/'+req.query.id);});


module.exports = router;

