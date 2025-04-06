AI 生成接口
======

## 通义千问接口

本接口的后端调用的是通义千问，不需要科学上网。

通义千问是阿里巴巴达摩院自主研发的超大规模语言模型，能够在用户自然语言输入的基础上，通过自然语言理解和语义分析，在不同领域、任务内为用户提供服务和帮助。

模型具备的能力包括但不限于：
- 创作文字，如写故事、写公文、写邮件、写剧本、写诗歌等
- 编写代码
- 提供各类语言的翻译服务，如英语、日语、法语、西班牙语等
- 进行文本润色和文本摘要等工作
- 扮演角色进行对话
- 制作图表

**Method** : `POST`

**URL** : `/v1/tongyi`

**Auth required** : `False`

**Body** :

```json
{
  "prompt":"请给我讲述一下淝水之战"
}
```

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


## 通义万象任务提交接口

本接口的后端调用的是通义万相，不需要科学上网。

通义万相是基于自研的Composer组合生成框架的AI绘画创作大模型，提供了一系列的图像生成能力。支持根据用户输入的文字内容，生成符合语义描述的不同风格的图像，或者根据用户输入的图像，生成不同用途的图像结果。通过知识重组与可变维度扩散模型，加速收敛并提升最终生成图片的效果。图像结果贴合语义，构图自然、细节丰富。支持中英文双语输入。

通义万相大模型系列目前支持了文字生成图像、人像风格重绘等多个模型。

**Method** : `POST`

**URL** : `/v1/wanxiang`

**Auth required** : `False`

**Body** :

```json
{
  "prompt":"一个女孩，穿着吊带，黑色吊带，透明背景，原始照片，杰作，中文，纯色背景，单人，中镜头，高细节脸，肩膀与框架平行，直视镜头，苗条的身体"
}
```

### Success Response

**Code** : `200 OK`

**Content example** :

```json
{
  "output": {
  "task_id": "13b1848b-5493-4c0e-8c44-68d038b492af", 
    "task_status": "PENDING"
  },
  "request_id": "7574ee8f-38a3-4b1e-9280-11c33ab46e51"
}
```

### Error Responses

**Code** : `400 Bad Request`

**Content** : 显示错误详情和建议

```json
{
  "code":"InvalidApiKey",
  "message":"Invalid API-key provided.",
  "request_id":"fb53c4ec-1c12-4fc4-a580-cdb7c3261fc1"
}
```


## 任务查询和结果获取接口

**Method** : `GET`

**URL** : `/v1/wanxiang-results`

**URL Parameters** : 

`task_id=[string]` 任务ID

**Auth required** : `true`

### Success Response

**Code** : `200 OK`

**Content example** :

作业执行中
```json
{
  "request_id":"e5d70b02-ebd3-98ce-9fe8-759d7d7b107d",
  "output":{
      "task_id":"86ecf553-d340-4e21-af6e-a0c6a421c010",
      "task_status":"RUNNING",
      "task_metrics":{
          "TOTAL":4,
          "SUCCEEDED":1,
          "FAILED":0
      }
  }
}
```

作业成功执行完毕
```json
{
  "request_id":"85eaba38-0185-99d7-8d16-4d9135238846",
  "output":{
      "task_id":"86ecf553-d340-4e21-af6e-a0c6a421c010",
      "task_status":"SUCCEEDED",
      "results":[
          {
            "url":"https://dashscope-result-bj.oss-cn-beijing.aliyuncs.com/123/a1.png"
          },
          {
            "url":"https://dashscope-result-bj.oss-cn-beijing.aliyuncs.com/123/b2.png"
          }
      ],
      "task_metrics":{
          "TOTAL":2,
          "SUCCEEDED":2,
          "FAILED":0
      }
  },
  "usage":{
      "image_count":2
  }
}
```

作业成功执行完毕，部分失败
```json
{
  "request_id":"85eaba38-0185-99d7-8d16-4d9135238846",
  "output":{
      "task_id":"86ecf553-d340-4e21-af6e-a0c6a421c010",
      "task_status":"SUCCEEDED",
      "results":[
          {
            "url":"https://dashscope-result-bj.oss-cn-beijing.aliyuncs.com/123/a1.png"
          },
          {
              "code": "InternalError.Timeout",
              "message": "An internal timeout error has occured during execution, please try again later or contact service support."
          }
      ],
      "task_metrics":{
        "TOTAL":2,
        "SUCCEEDED":1,
        "FAILED":1
      }
  },
  "usage":{
      "image_count":1
  }
}
```




### Error Responses

**Code** : `400 Bad Request`

**Content** : 显示错误详情和建议

```json
{
  "request_id":"e5d70b02-ebd3-98ce-9fe8-759d7d7b107d",
  "output":{
      "task_id":"86ecf553-d340-4e21-af6e-a0c6a421c010",
      "task_status":"FAILED",
      "code":"InvalidParameter"
      "message":"The size is not match the allowed size ['1024*1024', '720*1280', '1280*720']"
      "task_metrics":{
          "TOTAL":4,
          "SUCCEEDED":0,
          "FAILED":4
      }
  }
}
```
