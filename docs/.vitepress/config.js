export default {
  lang: 'zn-CN',
  title: 'Flame 文档', 
  titleTemplate: 'Flame',
  description: 'Flame 是一个基于 Node.js、Express 和 MySQL 开发的 CMS。',
  // base: '/boar', // base URL
  outDir: '../public/docs/flame',
  themeConfig: {
    // logo: '/logo.svg',
    // 顶部导航栏内容
    nav: [
      { text: '文档首页', link: '/' }
    ],
    // 侧边栏导航内容
    sidebar: [
      { text: '介绍', link: '/index.md' },
      { text: '安装', link: '/install.md' },
      // { text: '路由', link: '/router.md' },
      // { text: '控制器', link: '/controller.md' },
      { text: 'RBAC', link: '/rbac.md' },
      { text: '数据库', link: '/database.md' },
      // { text: '多语言', link: '/i18n.md' },
      // { text: '前端', link: '/frontend.md' },
      // { text: '文件上传', link: '/upload.md' },
      // { text: '权限', link: '/auth.md' },
      // { text: '函数', link: '/function.md' },
      { text: '更新', link: '/changes.md' },
      {
        text: 'API 接口',
        items: [
          { text: '权限接口', link: '/api/auth' },
          { text: '用户接口', link: '/api/users' },
          { text: '角色权限接口', link: '/api/rbac' },
          { text: '文章接口', link: '/api/articles' },
          { text: '分类接口', link: '/api/categories' },
          { text: '页面接口', link: '/api/pages' },
          { text: '站点接口', link: '/api/site' },
          { text: '上传接口', link: '/api/upload' },
          { text: '图片接口', link: '/api/images' },
          
          // { text: 'AI 生成', link: '/api/ai.md' },
        ]
      }
    ],


  }
};
