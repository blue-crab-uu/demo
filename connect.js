const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',      // 你的账户
  password: '666333',    // 你的密码
  database: 'test'
});

connection.query('SELECT 1 + 1 AS solution', (err, results) => {
  if (err) {
    console.error('连接失败：', err.message);
    process.exit(1);
  }
  console.log('MySQL 计算结果：', results[0].solution); // 2
  connection.end();
});