const path = require('node:path');
const fs = require('node:fs');

const config = require('./config.js');

const express = require('express');
const app = express();
app.disable('x-powered-by');

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'boar-session',
  keys: ['boar'],
  maxAge:172800000,
  httpOnly:false,
  sameSite:'lax',
  secure:false
}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

const methodOverride = require('method-override');
app.use(methodOverride('X-HTTP-Method-Override'));

// 解析 HTTP BODY
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const responseTime = require('response-time');
app.use(responseTime());

const cors = require('./middlewares/cors.js');
app.use(cors);

// 静态目录
app.use(express.static('public'));

// 模板引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './home/views') );
app.engine('.html', require('ejs').__express);

// i18n 国际化
const i18n = require('./utils/i18n/index.js');
i18n(app);
 
// 路由
const homeRouter = require('./home/router');
app.use(homeRouter);
const router = require('./api/router');
app.use(router);

// 错误处理
const error = require('./middlewares/error.js');
app.use(error);

const port = config.service.port;
app.listen(port, () => {
  console.log(`running on: http://127.0.0.1:${port}`);
});
