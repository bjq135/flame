/**
 * RBAC
 */
const dbUtil = require('./db.js');


/**
 * 获取一个用户所属角色
 * @param {Object} userId 用户ID
 * @return {array} 角色ID组成的数组
 */
async function getRoles(userId){
  let sql = `SELECT r.* FROM tb_user_to_role AS utr
              LEFT JOIN tb_role AS r ON r.id=utr.role_id
              WHERE utr.user_id=?`;
  let [rows] = await dbUtil.execute(sql, [userId]);
  let roleIds = rows.map(item => item.id);
  return roleIds;
}


/**
 * 获取一个用户所有角色权限的并集
 * @param {Object} userId 用户ID
 * @return {array} 权限ID组成的数组
 */
async function getPermissionIds(userId){
  let roleIds = await getRoles(userId);
  let permissions = [];

  for (let i = 0; i < roleIds.length; i++) {
    let rows = await dbUtil.findAll('tb_role_to_permission', {where:{role_id:roleIds[i]}});
    rows = rows.map(p => p.permission_id);
    permissions = permissions.concat(rows);
  }
  permissions = Array.from(new Set(permissions));
  return permissions;
}


/**
 * 判断一个角色是否有某个权限
 * @param {Object} roleName 角色名
 * @param {Object} permission 标记
 */
async function roleCan(roleId, permissionId){
  let obj = {
    where:{
      role_id: roleId,
      permission_id: permissionId,
    } 
  };
  let rolePermission = await dbUtil.findOne('tb_role_to_permission', obj);
  return rolePermission ? true : false;
}


/**
 * 判断一个用户是否有某个权限
 * @param {Object} userId 用户ID
 * @param {Object} permission 标记
 */
async function can(userId, permission){
  // 超级管理员跳过权鉴
  let userRoles = await getRoles(userId);
  if(userRoles.indexOf(1) !== -1){
    return true;
  }

  let permissionItem = await dbUtil.findOne('tb_permission', {where:{flag:permission}});
  if(!permissionItem) return false;

  // 权鉴
  let userPermissionIds = await getPermissionIds(userId);
  return userPermissionIds.indexOf(permissionItem.id) === -1 ? false : true;
}


module.exports = {
  getRoles,
  getPermissionIds,
  roleCan,
  can
}
