const i18n = require('i18n');
const Validator = require('hot-validator');

const dbUtil = require("../../utils/db.js");
const commonUtil = require("../../utils/common.js");
const rbacUtil = require('../../utils/rbac.js');


async function index(req, res){
  let page = req.query.page > 0 ? parseInt(req.query.page) : 1;
  let perPage = req.query.per_page > 0 ? parseInt(req.query.per_page) : 10;
  let start = perPage * (page - 1);

  let sql = `SELECT id, nickname, email, mobile, gender, birthday
             FROM tb_user 
             WHERE 1 LIMIT :limit OFFSET :offset`;
  let obj = { limit:perPage, offset:start };
  let [rows] = await dbUtil.execute(sql, obj);

  let [count] = await dbUtil.execute('SELECT count(id) AS counter FROM tb_user');
  res.append('X-Total', count[0].counter);
  // res.append('X-TotalPages', Math.ceil(total/perPage));


  res.json(rows);
}


async function store(req, res){
  // 权限检查
  console.log( await rbacUtil.getRoles(req.userId) )
  const currentUserId = req.userId;
  if( !await rbacUtil.can(currentUserId, '*') ){
    res.status(400).json({"error":"需要超级管理员权限"});
    return;
  }

  let someone;

  // 验证参数
  var validator = new Validator();
  var rules = {
    nickname: { type: 'string', min: 2, max: 20 },
    signature: { type: 'string', min: 2, max: 200, required:false },
    email: { type: 'string', min: 5, max: 50 },
    mobile: { type: 'string', min: 5, max: 50 },
    password: { type: 'string', min: 8, max: 50},
    gender: { type: 'integer', min: 0, max: 2, required:false},
    birthday: { type: 'string', min: 1, max: 50, required:false},
    avatar_id: { type: 'string', min: 1, max: 20, required:false },
    roles: { type: 'string', min: 1, max: 30, required:true }
  };
  var errors = validator.validate(req.body, rules);
  if (errors && errors.length) {
    res.status(400).json({ error: errors[0]['message'] });
    return;
  }

  // 验证手机号
  someone = await dbUtil.findOne('tb_user', {where:{mobile:req.body.mobile}});
  if(someone){
    res.status(400).json({ error:'该手机号已存在' });
    return;
  }

  // 验证邮箱
  someone = await dbUtil.findOne('tb_user', {where:{email:req.body.email}});
  if(someone){
    res.status(400).json({ error:'该邮箱已存在' });
    return;
  }

  let data = {
    "nickname":req.body.nickname,
    "password":req.body.password,
    "email":req.body.email,
    "mobile":req.body.mobile
  };
  data.password = commonUtil.md5(data.password);
  if( req.body.signature ){ data.signature = req.body.signature; }
  if( req.body.gender ){ data.gender = req.body.gender; }
  if( req.body.birthday ){ data.birthday = req.body.birthday; }

  // 验证头像
  if(req.body.avatar_id){
    if( await dbUtil.findOne('tb_asset', req.body.avatar_id) ){
      data.avatar_id = req.body.avatar_id;
    }
  }

  let result = await dbUtil.save('tb_user', data);
  let userId = result.insertId;
  let user = await dbUtil.findOne('tb_user', userId);
  delete(user.password);

  // 添加角色
  if(req.body.roles && req.body.roles.split){
    let roleIds = req.body.roles.split(',');
    for (var i = 0; i < roleIds.length; i++) {
      if(await dbUtil.findOne('tb_role', roleIds[i])){
        await dbUtil.save('tb_user_to_role', {user_id:userId,role_id:roleIds[i]});
      }
    }
  }

  let sql = `SELECT r.* FROM tb_user_to_role AS utr
              LEFT JOIN tb_role AS r ON r.id=utr.role_id
              WHERE utr.user_id=?`;
  let [rows] = await dbUtil.execute(sql, [userId]);
  user.roles = rows;

  res.status(201).json(user);
}


async function update(req, res){
  // 权限检查
  const currentUserId = req.userId;
  if( !await rbacUtil.can(currentUserId, '*') ){
    res.status(400).json({"error":"需要超级管理员权限"});
    return;
  }

  console.log('currentUserId', await rbacUtil.getRoles(currentUserId))

  let sql, rows, someone;

  let userId = req.params.id;
  let user = await dbUtil.findOne('tb_user', userId);

  if(!user){
    res.status(404).json({error:"找不到该用户"});
    return;
  }

  // 验证参数
  var validator = new Validator();
  var rules = {
    nickname: { type: 'string', min: 2, max: 20, required:false },
    signature: { type: 'string', min: 2, max: 200, required:false },
    email: { type: 'string', min: 5, max: 50, required:false },
    mobile: { type: 'string', min: 5, max: 50, required:false },
    password: { type: 'string', min: 8, max: 50, required:false},
    gender: { type: 'integer', min: 1, max: 2, required:false},
    birthday: { type: 'string', min: 1, max: 50, required:false},
    avatar_id: { type: 'string', min: 1, max: 20, required:false },
    roles: { type: 'string', min: 1, max: 30, required:true }
  };
  var errors = validator.validate(req.body, rules);
  if (errors && errors.length) {
    res.status(400).json({ error: errors[0]['message'] });
    return;
  }

  // 验证手机号
  if( req.body.mobile ){
    sql = `SELECT * FROM tb_user WHERE mobile=:mobile AND id != :id`;
    [rows] = await dbUtil.execute(sql, { mobile:req.body.mobile, id:userId });
    if(rows.length){
      res.status(400).json({ error:'该手机号已存在' });
      return;
    }
  }

  // 验证邮箱
  if( req.body.email ){
    sql = `SELECT * FROM tb_user WHERE email=:email AND id != :id`;
    [rows] = await dbUtil.execute(sql, { email:req.body.email, id:userId });
    if(rows.length){
      res.status(400).json({ error:'该邮箱已存在' });
      return;
    }
  }

  // 更新用户信息
  let data = {};
  if( req.body.nickname ){ data.nickname = req.body.nickname; }
  if( req.body.signature ){ data.signature = req.body.signature; }
  if( req.body.gender ){ data.gender = req.body.gender; }
  if( req.body.birthday ){ data.birthday = req.body.birthday; }
  if( req.body.mobile ){ data.mobile = req.body.mobile; }
  if( req.body.email ){ data.email = req.body.email; }
  if( req.body.gender ){ data.gender = req.body.gender; }
  if( req.body.birthday ){ data.birthday = req.body.birthday; }

  if(req.body.avatar_id){
    if( await dbUtil.findOne('tb_asset', req.body.avatar_id) ){
      data.avatar_id = req.body.avatar_id;
    }
  }

  let result = await dbUtil.update('tb_user', data, {where:{id:userId}});
  user = await dbUtil.findOne('tb_user', userId);
  delete(user.password);

  // 更新角色
  if(req.body.roles && req.body.roles.split){
    await dbUtil.destroy('tb_user_to_role', {where:{user_id:userId}});
    let roleIds = req.body.roles.split(',');
    for (var i = 0; i < roleIds.length; i++) {
      if(await dbUtil.findOne('tb_role', roleIds[i])){
        await dbUtil.save('tb_user_to_role', {user_id:userId,role_id:roleIds[i]});
      }
    }
  }

  sql = `SELECT r.* FROM tb_user_to_role AS utr
              LEFT JOIN tb_role AS r ON r.id=utr.role_id
              WHERE utr.user_id=?`;
  [rows] = await dbUtil.execute(sql, [userId]);
  user.roles = rows;

  res.json(user);
}


async function destroy(req, res){
  // 权限检查
  const userId = req.params.id;
  const currentUserId = req.userId;

  if( !await rbacUtil.can(currentUserId, '*') ){
    res.status(400).json({"error":"没有禁用权限"});
    return;
  }

  if( await rbacUtil.can(userId, '*') ){
    res.status(400).json({"error":"无法禁用超级管理员"});
    return;
  }

  let result = await dbUtil.update('tb_user', {status:0}, {where:{id:userId}});
  res.json({message:"禁用成功"});
}


async function show(req, res){
  let userId = req.params.id;
  const user = await dbUtil.findOne('tb_user', userId);

  if(!user){
    res.status(404).json({error:"找不到该用户"});
    return;
  }
  delete(user.password);

  let sql = `SELECT r.* FROM tb_user_to_role AS utr
              LEFT JOIN tb_role AS r ON r.id=utr.role_id
              WHERE utr.user_id=?`;
  let [rows] = await dbUtil.execute(sql, [userId]);
  user.roles = rows;

  res.json(user);
}


module.exports = {
  index,
  store,
  update,
  destroy,
  show
};