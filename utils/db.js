const mysql = require('mysql2');
const config = require('../config.js');

var pool;

/**
 * 获取一个数据库连接，需要手动关闭 connection.end()
 */
async function getConnection() {
  let connection = mysql.createConnection({
    host: config.database.host,
    port: config.database.port,
    database: config.database.database,
    user: config.database.username,
    password: config.database.password,
    charset: 'utf8',
    namedPlaceholders: true
  }).promise();

  return connection;
}


/**
 * 获取一个数据库连接池
 */
function getPool() {
  if (pool === undefined) {
    pool = mysql.createPool({
      host: config.database.host,
      port: config.database.port,
      database: config.database.database,
      user: config.database.username,
      password: config.database.password,
      charset: 'utf8',
      waitForConnections: true, //true 连接排队等待可用连接；false 立即抛出错误
      connectionLimit: 3, //单次可创建最大连接数
      queueLimit: 0, //连接池的最大请求数
      namedPlaceholders: true
    }).promise();
  }
  return pool;
}


/**
 * 从连接池里获取一个连接
 * 注意：需要手动 conn.release()，否则会使 pool 满载无法响应
 */
async function getPoolConnection() {
  pool = getPool();
  let conn = await pool.getConnection();
  return conn;
}


/**
 * 查询函数，如果需要 SQL 预处理。需要使用 execute 函数
 * @param {string} sql
 * @param {array} values 可选
 * @returns Promise
 */
function query(sql, values) {
  pool = getPool();
  return pool.query(sql, values);
};


/**
 * 查询函数，有 SQL 预处理。execute 将在内部调用 prepare 和 query
 * @param {string} sql 
 * @param {array} values 可选
 * @returns Promise
 */
function execute(sql, values) {
  pool = getPool();
  return pool.execute(sql, values);
};


/**
 * 获取一条数据
 * @param  {[type]} table [description]
 * @param  {[type]} obj   [description]
 * @param  {[type]} conn  [description]
 * @return {[type]}       [description]
 */
async function findOne(table, obj, conn){
  if(!table) throw new Error('table name is required');
  if(!obj) throw new Error('obj is required');

  var connection = null;
  
  let id = Number(obj);
  if( Number.isNaN(id) === false ){
    let id = obj;
    try{
      let sql = 'SELECT * FROM ' + table + ' WHERE id=?';
      const connection = conn ? conn : await getPoolConnection();
      let [rows] = await connection.execute(sql, [id]);
      if(!conn) connection.release();
      return rows.length ? rows[0] : null;
    }catch(e){
      throw e;
    }
    return;
  }
  
  let sql = "select * from " + table;
  let replacements = [];
  
  if(obj.where && Object.keys(obj.where).length){
    let keys = Object.keys(obj.where)
    replacements = keys.map(k => obj.where[k]);
    
    let wheres = ""
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      var isLast = i == keys.length - 1
      if (!isLast){
        wheres += key + " = ? AND "
      } else {
        wheres += key + " = ?"
      }
    }
    sql = sql + " where " + wheres;
  }
  
  if(obj.order){
    let arr = [];
    for (const key in obj.order) {
      arr.push(key + ' ' + obj.order[key]);
    }
    sql += ' ORDER BY ' + arr.toString();
  }
  
  sql += ' LIMIT 1';

  try{
    // console.log('sql ', sql, replacements)
    connection = conn ? conn : await getPoolConnection();
    let [rows] = await connection.execute(sql, replacements);
    if(!conn) connection.release();
    return rows.length ? rows[0] : null;
  } catch(e) {
    throw e;
  } finally {
    if(!conn) connection.release();
  }
}


/**
 * 
 * @param  {[type]} table [description]
 * @param  {[type]} obj   [description]
 * @param  {[type]} conn  [description]
 * @return {[type]}       [description]
 */
async function findAll(table, obj, conn){
  if(!table) throw new Error('table name is required');

  var connection = null;
  
  let sql = "select * from " + table;
  let replacements = [];
  
  if(obj.where && Object.keys(obj.where).length){
    let keys = Object.keys(obj.where)
    replacements = keys.map(k => obj.where[k]);
    
    let wheres = ""
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      var isLast = i == keys.length - 1
      if (!isLast){
        wheres += key + " = ? AND "
      } else {
        wheres += key + " = ?"
      }
    }
    sql = sql + " where " + wheres;
  }
  
  if(obj.order){
    let arr = [];
    for (const key in obj.order) {
      arr.push(key + ' ' + obj.order[key]);
    }
    sql += ' ORDER BY ' + arr.toString();
  }
  
  if(obj.limit){
    sql += ' LIMIT ' + obj.limit;
    sql += obj.offset ? (' OFFSET ' + obj.offset) : '';
  }

  try{
    // console.log('sql ', sql, replacements)
    connection = conn ? conn : await getPoolConnection();
    let [rows] = await connection.execute(sql, replacements);
    if(!conn) connection.release();
    return rows;
  } catch(e) {
    throw e;
  } finally {
    if(!conn) connection.release();
  }
}


async function findCounter(table, obj, conn){
  if(!table) throw new Error('table name is required');

  var connection = null;
  
  let sql = "select count(*) AS counter from " + table;
  let replacements = [];

  if(obj.where){
    let keys = Object.keys(obj.where)
    replacements = keys.map(k => obj.where[k]);
    
    let wheres = ""
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      var isLast = i == keys.length - 1
      if (!isLast){
        wheres += key + " = ? AND "
      } else {
        wheres += key + " = ?"
      }
    }
    sql = sql + " where " + wheres;
  }

  try{
    // console.log('sql ', sql, replacements)
    connection = conn ? conn : await getPoolConnection();
    let [rows] = await connection.execute(sql, replacements);
    return rows.length ? rows[0].counter : 0;
  } catch(e) {
    throw e;
  } finally {
    if(!conn) connection.release();
  }
}

/**
 * 保存一条记录
 * @param  {[type]} table 表名
 * @param  {[type]} data  需要更新的数据
 * @param  {[type]} where 
 * @param  {[type]} conn  
 * @return {[type]}       
 */
async function save(table, data, conn) {
  if(!table) throw new Error('table name is required');

  var connection = null;
    
  // 复制对象
  const copy = {};
  for (let key in data) {
    if (data.hasOwnProperty(key)) {
      // if(!data[key]) { console.log('缺少'+key, data[key])}
      copy[key] = data[key];
    }
  }

  try {
    connection = conn ? conn : await getPoolConnection();
    // 删除数据库表中不存在的字段
    let [rows] = await connection.execute('DESCRIBE ' + table);
    let fieldsArr = rows.map( i => i.Field );
    for (let key in copy) {
      if(fieldsArr.indexOf(key) == -1){
        delete copy[key];
      }
    }
    
    var keys = Object.keys(copy);
    var replacements = Object.values(copy);
    var params = keys.map(k => '?').toString();
    var sql = "INSERT INTO " + table + '(' + keys.join(",") + ')' 
              + ' VALUES ' + '(' + params + ')';
    let [result] = await connection.execute(sql, replacements);
    return result;
  } catch(e) {
    throw e;
  } finally {
    if(!conn) connection.release();
  }
}


/**
 * 更新一个表
 * @param  {[type]} table [description]
 * @param  {[type]} data  [description]
 * @param  {[type]} obj   [description]
 * @param  {[type]} conn  [description]
 * @return {[type]}       [description]
 */
async function update(table, data, obj, conn) {
  if(!table) throw new Error('table name is required');
  if(!obj.where) throw new Error('where condition is required');

  var connection = null;
  
  // 复制对象
  const copy = {};
  for (let key in data) {
    if (data.hasOwnProperty(key)) {
      copy[key] = data[key];
    }
  }

  try {
    connection = conn ? conn : await getPoolConnection();

    // 删除数据库表中不存在的字段
    let [rows] = await connection.execute('DESCRIBE ' + table);
    let fieldsArr = rows.map( i => i.Field );
    for (let key in copy) {
      if(fieldsArr.indexOf(key) == -1){
        delete copy[key];
      }
    }

    delete copy.id;
    let keys = Object.keys(copy);
    keys = keys.map(k => k + '=:' + k);

    // 处理SQL
    let sql = "UPDATE " + table + ' SET ' + keys.join(",");
    if(obj.where){
      let keys = Object.keys(obj.where);
      // let whereField = keys.map(k => obj.where[k]);
      
      let wheres = ""
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        var isLast = i == keys.length - 1
        if (!isLast){
          wheres += `${key}=:${key} AND `;
        } else {
          wheres += `${key}=:${key}`;
        }
      }
      sql = sql + " where " + wheres;
    }

    const replacements = Object.assign(copy, obj.where);

    let [result] = await connection.execute(sql, copy);
    return result;
  } catch(e) {
    throw e;
  } finally {
    if(!conn) connection.release();
  }
}


/**
 * 删除记录
 * @param  {[type]} table [description]
 * @param  {[type]} obj   [description]
 * @param  {[type]} conn  [description]
 * @return {[type]}       [description]
 */
async function destroy(table, obj, conn){
  if(!table) throw new Error('table name is required');
  if(typeof obj !== 'object') throw new Error('arguments must be an object');

  var connection = null;

  try {
    connection = conn ? conn : await getPoolConnection();

    let sql = 'DELETE FROM ' + table;
    let replacements = [];

    if(obj.where && Object.keys(obj.where).length){
      let keys = Object.keys(obj.where)
      replacements = keys.map(k => obj.where[k]);
      
      let wheres = ""
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        var isLast = i == keys.length - 1
        if (!isLast){
          wheres += key + " = ? AND "
        } else {
          wheres += key + " = ?"
        }
      }
      sql = sql + " WHERE " + wheres;
    } else {
      throw new Error('where condition is required');
    }

    let [result] = await connection.execute(sql, replacements);
    return result;
  } catch(e) {
    throw e;
  } finally {
    if(!conn) connection.release();
  }
}



module.exports = {
  getConnection,
  getPool,
  getPoolConnection,
  query,
  execute,
  findOne,
  findAll,
  findCounter,
  update,
  save,
  destroy
};
