站点接口
=======


## 更新设置接口

**Method** : `POST`

**URL** : `/v1/common/option`

**Auth required** : `true`

**Body** :

```json
{
    "option_name":"site_option",
    "option_value":"{\"name\":\"设置字段名\"}"
}
```
option_name: 设置字段名  
option_value: 设置 json 的字符串


### Success Response
**Code** : `200 Ok`


## Unload Beacon API 接口
这个接口用于统计页面性能

**Method** : `POST`

**URL** : `/v1/home/unload-beacon`

**Auth required** : `false`

**Body** :

```json
{
    "start":"",
    "end":"",
    "url":""
}
```

### Success Response
**Code** : `201 Created`


## 获取系统信息
暂未完成