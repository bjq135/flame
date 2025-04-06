const i18n = require('i18n');
const Validator = require('hot-validator');

const dbUtil = require("../../utils/db.js");
const commonUtil = require("../../utils/common.js");


async function index(req, res) {
  let rows = await dbUtil.findAll('tb_role', {where:{}});
  res.json(rows);
}


async function store(req, res) {
  const validator = new Validator();
  const rules = {
    role_name:{type:'string', min:1, max:100},
    description:{type:'string', max:255, required:false},
    permissions:{type:'string', required:true}
  };
  const errors = validator.validate(req.body, rules);
  if (errors && errors.length) {
    res.status(400).send({ error: errors[0].message });
    return;
  }

  let one, obj;
  obj = { where:{role_name:req.body.role_name} };
  one = await dbUtil.findOne('tb_role',obj);
  if(one){
    res.status(400).json({error: '角色已存在'});
    return;
  }

  let roleData = {
    role_name: req.body.role_name,
    description: req.body.description
  };

  try {
    const result = await dbUtil.save('tb_role', roleData);
    const role = await dbUtil.findOne('tb_role', result.insertId);
    const roleId = result.insertId;

    let permissionIds = req.body.permissions.split(',');
    permissionIds.forEach( async function(id, index) {
      let permission = await dbUtil.findOne('tb_permission', id);
      if(permission){
        let data = {role_id:roleId, permission_id:id};
        await dbUtil.save('tb_role_to_permission', data);
      }
    });

    res.status(201).json(role);
  } catch(error) {
    res.status(500).json({error: error.message});
  }
}


async function update(req, res) {
  let roleId = req.params.id;

  const validator = new Validator();
  const rules = {
    role_name:{type:'string', min:1, max:100},
    description:{type:'string', max:255, required:false},
    permissions:{type:'string', required:true}
  };
  const errors = validator.validate(req.body, rules);
  if (errors && errors.length) {
    res.status(400).send({ error: errors[0].message });
    return;
  }

  let one, obj;
  obj = { where:{id:req.params.id} };
  one = await dbUtil.findOne('tb_role',obj);
  if(!one){
    res.status(400).json({error: '角色不存在'});
    return;
  }

  try {
    await dbUtil.destroy('tb_role_to_permission', {
      where:{ role_id: roleId}
    });

    let permissionIds = req.body.permissions.split(',');
    permissionIds.forEach( async function(id, index) {
      let permission = await dbUtil.findOne('tb_permission', id);
      if(permission){
        let data = {role_id:roleId, permission_id:id};
        await dbUtil.save('tb_role_to_permission', data);
      }
    });

    let roleData = {
      role_name: req.body.role_name,
      description: req.body.description
    };
    obj = {where:{id:roleId}};
    const result = await dbUtil.update('tb_role', roleData, obj);
    const role = await dbUtil.findOne('tb_role', roleId);

    res.status(201).json(role);
  } catch(error) {
    res.status(500).json({error: error.message});
  }
}


async function destroy(req, res) {
  var roleId = req.params.id;

  let conn = await dbUtil.getPoolConnection();
  try {
    await conn.query(`START TRANSACTION`);

    await dbUtil.destroy('tb_role', {where:{id:roleId}}, conn);
    await dbUtil.destroy('tb_role_to_permission', {where:{id:roleId}}, conn);

    await conn.query(`COMMIT`);
    res.status(204).json({ message: i18n.__('delete success') });
    return;
  } catch (error) {
    console.error(error);
    await conn.query(`ROLLBACK`);
    res.status(500).json({ error: error.message });
    return;
  } finally {
    conn.release();
  }
}


async function show(req, res) {
  let sql;

  var roleId = req.params.id;
  const role = await dbUtil.findOne('tb_role', roleId);
  if(!role){
    res.status(400).json({error: '角色不存在'});
    return;
  }

  sql = `SELECT p.* FROM tb_role_to_permission AS rp
          LEFT JOIN tb_permission AS p ON p.id=rp.permission_id
          WHERE role_id=:role_id`;
  let [rows] = await dbUtil.execute(sql, {role_id:roleId});
  role.permissions = rows;

  res.json(role);
}

const rbac = require('../../utils/rbac.js');

async function test(req, res) {
  let roles = await rbac.getRoles(10);
  let permissions = await rbac.getPermissionIds(1);
  console.log(await rbac.roleCan(1,100) )
  console.log(await rbac.can(1,'admin.user.store') )
  console.log(await rbac.can(1,'article.private.delete') )

  res.json();
}


module.exports = {
  index,
  store,
  update,
  destroy,
  show,
  test
}
