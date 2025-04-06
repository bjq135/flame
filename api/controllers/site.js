const dbUtil = require('../../utils/db.js');

async function updateOption(req, res) {
  try {
    let sql, rows, results, replacements;

    replacements = { option_name:req.body.option_name, option_value:req.body.option_value };

    sql = 'SELECT * FROM tb_option WHERE option_name=?';
    [rows] = await dbUtil.execute(sql, [req.body.option_name]);
    if(rows.length){
      sql = `UPDATE tb_option SET option_value=:option_value WHERE option_name=:option_name`;
      [results] = await dbUtil.execute(sql, replacements);
      res.json({'message':'修改成功'});
      return;
    }

    sql = `INSERT INTO tb_option (option_name, option_value) VALUES (:option_name, :option_value)`;
    [results] = await dbUtil.execute(sql, replacements);
    console.log('results ', results)
    res.send('接口接口');
  } catch(e) {
    res.status(500);
    res.json({error:'错误：' + e.message });
  }
}

module.exports = { updateOption };