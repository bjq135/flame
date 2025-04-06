const i18n = require('i18n');
const Validator = require('hot-validator');

const dbUtil = require("../../utils/db.js");
const commonUtil = require("../../utils/common.js");


async function index(req, res) {
  let rows = await dbUtil.findAll('tb_permission', {where:{}});
  res.json(rows);
}

module.exports = { index };