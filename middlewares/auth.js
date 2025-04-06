const i18n = require('i18n');
const jwt = require('jsonwebtoken');
const config = require('../config.js');


/**
 * 从 session 或者 jwt 中获取用户 id
 */
async function authInit( req, res, next){
  /*
  if (req.session && req.session.userId) {
    req.userId = req.session.userId;

    if(!req.cookies._csrf){
      res.cookie('_csrf', Math.round(Math.random()*999999) );
    }

    if(req.method == 'GET'){
      next();
      return;
    }

    if(req.query._csrf == undefined || req.query._csrf !== req.cookies._csrf){
      res.status(400);
      res.send({error:'miss _csrf token'});
      return;
    }

    next();
    return;
  }
  */
  
  let authorization =  req.get('authorization') ? req.get('authorization') : null;
  if(authorization && authorization.split(' ').length == 2){
    const scheme = authorization.split(' ')[0];
    const token = authorization.split(' ')[1];
    
    if( scheme.toLowerCase() == "bearer" ){
      try {
        let secret = config.jwt.secret ? config.jwt.secret : 'secret.';
        let decoded = jwt.verify(token, secret);
        req.userId = decoded.data.id;      
      } catch (error) {
        console.log(error.stack);
      }
    }
  }
  next();
}


/**
 * 如果请求中没有用户ID，禁止访问
 */
async function check( req, res, next){
  if(!req.userId){
    res.status(401).json({error: i18n.__('401')});
    return;
  } else {
    next();
  }
}


module.exports = { authInit, check };
