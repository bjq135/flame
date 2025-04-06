数据库
====

## 简介

项目使用 mysql2 来处理 MySQL 数据库交互。系统提供两个模块来和数据库交互。

## 简单的例子

这是一个简单的例子。

```javascript

const dbUtil = require('./utils/db.js');

const connection = dbUtil.getConnection();

// 一个简单查询
try {
  const [results, fields] = await connection.query(
    'SELECT * FROM `table` WHERE `name` = "Page" AND `age` > 45'
  );

  console.log(results); // results contains rows returned by server
  console.log(fields); // fields contains extra meta data about results, if available
} catch (err) {
  console.log(err);
}

// 使用占位符
try {
  const [results] = await connection.query(
    'SELECT * FROM `table` WHERE `name` = ? AND `age` > ?',
    ['Page', 45]
  );

  console.log(results);
} catch (err) {
  console.log(err);
}
```


## 使用预处理语句

以上都是使用 connection.query(），使用 connection.execute(）可以完成 SQL 语句的预处理，以防止 SQL 注入的安全问题。

```javascript
const dbUtil = require('./utils/db.js');

try {
  // create the connection to database
  const connection = dbUtil.getConnection();

  // execute will internally call prepare and query
  const [results, fields] = await connection.execute(
    'SELECT * FROM `table` WHERE `name` = ? AND `age` > ?',
    ['Rick C-137', 53]
  );

  console.log(results); // results contains rows returned by server
  console.log(fields); // fields contains extra meta data about results, if available
} catch (err) {
  console.log(err);
}
```


## 关闭数据库连接

```js
connection.end()
```


## 使用数据库连接池

使用数据库连接池，可以与 connection 相同的方式使用池（使用pool.query() 和 pool.execute() ）：

```javascript
const dbUtil = require('./utils/db.js');

try {
  const [rows, fields] = await dbUtil.query('SELECT `field` FROM `table`');
  // 查询解析厚，连接会自动释放到连接池
} catch (err) {
  console.log(err);
}
```


## 手动操作数据库连接池

当然，也可以从池中手动获取连接并稍后返回：

```javascript
const dbUtil = require('./utils/db.js');

const connection = await dbUtil.getConnection();

await connection.query(/* ... */);

await connection.release();
```
注意：手动获取数据库连接，就必须手动释放。否则程序会崩溃。推荐把 `connection.release()` 放在 try catch 的 finally 中执行。

```javascript
const dbUtil = require('./utils/db.js');

try {
  const connection = await dbUtil.getConnection();
  await connection.query(/* ... */);
} catch(e) {
  console.log(e);
} finally {
  connection.release()
}
```

## 命名占位符
通过设置 namedPlaceholders 配置值可以为参数使用命名占位符。
```javascript
connection.config.namedPlaceholders = true;

connection.execute('select :x + :y as z', { x: 1, y: 2 }, (err, rows) => {
  // statement prepared as "select ? + ? as z" and executed with [1,2] values
  // rows returned: [ { z: 3 } ]
});

connection.execute('select :x + :x as z', { x: 1 }, (err, rows) => {
  // select ? + ? as z, execute with [1, 1]
});

connection.query('select :x + :x as z', { x: 1 }, (err, rows) => {
  // query select 1 + 1 as z
});

// unnamed placeholders are still valid if the values are provided in an array
connection.query('select ? + ? as z', [1, 1], (err, rows) => {
  // query select 1 + 1 as z
});
```
 

## 错误处理
确保对查询操作进行适当的错误处理，无论是使用回调还是 async/await。

## 释放连接
使用连接池时，你不需要手动释放每个连接，因为查询结束后，连接会自动返回到池中。但是，如果在查询之外还需要进行其他操作（如事务），确保在操作完成后调用 connection.release() 来释放连接。

## 性能调优
根据实际需求调整连接池的参数，比如 connectionLimit，以达到最佳性能。监控应用和数据库性能，适时调整连接池设置，以应对不同的负载情况。

通过上述步骤，你可以有效地在 Node.js 应用中利用 mysql2 的连接池功能来管理数据库连接，提升应用性能和稳定性。


## 助手函数

系统提供了六个助手函数

- findOne()
- findAll()
- findCounter()
- save()
- update()
- destroy()


## findOne()

获取一条记录

```javascript
let one, obj;

// 获取id是19的记录
one = await dbUtil.findOne('tb_page', 19);
console.log('one',one)

// 获取一条记录
obj = {
  where:{is_show:0,user_id:1},
};
one = await dbUtil.findOne('tb_page',obj);
console.log('one',one)

// 按条件获取一条记录
obj = {
  where:{is_show:0},
  order:{id:'asc'},
  limit:2,
  offset:1
};
one = await dbUtil.findOne('tb_page',obj);
console.log('one',one)
```


## findAll()

获取一组记录

```javascript
let rows, obj;

// 按条件获取多行条记录
obj = {
  where:{is_show:0},
  order:{id:'asc'},
  limit:2,
  offset:1
};
rows = await dbUtil.findAll('tb_page',obj);
console.log('one',one)
```


## findCounter()

获取记录数量

```javascript
let rows, obj;

// 按条件获取多记录总数
obj = {
  where:{is_show:0}
};
rows = await dbUtil.findAll('tb_page',obj);
console.log('one',one)
```


## save()

保存一条记录

```javascript
let data = {
  title:'这是标题',
  user_id:1,
  content:'这是内容'
};
let result = await dbUtil.save('tb_page',data);
console.log('res',result)

/* 返回结果
ResultSetHeader {
  fieldCount: 0,
  affectedRows: 1,
  insertId: 27,
  info: '',
  serverStatus: 2,
  warningStatus: 0,
  changedRows: 0
}
*/
```


## update()

更新记录。会忽略 data.id

```javascript
let data = {
  id:200,
  title:'这是标题', 
  user_id:1, 
  content:'这是内容'
};

let obj = {
  where:{
    id:28,
    is_show:1
  }
};

let result = await dbUtil.update('tb_page', data, obj);
console.log('res',result)
```

## destroy()

删除记录。

```javascript
let obj = {
  where:{
    user_id:2
  }
};
let result = await dbUtil.destroy('tb_page', obj);
```



## 参考
- mysql2：https://javascript.net.cn/articles/1124
- 项目地址：https://www.npmjs.com/package/mysql2
- 官方文档：https://sidorares.github.io/node-mysql2/docs

