Flame(beta版本)
=======

## 简介

Flame 是一个基于 Node.js、Express、MySQL 开发的 CMS。

## 特性

- 保持低规模的灵活应用程序框架
- 基于 Node.js 开发，性能优异
- 渐进式开发
- 内置用户管理、权限管理、日志系统等，快速构建自己的应用（开发中）
- API 优先

## 项目结构

```
├── api                       # API 目录
|    ├── controllers          # 控制器
|    ├── services             # 服务
|    └── router.js            # 路由文件
├── home                      # 一个演示模块，可以删除
|    ├── controllers          # 控制器
|    ├── services             # 服务
|    └── router.js            # 路由文件
├── docs                      # 文档目录
├── logs                      # 日志目录
├── middlewares               # 中间件
├── node_modules
├── public
|    ├── assets               # 模块静态资源目录
|    ├── docs                 # 生成的文档
|    └── uploads              # 文件上传目录
├── tests
├── utils
├── views                     # 模板目录
├── .env                      # 环境变量
├── config.js
├── db.sql
├── main.js
├── package.json
└── README.md                  # 项目介绍
```

## 接口文档

- [接口文档](docs/index.md)
