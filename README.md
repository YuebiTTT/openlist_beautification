# OpenList Premium Glass 视频背景主题

## 1. 项目简介

本套文件用于给 OpenList 添加：

- 视频背景（亮色 / 暗色两套视频）
- 玻璃拟态 UI
- 自定义顶部栏、搜索面板、返回顶部、底部状态栏
- 登录 / 注册弹窗
- 注册 API 服务
- 亮暗主题切换与切换动画
- 移动端适配

包含三个文件：

| 文件 | 作用 |
|---|---|
| `custom_head.css` | 实际是“头部注入内容”，包含 CSS、登录/注册弹窗 HTML、注册逻辑 JS。注意：它**不是纯 CSS 文件**。 |
| `custom_content.html` | 页面内容注入，包含视频背景、自定义 UI、样式、主题/搜索/登录弹窗/页脚逻辑。 |
| `server.js` | 零依赖 Node.js 注册 API 服务，通过 OpenList 管理员账号创建普通用户。 |

> `custom_content.html` 依赖 `custom_head.css` 中的 `#openlist-login-modal` 登录/注册弹窗。  
> 请确保 `custom_head.css` 的内容已经注入，否则登录弹窗脚本会等待超时。

---

## 2. 功能说明

### 2.1 视频背景

- 亮色主题视频：
  `/d/学生目录/alist默认背景/lemon.mp4`
- 暗色主题视频：
  `/d/学生目录/alist默认背景/wallpaper1.mp4`
- 通过 `fetch` 拉取为 Blob 后播放，减少视频地址直接暴露。
- 视频文件需要当前用户可访问；如果目录需要登录，未登录/游客可能加载失败。

### 2.2 自定义 UI

- 顶部栏：品牌、搜索按钮、主题切换、刷新、更多菜单。
- 搜索面板：按 `/` 或点击搜索按钮打开，`Esc` 关闭。
- 底部状态栏：Online 状态、登录/登出按钮。
- 更多菜单：管理后台入口。
- 返回顶部按钮。
- 移动端底部栏、顶部栏、面包屑、文件列表适配。

### 2.3 登录 / 注册

- 未登录访问时自动弹出登录框。
- 支持“以游客身份浏览”。
- 支持登录、注册、注册成功后自动登录。
- 注册时必须填写邀请码；`server.js` 将其与 `REGISTRATION_INVITE_CODE` 精确比对，不匹配时返回“请联系管理员获取邀请码”。部署前需将该常量设置为非空邀请码，否则服务端会拒绝注册。
- 注册请求发送到 `REGISTER_API`。
- 登录请求发送到 OpenList 同源接口：`/api/auth/login`。
- 登录成功后将 token 写入 `localStorage` 的 `token` 键，然后刷新页面。
- 底部登录按钮会根据 `localStorage/sessionStorage` 中的 `token` 切换“登录/登出”。

### 2.4 注册 API

`server.js` 提供：

- `GET /api/register`：健康检查。
- `POST /api/register`：注册接口。

注册流程：

1. 使用管理员账号登录 OpenList：`/api/auth/login`
2. 获取管理员 token
3. 调用 OpenList 管理接口创建普通用户：`/api/admin/user/create`
4. 返回注册结果

---

## 3. 部署前必须修改的配置

### 3.1 `custom_head.css` 中的注册 API 地址

当前：

```js
var REGISTER_API = "http://10.88.206.67:3235/api/register";