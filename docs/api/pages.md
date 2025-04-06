页面接口
======


## 添加页面

**Method** : `POST`

**URL** : `/v1/pages`

**Auth required** : `true`

**Body** :

```json
{
  "title":"页面标题",
  "description":"页面描述",
  "thumbnail_id":"23",
  "content":"页面内容",
  "is_show":"1",
  "route_url":""
}
```
### Success Response

**Code** : `201 Created`

**Content example** :

```json
{
"message": "添加成功"
}
```


## 编辑页面

**Method** : `PUT`

**URL** : `/v1/pages/:ID`

**Auth required** : `true`

**Body** :

```json
{
  "title":"页面标题",
  "description":"页面描述",
  "thumbnail_id":"23",
  "content":"页面内容",
  "is_show":"1"
}
```
### Success Response

**Code** : `200 Ok`

**Content example** :

```json
{
"message": "修改成功"
}
```


## 删除页面

**Method** : `DELETE`

**URL** : `/v1/pages/:ID`

**Auth required** : `true`

### Success Response

**Code** : `204 No Content`

