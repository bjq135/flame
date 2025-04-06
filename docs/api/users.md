用户接口
======

## 用户列表

**Method** : `GET`

**URL** : `/v1/users`

**Auth required** : `true`

### Success Response

**Code** : `200 Ok`

**Content example** :
```json
[
  {
    "id":1,
    "nickname":"米莎",
    "email":"test@test.cn",
    "mobile":"13312341234",
    "gender":1,
    "birthday":"2025-03-28 15:33"
  },
  {
    "id":2,
    "nickname":"米莎",
    "email":"test@test.cn",
    "mobile":"13312341234",
    "gender":1,
    "birthday":"2025-03-28 15:33"
  }
]

```

在请求的返回内容 header 中，X-Total 表示一共有多少条数，X-TotalPages 表示页数。


## 用户信息

**Method** : `GET`

**URL** : `/v1/users/:id`

**Auth required** : `true`

### Success Response

**Code** : `200 OK`

**Content example** :

```json
{
  "id":1066,
  "nickname":"米莎",
  "signature":"这是用户的签名",
  "gender":1,
  "birthday":"2025-03-28 15:33",
  "avatar_id":1067,
  "avatar":"http://www.test.com/uploads/images/20250328/564516216.jpg",
  "roles":[
    { "id":128, "role_name":"超级VIP"},
    { "id":12, "role_name":"普通用户"}
  ]
}
```


## 修改用户

**Method** : `PUT`

**URL** : `/v1/users/:ID`

**Auth required** : `true`

**Body** :

```json
{
  "nickname":"米莎",
  "signature":"这是用户的签名",
  "gender":1,
  "birthday":"2025-03-28 15:33",
  "avatar_id":1067,
  "roles":"12, 128"
}
```

### Success Response

**Code** : `200 Ok`

**Content example** :

```json
{
  "nickname":"米莎",
  "signature":"这是用户的签名",
  "gender":1,
  "birthday":"2025-03-28 15:33",
  "avatar_id":1067,
  "avatar":"http://www.test.com/uploads/images/20250328/564516216.jpg",
  "roles":[
    { "id":128, "role_name":"超级VIP"},
    { "id":12, "role_name":"普通用户"}
  ]
}
```


## 删除用户

**Method** : `DELETE`

**URL** : `/v1/users/:ID`

**Auth required** : `true`

### Success Response

**Code** : `204`

### Error Response

**Code** : `400`

```json
{
  "error" : "超级管理员不可删除"
}
```


## 新建用户

**Method** : `POST`

**URL** : `/v1/users`

**Auth required** : `true`

**Body** :

```json
{
  "nickname":"米莎",
  "signature":"这是用户的签名",
  "email":"test@test.com",
  "mobile":"13312341234",
  "gender":1,
  "birthday":"2025-03-28 15:33",
  "avatar_id":1067,
  "roles":"12, 128"
}
```

### Success Response

**Code** : `200 Ok`

**Content example** :

```json
{
  "id":1066,
  "nickname":"米莎",
  "signature":"这是用户的签名",
  "gender":1,
  "birthday":"2025-03-28 15:33",
  "avatar_id":1067,
  "avatar":"http://www.test.com/uploads/images/20250328/564516216.jpg",
  "roles":[
    { "id":128, "role_name":"超级VIP"},
    { "id":12, "role_name":"普通用户"}
  ]
}
```


## 重置密码（待开发）

**Method** : `POST`

**URL** : `/v1/users`

**Auth required** : `true`

**Body** :

```json
{
  "password":"this-is-password-string",
}
```

### Success Response

**Code** : `200 Ok`


