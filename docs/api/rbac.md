RBAC 角色权限接口
======

## 角色列表
**Method** : `GET`

**URL** : `/v1/roles`

**Auth required** : `true`

### Success Response

**Code** : `200`

**Content example** :
```json
[
  {
    "id":1,
    "role_name":"超级管理员",
    "description":"这是角色描述"
  },
  {
    "id":2,
    "role_name":"管理员",
    "description":"这是角色描述"
  },
  {
    "id":5,
    "role_name":"超级VIP",
    "description":"这是角色描述"
  }
]
```



## 查看角色
**Method** : `GET`

**URL** : `/v1/roles/:id`

**Auth required** : `true`

### Success Response

**Code** : `200`

**Content example** :
```json
{
  "id":128,
  "role_name":"超级VIP",
  "description":"这里是角色的描述",
  "permissions":[
    { "id":1, "title":"查看用户", "flag":"admin.user.show"},
    { "id":2, "title":"添加用户", "flag":"admin.user.store"},
    { "id":9, "title":"修改用户", "flag":"admin.user.update"}
  ]
}
```


## 新建角色
**Method** : `POST`

**URL** : `/v1/roles`

**Auth required** : `true`

**Body** :
```json
{
  "role_name":"超级VIP",
  "description":"这里是角色的描述",
  "permissions":"1,2,9"
}
```

### Success Response

**Code** : `201 Created`

**Content example** :
```json
{
  "id":128,
  "role_name":"超级VIP",
  "description":"这里是角色的描述",
  "permissions":[
    { "id":1, "title":"查看用户", "flag":"admin.user.show"},
    { "id":2, "title":"添加用户", "flag":"admin.user.store"},
    { "id":9, "title":"修改用户", "flag":"admin.user.update"}
  ]
}
```


## 编辑角色
**Method** : `PUT`

**URL** : `/v1/roles/:id`

**Auth required** : `true`

**Body** :
```json
{
  "role_name":"超级VIP",
  "description":"这里是角色的描述",
  "permissions":"1,99,128"
}
```

### Success Response

**Code** : `200 Ok`

**Content example** :
```json
{
  "id":128,
  "role_name":"超级VIP",
  "description":"这里是角色的描述",
  "permissions":[
    { "id":1, "title":"查看用户", "flag":"admin.user.show"},
    { "id":2, "title":"添加用户", "flag":"admin.user.store"},
    { "id":9, "title":"修改用户", "flag":"admin.user.update"}
  ]
}
```


## 删除角色
**Method** : `DELETE`

**URL** : `/v1/roles/:id`

**Auth required** : `true`

### Success Response

**Code** : `204`



## 权限列表

**Method** : `GET`

**URL** : `/v1/permissions`

**Auth required** : `true`

### Success Response

**Code** : `200 Ok`

**Content example** :
```json
[
  { "id":1, "title":"查看用户", "flag":"admin.user.show"},
  { "id":2, "title":"添加用户", "flag":"admin.user.store"},
  { "id":9, "title":"修改用户", "flag":"admin.user.update"}
]

```

