const path = require('node:path');
const { fileURLToPath } = require('node:url');

const i18n = require('i18n');
const config = require("../../config.js");

i18n.configure({
  locales: ['en-US', 'zh-CN'],
  defaultLocale: config.language ? config.language : 'en-US',
  directory: __dirname + '/locales',
  updateFiles: false,
  indent: '\t',
  extension: '.json'
});

module.exports = function (app) {
  app.use(i18n.init);
}
