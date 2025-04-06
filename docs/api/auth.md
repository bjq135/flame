权限接口
=======


## 用户登录

**Method** : `POST`

**URL** : `/v1/auth/login`

**Auth required** : `False`

**Body** :

```json
{
  "account":"13312341234",
  "password":"123456"
}
```

### Success Response

**Code** : `200 OK`

**Content example** :

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2NTQ0OTMxMjAsImlhdCI6MTY1NDQ4MjI5MCwiZGF0YSI6eyJpZCI6NTR9fQ.Yw_z9DLsmMTRVXZwrpkMkfEe_cOMDL_x4PYCz18r97w",
  "isNewUser": false,
  "user": {
    "id": 54,
    "nickname": "133****1234",
    "email": "",
    "mobile": "13312341234",
    "gender": 0,
    "avatar": ""
  }
}
```





## 用户注册

**Method** : `POST`

**URL** : `/v1/auth/register`

**Auth required** : `False`

**Body** :

```json
{
  "account":"13312341234",
  "password":"123456",
  "nickname":"",
  "code":"4729"
}
```
account: 手机号或邮箱  
flag: 验证码用处，register（注册） login （登录）  reset-password (重置密码)

### Success Response

**Code** : `200 OK`

**Content example** :

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2NTQ0OTMxMjAsImlhdCI6MTY1NDQ4MjI5MCwiZGF0YSI6eyJpZCI6NTR9fQ.Yw_z9DLsmMTRVXZwrpkMkfEe_cOMDL_x4PYCz18r97w",
  "isNewUser": false,
  "user": {
    "id": 54,
    "nickname": "133****1234",
    "email": "",
    "mobile": "13312341234",
    "gender": 0,
    "avatar": ""
  }
}
```

### Error Responses

**Code** : `400 Bad Request`

**Content** : 显示错误详情和建议
```json
{
  "error": "验证码不存在或已过期"
}
```





## 重置密码

**Method** : `POST`

**URL** : `/v1/auth/reset-password`

**Auth required** : `False`

**Body** :


```json
{
  "account":"13312341234",
  "password":"123456",
  "code":"4729"
}
```

### Success Response

**Code** : `200 OK`

**Content example** :

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2NTQ0OTMxMjAsImlhdCI6MTY1NDQ4MjI5MCwiZGF0YSI6eyJpZCI6NTR9fQ.Yw_z9DLsmMTRVXZwrpkMkfEe_cOMDL_x4PYCz18r97w",
  "isNewUser": false,
  "user": {
    "id": 54,
    "nickname": "133****1234",
    "email": "",
    "mobile": "13312341234",
    "gender": 0,
    "avatar": ""
  }
}
```

### Error Responses

**Code** : `400 Bad Request`

**Content** : 显示错误详情和建议
```json
{
  "error": "验证码不存在或已过期"
}
```








## 验证码发送

**Method** : `POST`

**URL** : `/v1/auth/send-code`

**Auth required** : `False`

**Body** :

```json
{
  "account":"13683761008",
  "flag":"register"
}
```
account: 手机号或邮箱  
flag: 验证码用处，register（注册） login （登录）  reset-password (重置密码)

### Success Response

**Code** : `200 OK`

**Content example** :

```json
{
  "message": "开发模式，验证码发送成功",
  "code": 225154
}
```

### Error Responses

**Code** : `400 Bad Request`

**Content** : 显示错误详情和建议


## 检查验证码

**Method** : `POST`

**URL** : `/v1/auth/check-code`

**Auth required** : `False`

**Body** :

```json
{
  "account":"13683761008",
  "code":"7389"
}
```

### Success Response

**Code** : `200 OK`

**Content example** :

```json
{
  "code": "8167",
  "expired_at": "2022-06-07T06:34:59.000Z"
}
```

