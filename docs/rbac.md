RBAC
====

## 简介

RBAC，全称为Role-Based Access Control，即基于角色的访问控制，是一种广泛应用的安全管理模式。它通过将权限与角色关联起来，再将角色分配给用户，从而控制用户对系统资源的访问权限。这种模型有助于简化权限管理，特别是在大型组织中。

## 核心概念
- 用户(User)：可以访问系统或资源的人或实体。
- 角色(Role)：一组代表特定职位或责任的权限集合。角色是连接用户和权限之间的桥梁。
- 权限(Permission)：执行某个操作的能力，如读取、写入或删除数据。
- 会话(Session)：用户在扮演某个角色时所建立的临时连接。

## 常用函数

## 引入 RBAC 工具

```js
const rbacUtil = require('./utils/rbac.js');
```

## 获取用户的角色

```js
let roleIDs = await rbac.getRoles(userId);
// roleIds = [1,12,15]
```

## 获取用户多个角色的权限并集

```js
let permissionIDs = await rbac.getPermissionIds(userId);
// permissionIDs = [100,101,102]
```

## 判断一个角色是否有某个权限

```js
let can = await rbac.roleCan(userId, permissionId);
// can boolean
```

## 判断一个用户是否有某个权限

```js
let can = await rbac.can(userId, 'user.edit');
// can boolean
// 第二个参数是权限标记，如果一个用户拥有"*"权限，就代表该用户拥有系统的最高权限。
```


## 相关数据表

```sql
# RBAC 角色表
CREATE TABLE `tb_role` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) NOT NULL DEFAULT '',
  `description` varchar(200) DEFAULT '',
  PRIMARY KEY (`id`)
);

# 用户和角色关系表
CREATE TABLE `tb_user_to_role` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) DEFAULT NULL,
  `role_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
);

# RBAC 权限表
CREATE TABLE `tb_permission` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `parent_id` int(11) NOT NULL DEFAULT '0',
  `title` varchar(30) NOT NULL DEFAULT '',
  `flag` varchar(30) NOT NULL DEFAULT '',
  `list_order` int(11) NOT NULL DEFAULT '99',
  PRIMARY KEY (`id`),
  UNIQUE KEY `flag` (`flag`),
  KEY `title` (`title`)
);

# RBAC 权限和角色表关系表
CREATE TABLE `tb_role_to_permission` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `role_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  PRIMARY KEY (`id`)
);
```








