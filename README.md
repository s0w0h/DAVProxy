> 此项目处于开发早期，暂时不能使用，注意！⚠️

# DAVProxy

这是一个WebDAV代理服务系统，允许用户管理多个WebDAV存储源，并为每个存储源生成独立的代理凭据。

## 功能特点

- 多存储源管理：支持添加和管理多个WebDAV存储源
- 代理凭据生成：为每个存储源生成独立的代理用户名和密码
- 凭据有效期控制：可设置代理凭据的有效期
- 用户认证：支持用户注册和登录
- 现代化界面：使用React和Ant Design构建的友好用户界面

## 技术栈

- 后端：FastAPI (Python)
- 前端：React + Ant Design
- 数据库：MySQL
- 容器化：Docker

## 快速开始

### 使用Docker Compose运行

1. 克隆仓库：
   ```bash
   git clone https://github.com/s0w0h/DAVProxy.git
   cd DAVProxy
   ```

2. 创建环境变量文件：
   ```bash
   cp src/.env.example src/.env
   ```
   根据需要修改环境变量。

3. 使用Docker Compose启动服务：
   ```bash
   docker-compose up -d
   ```

4. 访问服务：
   - 前端界面：http://localhost:3000
   - API文档：http://localhost:8000/docs

### 手动安装

1. 安装后端依赖：
   ```bash
   pip install -r requirements.txt
   ```

2. 安装前端依赖：
   ```bash
   cd frontend
   npm install
   ```

3. 启动后端服务：
   ```bash
   cd src
   uvicorn main:app --reload
   ```

4. 启动前端服务：
   ```bash
   cd frontend
   npm run dev
   ```

## 使用说明

1. 注册/登录：首次使用需要注册账号
2. 添加存储源：
   - 点击「添加存储源」
   - 填写存储源信息（名称、WebDAV地址、用户名、密码）
3. 生成代理凭据：
   - 在存储源列表中选择需要代理的存储源
   - 点击「生成代理凭据」
   - 设置凭据有效期
   - 使用生成的代理用户名和密码访问WebDAV服务

## 环境变量

- `DATABASE_URL`：数据库连接URL
- `SECRET_KEY`：JWT密钥
- `ACCESS_TOKEN_EXPIRE_MINUTES`：访问令牌过期时间（分钟）

## 开发说明

- 后端API位于`src/main.py`
- 数据库模型位于`src/models.py`
- 前端页面组件位于`frontend/src/pages`
- 认证相关代码位于`src/auth.py`

## 贡献

欢迎提交Issue和Pull Request。

## 许可证

MIT License