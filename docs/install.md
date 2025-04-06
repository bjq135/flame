安装
====

### 环境配置

前置条件：安装 Node.js 和 MySQL

- Node.js v20.12.2 以上
- MySQL v5.5.53 以上


### 下载项目

```
git clone https://gitee.com/soushenji/flame.git
```


### 导入数据库文件

```
db.sql
```


### 修改配置文件

把 .env.backup 的名字修改成 .env，修改数据库配置

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=test
DB_USERNAME=root
DB_PASSWORD=root
```


### 安装和运行

```
npm install
npm run dev
```

### 后台管理面板

```
http://127.0.0.1:3000/login
```

默认账户和密码:

```
admin@admin.com 
admin888
```