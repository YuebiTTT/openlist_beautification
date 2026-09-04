# OpenList 玻璃拟态主题 · 视频背景版

给 [OpenList](https://github.com/OpenListTeam/OpenList) 前端套的一套玻璃拟态皮肤：明暗双视频背景、自定义顶栏 / 底栏、搜索面板、快捷入口菜单，以及点击主题按钮时从鼠标位置扩散的转场特效。

纯 CSS + 原生 JS，不改任何页面模板，后台粘贴两段代码即可生效。

---

## 文件说明

| 文件 | 内容 | 粘贴位置 |
| --- | --- | --- |
| `custom_head.css` | 全部样式（**文件内含 `<style>` 标签**） | 管理后台 → 设置 → 全局 → **自定义头部** |
| `custom_content.html` | DOM 结构 + 内联 `<style>` + 全部交互脚本 | 管理后台 → 设置 → 全局 → **自定义内容** |

> `custom_head.css` 后缀是 `.css`，但内容是带 `<style>` 包裹的 HTML 片段，因为它要原样粘进「自定义头部」文本框，别当成纯 CSS 文件用。

---

## 食用方法

1. 登录 OpenList 管理后台，进入 **设置 → 全局**。
2. 把 `custom_head.css` 的**全部内容**（含首尾 `<style>`）粘进 **自定义头部**。
3. 把 `custom_content.html` 的**全部内容**粘进 **自定义内容**。
4. 保存，然后刷新前台页面。

注意两点：

- **先备份**你原来填的自定义头部 / 自定义内容，这两块是覆盖式保存。
- 自定义头部**不作用于管理页面**，`/@manage` 后台界面不会有任何变化，这是 OpenList 的设计，不是没生效。

---

## 功能一览

**视频背景**

- 浅色 / 深色主题各挂一个视频，`<video>` 全屏铺底，`object-fit: cover`。
- 切换主题时旧视频淡出 → 换源 → 新视频淡入，并记住播放进度，来回切不会每次从头开始。
- 上面盖了遮罩 + 模糊层，深色模式另有单独一层压暗，保证文字可读。
- 页面从后台切回来会自动尝试恢复播放；浏览器拦截自动播放时静默跳过（视频是 `muted` 的，通常能自动播）。

**顶栏**

品牌区（图标 + 标题 + 副标题）、居中搜索按钮、右侧 Online 状态 / 主题 ☼ / 刷新 ↻ / 更多 ⋯。滚动超过 35px 时顶栏进入 `scrolled` 状态（加深背景）。

**底栏**

左侧 Online 状态，右侧返回顶部 ↑。原来的「主题」「管理」两个按钮**已全局隐藏**（所有屏幕尺寸都隐藏），因为顶栏 ☼ 和 ⋯ 菜单里的「管理后台」已经覆盖了这两个功能。

**搜索面板**

复用 OpenList 原生搜索框，不另起一套。`/` 打开（输入框聚焦时不会误触发），ESC 或点击面板外关闭。

**更多菜单**

四项快捷入口，域名自动跟随当前访问的站点（可自定义）：

| 入口 | 地址 |
| --- | --- |
| 管理后台 | `当前域名:5244/@manage` |
| OpenWrt | `当前域名/` |
| qBittorrent | `当前域名:8081` |
| Clash | `当前域名:9090` |

**主题切换转场**

优先用 View Transitions API，新主题画面从点击位置圆形扩散开，叠加一层内容扭曲效果；浏览器不支持时自动降级成直接切换，不会报错。

**响应式**

三档断点：`768px`（手机）、`430px`（小屏）、`360px`（极窄）。手机上顶栏只留图标、隐藏品牌文字，文件列表行距和图标都会缩小。

**其他**

隐藏了 OpenList 原生 Header 和 Footer，整套界面由自定义顶栏 / 底栏接管。

---

## 首次使用要改的地方

### 1. 视频地址

`custom_content.html`，搜索 `DARK_VIDEO`：

```js
const LIGHT_VIDEO = "/d/background/lemon.mp4?sign=...";
const DARK_VIDEO  = "/d/background/wallpaper1.mp4?sign=...";
```

换成你自己的两个视频（浅色一个、深色一个）。建议视频放在 OpenList 自己的存储里用 `/d/` 直链，跨域和防盗链问题最少。

### 2. 品牌名

| 位置 | 内容 |
| --- | --- |
| `custom_content.html` 搜索 `openlist-brand-title` | 顶栏主标题（现为「铜催化剂」） |
| 搜索 `openlist-brand-subtitle` | 顶栏副标题（现为 `Personal Cloud`） |
| 搜索 `openlist-footer-brand` | 底栏品牌名 |

顶栏图标 `openlist-brand-icon` 是个字符 `◈`，想换就替换成别的字符或图片。

### 3. 快捷菜单的端口

`custom_content.html` 搜索 `管理后台` 或 `qBittorrent`，四个 `<a>` 的 `href` 改成你自己的地址和端口。不需要的直接删掉整段 `<a ...>...</a>`。

### 4. 主题色

`custom_head.css` 开头：

```css
--openlist-accent:     #20a4ff;
--openlist-accent-rgb: 32, 164, 255;
```

两个都要改，`:root` 里那个 rgb 版本是给 `rgba()` 用的。

---

## 配置速查

改样式时按这些关键字搜，比记行号可靠。

| 想改什么 | 文件 | 搜索关键字 |
| --- | --- | --- |
| 主题色 / 玻璃透明度 / 圆角 / 阴影 | `custom_head.css` | `:root` |
| 视频模糊程度 | `custom_head.css` | `视频模糊层` |
| 视频明暗、遮罩强度 | `custom_head.css` | `视频遮罩`、`深色模式视频遮罩` |
| 顶栏本体尺寸 | `custom_head.css` | `自定义顶部栏` |
| 顶栏滚动后的加深效果 | `custom_content.html` | `openlist-topbar.scrolled` |
| 底栏样式 | `custom_head.css` | `自定义底部导航`、`Footer 内部` |
| 底栏隐藏了哪些按钮 | `custom_head.css` | `隐藏底栏` |
| 更多菜单样式 | `custom_head.css` | `More Menu` |
| 主题转场特效 | `custom_head.css` | `主题切换转场` |
| 手机端适配 | `custom_head.css` | `手机端`、`超小屏幕` |
| 视频地址 | `custom_content.html` | `DARK_VIDEO` |
| 快捷入口 | `custom_content.html` | `快捷菜单` |
| 搜索快捷键 | `custom_content.html` | `快捷键` |
| 手机隐藏悬浮按钮 | `custom_content.html` | `手机上隐藏右下角悬浮的返回顶部` |

---

## 快捷键

| 键 | 作用 |
| --- | --- |
| `/` | 打开搜索面板（在输入框里输入时不触发） |
| `ESC` | 关闭搜索面板 / 关闭更多菜单 |

---

## 浏览器兼容

- **View Transitions API**（主题转场）：Chrome / Edge 111+、Safari 18+。Firefox 及旧版浏览器会自动降级为直接切换，功能不受影响。
- **`backdrop-filter`**（毛玻璃）：现代浏览器基本都支持，极少数环境不支持时会退化成半透明纯色，可读性没问题。
- 视频自动播放依赖 `muted` 属性，iOS Safari 需要 `playsinline`（已加）。

---

## 排错

**改完没生效**

先 Ctrl + F5。如果前面挂了 CDN 或反向代理，清一下那层的缓存。

**视频不播放**

- 打开浏览器控制台看视频请求是不是 404 / 403。
- 直链末尾的 `sign=xxx:0` 是用**管理员 Token** 签出来的。重置过密码、换过 Token 或重装过 OpenList 之后，旧的 sign 会失效，去 OpenList 里重新复制一次直链替换掉。
- `sign` 里冒号后面的数字是过期时间戳，`0` 表示不过期；如果那是个具体时间戳，过期后同样要重新生成。

**顶栏 / 底栏一直不出现**

脚本初始化故意延迟了 1 秒，等 OpenList 的 React 页面挂载完成（见 `custom_content.html` 末尾的 `setTimeout(init, 1000)`）。网络慢的话再等一两秒。

**底栏想恢复「主题」「管理」按钮**

删掉 `custom_head.css` 里 `隐藏底栏` 那一段规则即可，HTML 元素一直都在，只是被隐藏了。

**手机上想恢复右下角悬浮的返回顶部**

删掉 `custom_content.html` 里「手机上隐藏右下角悬浮的返回顶部」那段，并把 `#openlist-top` 的 `bottom` 值加回来（原来抬到 `62px` 是为了避让底栏）。

---

## 维护约定

这套代码的格式是**逐行竖排**的 —— 每个 CSS 属性和值各占一行，JS 里每个参数、每个条件也单独成行，缩进层级拉得很开：

```css
.openlist-footer-actions {

    display:
        flex;

    gap:
        4px;
}
```

这么写是为了让每一条声明都能被 diff 和 git blame 精确定位到，改的时候请保持这个风格，不要压成一行。

另外：

- 大量规则带 `!important`，因为要覆盖 Hope UI 运行时生成的内联样式和动态 class，去掉会导致样式失效。
- 样式优先级靠选择器权重压过各断点里的 `!important`，改底栏按钮的显示 / 隐藏时注意别顺手把 `!important` 删了。
- 两个文件互相引用 ID（比如 CSS 管 `#openlist-topbar` 的尺寸，HTML 管它内部元素），大改之前两边都搜一下。


---

Design by Yuebi
