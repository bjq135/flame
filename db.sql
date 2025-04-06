CREATE TABLE `tb_article` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `title` varchar(255) NOT NULL COMMENT '标题',
  `thumbnail_id` bigint(11) DEFAULT NULL COMMENT '缩略图ID ',
  `content` text COMMENT '内容',
  `description` text COMMENT '简介',
  `more` text COMMENT '扩展属性,如缩略图列表;格式为json',
  `created_at` datetime DEFAULT NULL COMMENT '提交时间',
  `updated_at` datetime DEFAULT NULL COMMENT '处理时间',
  `deleted_at` datetime DEFAULT NULL COMMENT '软删除时间',
  `status` bigint(11) DEFAULT '0' COMMENT '状态,0:未审核,1:已审核',
  `url` varchar(255) DEFAULT NULL COMMENT '链接',
  `hit_counter` bigint(11) DEFAULT '0' COMMENT '点击次数',
  `list_order` bigint(11) DEFAULT '99' COMMENT '排序',
  `is_show` bigint(1) DEFAULT NULL COMMENT '是否显示 1 显示 0隐藏',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `thumbnail_id` (`thumbnail_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `tb_article_meta` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `article_id` bigint(20) NOT NULL,
  `meta_key` varchar(100) NOT NULL,
  `meta_value` longtext NOT NULL,
  PRIMARY KEY (`id`),
  KEY `article_id` (`article_id`),
  KEY `meta_key` (`meta_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `tb_article_to_category` (
  `article_id` bigint(20) NOT NULL,
  `category_id` bigint(20) NOT NULL,
  KEY `tb_portal_article_to_category_article_id_category_id` (`article_id`,`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `tb_article_to_tag` (
  `article_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL,
  KEY `article_id` (`article_id`),
  KEY `tag_id` (`tag_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `tb_asset` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL COMMENT '用户id',
  `parent_id` bigint(20) NOT NULL COMMENT '父id，比如相关文章的图片，非必填',
  `file_name` varchar(255) DEFAULT NULL COMMENT '文件名',
  `file_path` varchar(255) NOT NULL DEFAULT '' COMMENT '文件路径,相对于upload目录,可以为url',
  `file_size` bigint(20) NOT NULL COMMENT '文件大小,单位B',
  `suffix` varchar(255) NOT NULL DEFAULT '' COMMENT '文件后缀名,不包括点',
  `download_counter` bigint(20) DEFAULT '0' COMMENT '下载次数',
  `created_at` datetime NOT NULL COMMENT '创建时间',
  `more` text COMMENT '其它详细信息,JSON格式',
  `status` bigint(20) NOT NULL DEFAULT '1' COMMENT '状态;1:可用,0:不可用',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `tb_category` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `parent_id` bigint(20) NOT NULL,
  `user_id` bigint(20) DEFAULT NULL COMMENT '创建者ID',
  `title` varchar(50) NOT NULL,
  `description` text,
  `thumbnail_id` bigint(20) DEFAULT NULL COMMENT '缩略图ID',
  `list_order` bigint(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `is_show` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4;

CREATE TABLE `tb_category_meta` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `category_id` bigint(20) NOT NULL,
  `meta_key` varchar(100) NOT NULL,
  `meta_value` longtext NOT NULL,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  KEY `meta_key` (`meta_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `tb_code` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `code` varchar(25) COLLATE utf8_unicode_ci DEFAULT NULL,
  `account` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `is_used` int(11) DEFAULT NULL,
  `ip` varchar(128) COLLATE utf8_unicode_ci DEFAULT NULL,
  `flag` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `expired_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `tb_comment` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `from_user_id` bigint(20) NOT NULL COMMENT '评论者uuid',
  `to_user_id` bigint(20) DEFAULT NULL COMMENT '被评论者的uuid',
  `object_id` bigint(20) NOT NULL COMMENT '评论主题ID',
  `parent_id` bigint(20) NOT NULL DEFAULT '0' COMMENT '父评论ID',
  `content` text COMMENT '评论内容',
  `more` text COMMENT '扩展属性',
  `like_counter` bigint(11) DEFAULT NULL COMMENT '点赞次数',
  `dislike_counter` bigint(11) DEFAULT NULL COMMENT '被踩次数',
  `is_show` int(11) DEFAULT NULL COMMENT '是否删除',
  `created_at` bigint(11) DEFAULT NULL COMMENT '创建时间',
  `updated_at` bigint(11) DEFAULT NULL COMMENT '更新时间',
  `deleted_at` bigint(11) DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `tb_doc` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8_unicode_ci,
  `thumbnail` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `path` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `tb_doc_item` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `article_id` bigint(20) NOT NULL,
  `parent_id` bigint(20) NOT NULL,
  `doc_id` int(11) NOT NULL DEFAULT '0',
  `list_order` int(11) NOT NULL DEFAULT '99',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `tb_log` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) DEFAULT NULL COMMENT '用户 ID',
  `ip` varchar(128) DEFAULT NULL COMMENT 'IP 地址',
  `action` varchar(50) NOT NULL COMMENT '操作名称，需要格式唯一',
  `count` bigint(20) NOT NULL COMMENT '当天的次数',
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `tb_menu` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(100) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  `url` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `icon` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL,
  `is_show` int(1) NOT NULL DEFAULT '1',
  `parent_id` int(11) NOT NULL DEFAULT '0',
  `list_order` int(11) NOT NULL DEFAULT '99',
  `menu_group` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `tb_option` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `option_name` varchar(80) DEFAULT NULL,
  `option_value` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `option_name` (`option_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `tb_page` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `title` varchar(255) NOT NULL,
  `thumbnail_id` varchar(255) DEFAULT NULL,
  `content` text NOT NULL,
  `description` text,
  `more` text,
  `template` varchar(255) DEFAULT NULL COMMENT '模板',
  `route_url` varchar(100) DEFAULT NULL COMMENT '路由地址',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `hit_counter` bigint(11) DEFAULT NULL,
  `is_show` bigint(11) DEFAULT NULL,
  `list_order` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `route_url` (`route_url`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `tb_star` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `object_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `created_at` bigint(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `tb_tag` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `tag_title` varchar(50) NOT NULL COMMENT '标签名',
  `list_order` bigint(11) DEFAULT '99' COMMENT '排序',
  PRIMARY KEY (`id`,`tag_title`),
  UNIQUE KEY `tag_title` (`tag_title`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `tb_user` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `nickname` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `mobile` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL,
  `password` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `gender` int(1) NOT NULL DEFAULT '0' COMMENT '0 保密、1 男、2 女',
  `birthday` bigint(11) DEFAULT NULL,
  `score` bigint(11) DEFAULT NULL,
  `coin` bigint(11) DEFAULT NULL,
  `balance` decimal(10,2) DEFAULT NULL,
  `avatar` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `signature` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `last_login_ip` varchar(15) COLLATE utf8_unicode_ci DEFAULT NULL,
  `more` text COLLATE utf8_unicode_ci,
  `address` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `type` int(1) NOT NULL DEFAULT '1' COMMENT '用户类型 0:超级管理员 1:普通用户',
  `created_at` datetime DEFAULT NULL,
  `logined_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `status` int(1) NOT NULL DEFAULT '1' COMMENT '用户状态 1:正常、0:禁用',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `tb_user_meta` (
  `user_meta_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `meta_key` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `meta_value` longtext COLLATE utf8_unicode_ci,
  PRIMARY KEY (`user_meta_id`),
  KEY `user_id` (`user_id`),
  KEY `meta_key` (`meta_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



LOCK TABLES `tb_article` WRITE;
INSERT INTO `tb_article` (`id`, `user_id`, `title`, `thumbnail_id`, `content`, `description`, `more`, `created_at`, `updated_at`, `deleted_at`, `status`, `url`, `hit_counter`, `list_order`, `is_show`)
VALUES
  (1,1,'开会开会接口',NULL,'<p>h接口和健康</p>','','','2024-11-04 09:58:52','2024-11-04 10:12:03',NULL,0,'',4,99,1);
UNLOCK TABLES;


LOCK TABLES `tb_article_to_category` WRITE;
INSERT INTO `tb_article_to_category` (`article_id`, `category_id`)
VALUES
  (1,1);
UNLOCK TABLES;


LOCK TABLES `tb_category` WRITE;
INSERT INTO `tb_category` (`id`, `parent_id`, `user_id`, `title`, `description`, `thumbnail_id`, `list_order`, `created_at`, `is_show`)
VALUES
  (1,0,NULL,'默认分类',NULL,NULL,99,NULL,NULL);
UNLOCK TABLES;

LOCK TABLES `tb_menu` WRITE;
INSERT INTO `tb_menu` (`id`, `title`, `url`, `icon`, `is_show`, `parent_id`, `list_order`, `menu_group`)
VALUES
  (1,'首页','/',NULL,1,0,99,'home'),
  (2,'默认分类','/categories/1',NULL,1,0,99,'home'),
  (3,'关于','/pages/1',NULL,1,0,99,'home');
UNLOCK TABLES;

LOCK TABLES `tb_option` WRITE;
INSERT INTO `tb_option` (`id`, `option_name`, `option_value`)
VALUES
  (1,'site_option','{\"site_logo\":\"/assets/home/images/logo.png\",\"site_title\":\"JavaScript 编程网\",\"site_keyword\":\"JavaScript,JS,Node.js,前端开发,APP开发\",\"site_description\":\"JavaScript 是一种函数优先的高级编程语言，是互联网上最流行的脚本语言。使用 JavaScript 可以开发前端网站、APP、小程序和游戏，也可以开发服务端 API 或开发 ServerLess。甚至开发物联网嵌入式也不在话\",\"copyright\":\"&copy; 2024\\n<a href=\\\"https://javascript.net.cn\\\" target=\\\"_blank\\\">JavaScript 编程网</a>\\n<a href=\\\"https://beian.miit.gov.cn\\\" rel=\\\"nofollow\\\" target=\\\"_blank\\\">豫ICP备13014886号-9</a>\",\"registration_is_open\":\"1\",\"_method\":\"put\",\"content\":\"测试\"}');
UNLOCK TABLES;


LOCK TABLES `tb_page` WRITE;

INSERT INTO `tb_page` (`id`, `user_id`, `title`, `thumbnail_id`, `content`, `description`, `more`, `template`, `route_url`, `created_at`, `updated_at`, `deleted_at`, `hit_counter`, `is_show`, `list_order`)
VALUES
  (1,1,'关于','','<p>关于页面</p>','',NULL,'','','2024-11-04 10:11:29',NULL,NULL,-9223372036854775808,1,NULL);

UNLOCK TABLES;


LOCK TABLES `tb_user` WRITE;

INSERT INTO `tb_user` (`id`, `username`, `nickname`, `email`, `mobile`, `password`, `gender`, `birthday`, `score`, `coin`, `balance`, `avatar`, `signature`, `last_login_ip`, `more`, `address`, `type`, `created_at`, `logined_at`, `updated_at`, `status`)
VALUES
  (1,'admin','admin','admin@admin.com',NULL,'7fef6171469e80d32c0559f88b377245',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,1);

UNLOCK TABLES;

