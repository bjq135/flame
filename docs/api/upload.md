上传接口
=======

## 上传文件

**Method** : `POST`

**URL** : `/v1/upload?thumbnail=true`

**Auth required** : `true`

### Success Response

**Code** : `201 Created`

**Content example** :

```json
{
  "file_name": "R1rLQN5aNYtH63z4oIfv.jpg",
  "file_path": "20240411/R1rLQN5aNYtH63z4oIfv.jpg",
  "created_at": "2024-04-11 16:18:01",
  "suffix": "jpg",
  "user_id": 3,
  "parent_id": "0",
  "file_size": 27081,
  "more": "",
  "id": 259,
  "url": "http://127.0.0.1:3000/uploads/images/20240411/R1rLQN5aNYtH63z4oIfv.jpg"
}
```


<br><br><br>


## 获取文件信息

**Method** : `GET`

**URL** : `/v1/images/:ID`

**Auth required** : `true`

**Body** :

```json
{
"title":"文章标题",
"description":"文章描述",
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

### Error Responses

**Code** : `400 Bad Request`

**Content** : MySQL error is shown, with suggestions to fix the query.



## 删除一个图片

**Method** : `DELETE`

**URL** : `/v1/images/:id`

**Auth required** : `true`

### Success Response

**Code** : `204`

**Content example** :

```json
{
  "message": "删除成功"
}
```
