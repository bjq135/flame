图片接口
======

## 图片列表
**Method** : `GET`

**URL** : `/v1/images`

**Auth required** : `true`

### Success Response

**Code** : `200 Ok`

**Content example** :

```json
[
  {
    "id": 256,
    "user_id": 3,
    "parent_id": 0,
    "file_name": "ImdVZ1rNI2vH09f71zcY.jpg",
    "file_path": "20240411/ImdVZ1rNI2vH09f71zcY.jpg",
    "file_size": 27081,
    "suffix": "jpg",
    "download_counter": 0,
    "created_at": "2024-04-11T08:05:46.000Z",
    "more": "",
    "status": 1,
    "url": "http://127.0.0.1/uploads/images/20240411/ImvH09f71zcY.jpg"
  },
  {
    "id": 255,
    "user_id": 3,
    "parent_id": 0,
    "file_name": "p8bBA8EnSUWuXGM8TWci.jpg",
    "file_path": "20240411/p8bBA8EnSUWuXGM8TWci.jpg",
    "file_size": 27081,
    "suffix": "jpg",
    "download_counter": 0,
    "created_at": "2024-04-11T08:05:45.000Z",
    "more": "",
    "status": 1,
    "url": "http://127.0.0.1/uploads/images/20240411/p8buXGM8TWci.jpg"
  }
]
```



## 获取一个图片

**Method** : `GET`

**URL** : `/v1/images/:id`

**Auth required** : `true`

### Success Response

**Code** : `200`

**Content example** :

```json
{
  "id": 256,
  "user_id": 3,
  "parent_id": 0,
  "file_name": "ImdVZ1rNI2vH09f71zcY.jpg",
  "file_path": "20240411/ImdVZ1rNI2vH09f71zcY.jpg",
  "file_size": 27081,
  "suffix": "jpg",
  "download_counter": 0,
  "created_at": "2024-04-11T08:05:46.000Z",
  "more": "",
  "status": 1,
  "url": "http://127.0.0.1/uploads/images/20240411/ImvH09f71zcY.jpg"
}
```



## 删除一个图片

**Method** : `DELETE`

**URL** : `/v1/images/:id`

**Auth required** : `true`

### Success Response

**Code** : `204 No Content`
