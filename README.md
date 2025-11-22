# CRUD API 服务

这是一个使用原生 Node.js 和 MySQL 构建的 RESTful CRUD API 服务。

## 环境变量配置

项目使用 `.env` 文件来管理敏感配置信息。

### 创建环境变量文件

1. 复制 `.env.example` 文件为 `.env`（如果不存在，请创建）
2. 根据你的环境修改配置：

```bash
# 复制示例文件
cp .env.example .env
```

### 环境变量说明

```env
# MySQL数据库配置
DB_HOST=localhost          # 数据库主机地址
DB_USER=root              # 数据库用户名
DB_PASSWORD=666333        # 数据库密码
DB_NAME=test              # 数据库名称

# 服务器配置
PORT=3000                 # 服务器端口号

# 数据库连接池配置
DB_CONNECTION_LIMIT=10    # 最大连接数
DB_WAIT_FOR_CONNECTIONS=true  # 连接满时是否排队等待
```

### 安全注意事项

1. **不要将 `.env` 文件提交到版本控制**
   - `.env` 文件已添加到 `.gitignore`
   - 敏感信息（如密码）应该通过环境变量传递

2. **不同环境使用不同配置**
   - 开发环境：`.env.development`
   - 生产环境：`.env.production`
   - 测试环境：`.env.test`

## 安装依赖

```bash
npm install
```

## 启动服务

```bash
# 开发环境
npm start

# 或者直接运行
node curd.js
```

## API 端点

- `GET /users` - 获取所有用户
- `GET /users/:id` - 获取单个用户
- `POST /users` - 创建新用户
- `PUT /users/:id` - 更新用户
- `DELETE /users/:id` - 删除用户

## 数据库表结构

确保数据库中有 `tb_user` 表：

```sql
CREATE TABLE IF NOT EXISTS tb_user (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  profession VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 优势

使用环境变量的好处：

1. **安全性**：敏感信息不暴露在代码中
2. **灵活性**：不同环境使用不同配置
3. **可维护性**：配置集中管理，易于修改
4. **团队协作**：每个开发者可以使用自己的本地配置