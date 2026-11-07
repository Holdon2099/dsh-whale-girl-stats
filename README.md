# 鲸鱼娘干饭账本 · whale-girl-stats

DSH Web GUI 的**真实会话数据统计插件**。它读取本机 DSH Session 日志里的真实 token 用量，统计总 Token、会话数、按价格估算的成本与预算，展示 14 天消耗时间线和逐会话明细，同时监控 CPU 占用与运行时长。

主题角色是鲸鱼娘「汐」：头顶一只不锈钢饭盆。**每当 Token 被消耗，她就把盆子端起来干饭**——吃得越快动画越快，累计 Token 越多碗数越多；她只会越吃越开心，永远不会吃饱。

![概览](assets/screenshots/01-overview.png)

![CPU 监控](assets/screenshots/02-cpu.png)

![设置](assets/screenshots/03-settings.png)

![状态小窗](assets/screenshots/04-status-window.png)

---

## 已实现

- **入口与常驻状态窗**：侧边栏底部 `sidebar.footer.action` 的「干饭账本」按钮；另有一个常驻小状态窗，实时显示「已用 token / 预估成本」两项信息，可在 DSH 界面内任意拖动，位置保存在浏览器 `localStorage`，窗口缩放时自动收回可视范围；点击（不拖动）打开完整统计面板。默认停靠在左下角账号上方，不遮挡账号。
- **真实数据**：通过 Host 的 `sessionQuery` 服务读取本机全部会话（含当前活动会话），不读假数据、不依赖浏览器缓存。
- **总览 KPI**：总 Token（输入 / 输出 / 缓存读取分项）、真实会话数、进行中会话数、请求数。
- **成本估算**：按可配置的每百万 Token 单价（默认 ¥2 输入 / ¥3 输出 / ¥0.2 缓存读取 / ¥2 缓存写入）计算人民币成本。
- **预算**：支持「本月」或「累计」预算，显示已花、剩余、进度条；超支变红。
- **Token 时间线**：最近 7/14/30 天逐日堆叠柱状图（输入 / 输出 / 缓存读取）+ 成本折线，hover 查看当天明细。
- **逐会话明细**：标题、更新时间、Token 分项、成本、请求数、模型、进行中 / 已归档；可排序、可展开。
- **CPU 监控**：实时总占用、每核占用、进程 CPU、进程内存、系统内存、系统运行时长、进程运行时长、最近采样 sparkline。
- **干饭角色**：空闲时头顶饭盆等待投喂；检测到 Token 增长立即进入干饭——咀嚼弹跳、米粒从盆里落下、蒸汽、爱心、星星、气泡轮换；饭量随累计 Token 增长，速度随消耗速率提高，永远不显示“吃饱”。
- **设置**：面板内直接修改预算、价格、每碗 Token 数、时间线天数；写回插件配置并实时生效。
- **本地化**：简体中文 / English。
- **自带素材**：透明立绘、头像、插件图标；无第三方运行时依赖。

---

## 安装

在 DSH 插件管理器里添加本仓库地址：

```text
https://github.com/Holdon2099/dsh-whale-girl-stats
```

或用你所使用版本的 `dsh plugin add` 安装该 GitHub 仓库。安装后刷新页面，在侧边栏底部、Settings 旁边会出现「干饭账本」入口；点击打开统计面板。

> 插件会随 DSH 启动自动加载，Host 接口：`GET /api/whale-girl-stats/overview`。

---

## 数据来源

Host 端在 `index.js` 里通过 DSH 的公开服务读取：

- `ctx.get('sessionQuery').listSessions()` —— 全部逻辑会话（活动会话优先）。
- `ctx.get('sessionQuery').readSession(id)` —— 非活动会话的完整事件日志（读一次后缓存）。
- `ctx.sessions.list()` 与 `session.ownEvents()` —— 活动会话直接读内存中的事件，不重复读盘。
- `assistant/message` 事件上的 `usage` 字段是唯一的 Token 来源；`session/title`、`turn/start`、`user/message` 提供标题、轮次和空会话判定。
- `session/inheritedEventCount` 之前的继承事件会被跳过，避免 fork 会话重复计费。

Token 计数规则：

- `totalTokens = inputTokens + outputTokens + cacheReadTokens (+ cacheWriteTokens)`（优先使用 provider 返回的 `totalTokens`）。
- 成本 = `(inputTokens × 输入价 + outputTokens × 输出价 + cacheReadTokens × 缓存读取价 + cacheWriteTokens × 缓存写入价) / 1,000,000`。
- 默认价格是**估算值**，可在面板设置里按实际价目修改。

CPU 数据来自 Node `os` 模块与 `process.cpuUsage()`：Host 每 3 秒采样一次，保留最近 60 个点；Windows 上 `os.loadavg()` 恒为 0，因此面板显示 `—`。

---

## 角色逻辑

| 状态 | 触发 | 表现 |
|---|---|---|
| 空闲 | 最近 60 秒无 Token 消耗 | 头顶饭盆轻轻浮动，气泡轮换「快投喂」台词，开心度缓慢呼吸 |
| 干饭 | 检测到 Token 总量增加 / `rate.active` | 饭盆向上飘起并倾斜，米粒落下，角色咀嚼弹跳，蒸汽、爱心、星星，气泡变成「好耶！又来饭了！」 |
| 暴食 | 最近一分钟 Token 消耗超过阈值 | 动画速度提升到 2 倍以上，粒子更密集，气泡「干饭模式全开！！」 |

- 碗数 = `累计 Token / 每碗 Token 数`（默认 8000），面板显示「第 N 碗」和本碗进度。
- 开心度随累计 Token 单调上升，**封顶 99.5%，永远不会到 100% / 永远不会“吃饱”**；面板同时显示「肚量 ∞ · 永远吃不饱」。
- Client 每 3 秒轮询一次；相邻快照的 Token 增量、`rate.tokensPerMin`、`character.state` 共同驱动动画强度。面板关闭或页面隐藏时停止轮询。

---

## 配置

设置面板写回插件配置（`cordis.patch.yml` 中 `whale-girl-stats` 行的 `config`）：

```yaml
- id: whale-girl-stats
  name: "@local/whale-girl-stats"
  config:
    enabled: true
    budget:
      amount: 50          # 0 = 未设置预算
      period: month       # month | total
    pricing:
      inputPerM: 2
      outputPerM: 3
      cacheReadPerM: 0.2
      cacheWritePerM: 2
    tokensPerBowl: 8000
    timelineDays: 14
```

保存后 Host 先立即应用新值，再通过 `configEditor` 写回配置并重载插件；面板会提示“已保存，插件正在重载”。

---

## Host 路由

- `GET  /api/whale-girl-stats/overview` —— 完整统计快照（含 CPU、时间线、会话）。
- `GET  /api/whale-girl-stats/config` —— 当前配置。
- `POST /api/whale-girl-stats/config` —— 修改配置（仅本机回环地址）。
- `GET  /api/whale-girl-stats/assets/eating.webp`
- `GET  /api/whale-girl-stats/assets/idle.webp`
- `GET  /api/whale-girl-stats/assets/avatar.webp`

所有读取接口同源、只读；写配置接口限制本机回环。

---

## 结构

```text
whale-girl-stats/
├─ index.js            # Host：sessionQuery 聚合、成本/预算、CPU 采样、配置与路由
├─ client.js           # Client：侧边栏入口、可拖动状态小窗、统计面板、图表、干饭动画、设置
├─ assets/
│  ├─ eating.webp      # 干饭立绘（透明背景）
│  ├─ idle.webp        # 头顶饭盆等待立绘（透明背景）
│  └─ avatar.webp      # 头像
├─ locale/zh.json, en.json
├─ icon.svg
├─ cordis.patch.yml
├─ package.json
└─ README.md
```

---

## 验证状态

已在本机实际安装并做页面级验证（OS 截图 + UI Automation，不是只查注册表）：

- Bundle `@local/whale-girl-stats@1.0.0` 安装成功，`application: applied`，插件行 `fiberPhase: active`。
- Client slot：`sidebar.footer.action` 中 `whale-stats.footer` active；`shell.overlay` 中 `whale-stats.launcher`、`whale-stats.dashboard` 均 active。
- Host 路由实测返回真实数据：8 个真实会话、页面打开时约 158M total tokens、估算成本约 ¥36.0、预算 ¥22.7 / ¥50；`sessions[]` 含 token 分项、成本、模型、运行状态。
- **页面视觉实测**：左下角浮标与侧边栏 footer 均可见；打开面板后 Hero 角色干饭、第 19,788 碗、碗进度、开心度 99.5% / 肚量 ∞、干饭速度 ×2.2、米粒/蒸汽/气泡均正常；KPI 四卡、14 天堆叠柱状图 + 成本折线、CPU 环形/每核条/sparkline/运行时长/内存、会话明细表（进行中/已加载/已归档三态）均正常渲染。
- 设置抽屉实测可打开，字段完整；保存调用 `POST /config` 成功，Host 重载后配置保持。
- 状态小窗实测：显示「已用 token / 预估成本」、默认停在账号上方不遮挡账号；可拖到界面任意位置，拖动不会误触打开面板；刷新页面后位置保持；点击可正常打开完整面板。
- 修复了实测发现的 Hero 卡片被 flex 压缩到 27px 的布局问题；`node --check index.js`、`node --check client.js` 均通过。
- Host 聚合逻辑另用**真实 Session 日志**做离线回放断言（27 项检查全部通过）。
- 未验证：干饭动画的逐帧动效（静态截图已确认关键帧元素与状态）、窄屏布局、浅色主题并排对比。

---

## 素材与版权

- 角色立绘与头像来自作者提供的角色三视图素材；版权归原作者，随本插件一起发布前已确认授权。
- `icon.svg` 为本插件绘制；`assets/icon-180.png` 由头像裁切生成，用于插件市场展示。
- 本插件代码无第三方运行时依赖。

---

## 已知限制

- 成本是**按 token 单价的估算值**，不是运营商账单；缓存命中、模型差异、价格调整都会影响实际费用。
- Token 只在 `assistant/message` 完成时写入日志，因此干饭动画会在一个 step 结束时爆发，而不是逐字流式增长。
- 历史会话首次加载会读完整日志（本机 1~5MB 压缩），之后缓存；活动会话读内存，轮询成本很低。
- 插件统计的是本机 `~/.dsh/sessions` 下全部工作区的会话；不包含其他机器或其他 profile 的用量。
- Windows 上不显示 load average（显示 `—`）。
