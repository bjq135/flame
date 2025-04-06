分类接口
======

## 列出所有分类
**Method** : `GET`

**URL** : `/v1/categories`

**Auth required** : `false`

### Success Response

**Code** : `200 Ok`

**Content example** :

```json
[
  {
    "id": 65,
    "parent_id": 64,
    ...
  },
  {
    "id": 65,
    "parent_id": 64,
    ...
  },
  ...
]
```

## 查看一个分类

**Method** : `GET`

**URL** : `/v1/categories/21`

**Auth required** : `fasle`

### Success Response

**Code** : `200 Ok`

**Content example** :

```json
{
  "id": 21,
  "parent_id": 44,
  "user_id": null,
  "title": "Node.js",
  "description": "",
  "thumbnail": "http://127.0.0.1:8001/uploads/images/20220901/N0e7Sj5SK2Qp0gj2XR5b.jpg",
  "thumbnail_id": 16,
  "list_order": 48,
  "created_at": null,
  "is_show": 1
}
```

## 新建分类

**Method** : `POST`

**URL** : `/v1/categories/21`

**Auth required** : `true`

**Body** ：
```json
{
  "title":"分类标题",
  "description":"分类描述",
  "parent_id":0,
  "thumbnail_id":2,
  "list_order":999,
  "is_show":1,
  "meta":{
    "template":"article",
    "cate...":"..."
  }
}
```

可以添加多个meta属性，设置属性的值为null可以删除属性

### Success Response

**Code** : `201 Created`

**Content example** :

```json
{
  "id": 66,
  "parent_id": 0,
  "user_id": 105,
  "title": "分类标题",
  "description": "分类描述",
  "thumbnail_id": 111,
  "list_order": 59,
  "created_at": "2024-04-12T03:33:11.000Z",
  "is_show": 100,
  "meta":{
    "template":"article",
    "cate...":"..."
  }
}
```


## 更新分类

**Method** : `PUT`

**URL** : `/v1/categories/:id`

**Auth required** : `true`

**Body** ：
```json
{
  "title":"三级子分类",
  "description":"分类描述",
  "parent_id":65,
  "thumbnail_id":2,
  "list_order":999,
  "is_show":1,
  "meta":{
    "template":"article",
    "cate...":null
  }
}
```

可以添加多个meta属性，设置属性的值为null可以删除属性

### Success Response

**Code** : `201 Created`

**Content example** :

```json
{
  "message": "修改成功"
}
```

## 删除分类

**Method** : `DELETE`

**URL** : `/v1/categories/:id`

**Auth required** : `true`

### Success Response

**Code** : `204 No Content`

**Content example** :

```json
{
  "message": "删除成功"
}
```
