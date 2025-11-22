// ========== ① 引入模块 ==========
// http   : 原生 HTTP 服务器（像 Express 的底层，无框架也能开网站）
// mysql2 : MySQL 驱动，支持 Promise，让我们用 async/await 写 SQL
// dotenv : 环境变量管理，从 .env 文件读取配置
const http = require('http');
const mysql = require('mysql2/promise');
require('dotenv').config(); // 加载 .env 文件中的环境变量

// ========== ② 创建连接池 ==========
// 作用：① 比单连接更快 ② 自动回收连接 ③ 高并发不爆库
// 使用环境变量配置，更安全、更灵活
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',                    // 数据库 IP
  user: process.env.DB_USER || 'root',                        // 你的账户
  password: process.env.DB_PASSWORD || '666333',              // 你的密码
  database: process.env.DB_NAME || 'test',                     // 你的库名
  waitForConnections: process.env.DB_WAIT_FOR_CONNECTIONS === 'true' || true, // 连接满时排队，不报错
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10 // 最多同时连接数
});

// ========== ③ 启动服务器 ==========
// 原生 http.createServer 就像 Express 的 app.listen
// 我们把"路由分发器"传进去，它收到请求就调用 router(req, res)
const PORT = process.env.PORT || 3000;
http.createServer(router).listen(PORT, () => {
  console.log(`CRUD 服务运行中 → http://localhost:${PORT}/users`);
  console.log('数据库配置：', {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME
  });
});

// ========== ④ 路由分发器（URL → 函数） ==========
// 作用：根据 URL 和方法（GET/POST/PUT/DELETE）决定执行哪段代码
// 我们用它实现 RESTful：URL 只定位资源，动作由 HTTP 方法决定
async function router(req, res) {
  // ④-1 标准 URL 解析（无 deprecation 警告）
  // new URL(...) 比 url.parse() 更标准，还能自动拼完整地址
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);
  // 告诉浏览器：我返回的是 JSON，中文不乱码
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  // ========== ⑤ 新增（C）POST /users ==========
  // 只有当方法是 POST 且路径是 /users 时才进入
  if (pathname === '/users' && req.method === 'POST') {
    let body = '';                                    // 累加器，收完整个 JSON 包
    req.on('data', chunk => body += chunk);           // 一段段收数据
    req.on('end', async () => {                       // 收完再处理（避免半包）
      const { name, email, profession } = JSON.parse(body); // 解构字段
      // 占位符 ? 防 SQL 注入，顺序对应数组元素
      const [result] = await pool.query(
        'INSERT INTO tb_user(name,email,profession) VALUES(?,?,?)',
        [name, email, profession]
      );
      // result.insertId 是 MySQL 自动生成的主键，返回给前端
      res.end(JSON.stringify({ id: result.insertId }));
    });
    return; // 不再往下走，避免继续判断其他 if
  }

  // ========== ⑥ 查询（R）GET /users 或 GET /users/1 ==========
  // 任何以 /users 开头的路径都进来，例如 /users、/users/1、/users/999
  if (pathname.startsWith('/users')) {
    const id = pathname.split('/')[2]; // /users/1 → ["users","1"]
    // 有 id 就查单条，无 id 查全部
    const sql = id ? 'SELECT * FROM tb_user WHERE id=?' : 'SELECT * FROM tb_user';
    // 第二个参数是参数数组，有 id 就传 [id]，无 id 传空数组 []
    const [rows] = await pool.query(sql, id ? [id] : []);
    res.end(JSON.stringify(rows)); // 直接数组返回，前端 forEach 即可
    return;
  }

  // ========== ⑦ 更新（U）PUT /users/1 ==========
  // 必须是 PUT 且路径像 /users/数字
  // ========== ⑦ 更新（U）PUT /users/数字 ==========
  if (pathname.startsWith('/users/') && req.method === 'PUT') {
    console.log('[DEBUG] 命中 PUT：', pathname, req.method);
    const id = pathname.split('/')[2];
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      const { name, email, profession } = JSON.parse(body);
      await pool.query(
        'UPDATE tb_user SET name=?,email=?,profession=? WHERE id=?',
        [name, email, profession, id]
      );
      res.end(JSON.stringify({ updated: id }));
    });
    return;
  }

  // ========== ⑧ 删除（D）DELETE /users/数字 ==========
  if (pathname.startsWith('/users/') && req.method === 'DELETE') {
    console.log('[DEBUG] 命中 DELETE：', pathname, req.method);
    const id = pathname.split('/')[2];
    await pool.query('DELETE FROM tb_user WHERE id=?', [id]);
    res.end(JSON.stringify({ deleted: id }));
    return;
  }

  // ========== ⑨ 404 兜底 ==========
  // 任何未匹配的路径都走到这里
  res.writeHead(404);
  res.end(JSON.stringify({ message: 'Not Found' }));
}