window.__ModuleLoader__.load({
  id: '@local/whale-girl-stats',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const { Fragment, useCallback, useEffect, useMemo, useRef, useState } = React;

    const PACKAGE_ID = '@local/whale-girl-stats';
    const LOCALE_NS = 'whaleGirlStats';
    const API = '/api/whale-girl-stats';
    const POLL_MS = 3000;
    const EATING_MS = 12000;
    const CPU_HISTORY_MAX = 40;

    /* ============================================================
     * 本地回退字典（Host 未注册 locale / props.t 缺失时使用）
     * ============================================================ */

    const ZH = {
      'entry.label': '干饭账本',
      'entry.title': '汐的深海食堂 · 干饭账本',
      'launcher.hint': '拖动可移动位置，点击打开干饭账本',
      'launcher.used': '已用 token',
      'launcher.cost': '预估成本',
      'header.title': '汐的深海食堂 · 干饭账本',
      'header.subtitle': '数据来自本机真实会话',
      'header.live': '实时',
      'header.online': '已连接',
      'header.connecting': '连接中…',
      'header.offline': '连接断开，重试中',
      'header.updated': '更新于 {time}',
      'header.refresh': '刷新数据',
      'header.refreshing': '刷新中…',
      'header.settings': '统计设置',
      'header.close': '关闭面板',
      'header.avatarAlt': '汐的头像',
      'hero.state.idle': '等待投喂',
      'hero.state.eating': '干饭中',
      'hero.state.feast': '干饭全开',
      'hero.bowlPrefix': '第',
      'hero.bowlUnit': '碗',
      'hero.bowlCaption': '累计干饭 · 永远吃不饱',
      'hero.bowlProgress': '本碗进度 {pct}%',
      'hero.hungry': '还能吃 · 永远吃不饱',
      'hero.happinessLine': '开心度 {pct}% · 肚量 ∞ · 永远吃不饱',
      'hero.rate': '近 60 秒 {tokens} token',
      'hero.speed': '干饭速度 ×{speed}',
      'hero.tokens': '累计 {tokens} token',
      'hero.bubble.idle.0': '盆子已经顶好了，主人快投喂～',
      'hero.bubble.idle.1': '今天的 token 香不香？',
      'hero.bubble.idle.2': '饭盆擦亮啦，就等 token 下锅。',
      'hero.bubble.grow.0': '好耶！又来饭了！',
      'hero.bubble.grow.1': '主人的 token 真香，再来一碗！',
      'hero.bubble.grow.2': '第 {n} 碗！还饿着！',
      'hero.bubble.feast': '干饭模式全开！！',
      'hero.bubble.offline': '饭盆还在，数据没来……再等等哦。',
      'hero.bubble.loading': '正在数米粒…稍等一下下。',
      'hero.note': '每次 token 增长都会开饭，碗数只增不减。',
      'hero.imageAlt': '鲸鱼娘汐端着一碗白米饭',
      'hero.bowlAlt': '不锈钢饭盆',
      'kpi.tokens': '总 Token',
      'kpi.tokensSub': '输入 {input} · 输出 {output} · 缓存读取 {cache}',
      'kpi.sessions': '会话数',
      'kpi.sessionsSub': '其中 {n} 个进行中',
      'kpi.cost': '估算成本',
      'kpi.costSub': '按 DeepSeek 官方峰谷价估算',
      'kpi.costSubCustom': '按自定义价目估算',
      'kpi.budget': '预算',
      'kpi.budgetRemaining': '¥{remaining} 剩余 / ¥{amount}',
      'kpi.budgetNone': '未设置预算',
      'kpi.budgetSpent': '已用 {pct}%',
      'kpi.budgetOver': '已超支 {pct}%',
      'kpi.today': '今日 {tokens} token',
      'kpi.todayCost': '今日 ¥{cost}',
      'timeline.title': '近 {days} 天消耗',
      'timeline.sub': '输入 / 输出 / 缓存读取同尺度堆叠，金线为估算成本',
      'timeline.legend.input': '输入',
      'timeline.legend.output': '输出',
      'timeline.legend.cache': '缓存读取',
      'timeline.legend.cost': '成本',
      'timeline.empty': '这段时间还没有 token 记录。',
      'timeline.cacheNote': '缓存读取通常远大于输入/输出，柱体按同一尺度展示。',
      'timeline.total': '总量',
      'timeline.requests': '请求',
      'timeline.cost': '成本',
      'cpu.title': 'CPU 监控',
      'cpu.usage': '当前占用',
      'cpu.cores': '每核占用（{n} 核）',
      'cpu.coresEmpty': '每核数据暂不可用',
      'cpu.processUptime': '进程运行',
      'cpu.uptime': '系统运行',
      'cpu.processCpu': '进程 CPU',
      'cpu.memory': '内存',
      'cpu.processMemory': '进程内存',
      'cpu.load': '负载 1/5/15',
      'cpu.history': '最近 40 次采样',
      'cpu.empty': 'CPU 数据暂不可用',
      'cpu.na': '—',
      'sessions.title': '会话明细',
      'sessions.sub': '默认按时间倒序，点击表头排序，点击行展开明细',
      'sessions.col.session': '会话',
      'sessions.col.updated': '更新时间',
      'sessions.col.tokens': 'Token',
      'sessions.col.cost': '成本',
      'sessions.col.model': '模型',
      'sessions.col.status': '状态',
      'sessions.live': '进行中',
      'sessions.loaded': '已加载',
      'sessions.archived': '已归档',
      'sessions.empty': '还没有会话记录。',
      'sessions.more': '共 {n} 个会话，显示前 {shown} 个',
      'sessions.today': '今天',
      'sessions.detail.input': '输入',
      'sessions.detail.output': '输出',
      'sessions.detail.cacheRead': '缓存读取',
      'sessions.detail.cacheWrite': '缓存写入',
      'sessions.detail.requests': '请求数',
      'sessions.detail.turns': '轮次',
      'sessions.detail.cwd': '工作目录',
      'sessions.detail.model': '模型',
      'sessions.detail.created': '创建时间',
      'settings.title': '统计设置',
      'settings.note': '成本为估算值，按每条消息的模型与发生时间自动选择峰谷价；不含 Search/Fetch 费用。',
      'settings.budget': '预算',
      'settings.budgetAmount': '预算金额（0 = 未设置，元）',
      'settings.budgetPeriod': '预算周期',
      'settings.period.month': '每月',
      'settings.period.total': '累计',
      'settings.pricing': '价格（自定义模式）',
      'settings.priceMode': '计价方式',
      'settings.priceModeHint': '默认使用 DeepSeek 官方峰谷价；自定义模式用于非 DeepSeek 或未收录模型。',
      'settings.mode.official': 'DeepSeek 官方峰谷价',
      'settings.mode.custom': '自定义单价',
      'settings.officialNote': '官方价目（¥/百万 token，峰/谷）：deepseek-flash 缓存命中 0.04/0.02、未命中 2/1、输出 8/4；deepseek-v4-pro 0.30/0.15、9/4.5、27/13.5。峰时为北京时间周一至周五 09:00–12:00、14:00–18:00（中国法定节假日为谷时），缓存写入按未命中输入价计费。',
      'settings.inputPerM': '未命中输入价',
      'settings.outputPerM': '输出价',
      'settings.cacheReadPerM': '缓存命中价',
      'settings.cacheWritePerM': '缓存写入价',
      'settings.character': '干饭参数',
      'settings.tokensPerBowl': '每碗 token 数',
      'settings.timelineDays': '时间线天数',
      'settings.days7': '7 天',
      'settings.days14': '14 天',
      'settings.days30': '30 天',
      'settings.save': '保存并重载',
      'settings.saving': '保存中…',
      'settings.saved': '已保存，插件正在重载',
      'settings.failed': '保存失败：',
      'settings.loading': '读取设置中…',
      'settings.loadFailed': '读取设置失败：',
      'settings.notEditable': '当前 profile 不能写回配置，请直接编辑 cordis.patch.yml。',
      'settings.close': '关闭设置',
      'settings.reloadHint': '保存后插件会短暂重载，面板会自动重连。',
      'state.loading': '正在读取本机会话数据…',
      'state.offline': '连接断开，重试中…',
      'state.offlineHint': '已保留上次数据，连接恢复后自动更新。',
      'state.unavailable': '无法读取会话数据。',
      'state.unavailableHint': '统计接口返回 available=false，面板继续显示可用部分。',
      'state.unpriced': '存在未计价模型',
      'state.unpricedHint': '{n} 个请求的模型不在官方价目表中，成本按 0 计；可在设置中切换到自定义价目。',
      'common.close': '关闭',
      'common.na': '—',
    };

    const EN = {
      'entry.label': 'Token ledger',
      'entry.title': "Xi's deep-sea cafeteria · rice ledger",
      'launcher.hint': 'Drag to move, click to open the rice ledger',
      'launcher.used': 'tokens used',
      'launcher.cost': 'estimated cost',
      'header.title': "Xi's deep-sea cafeteria · rice ledger",
      'header.subtitle': 'Live data from this machine',
      'header.live': 'live',
      'header.online': 'connected',
      'header.connecting': 'connecting…',
      'header.offline': 'disconnected, retrying',
      'header.updated': 'updated {time}',
      'header.refresh': 'Refresh data',
      'header.refreshing': 'Refreshing…',
      'header.settings': 'Statistics settings',
      'header.close': 'Close panel',
      'header.avatarAlt': "Xi's avatar",
      'hero.state.idle': 'waiting for rice',
      'hero.state.eating': 'eating',
      'hero.state.feast': 'feast mode',
      'hero.bowlPrefix': 'Bowl',
      'hero.bowlUnit': '',
      'hero.bowlCaption': 'bowls eaten · never full',
      'hero.bowlProgress': 'current bowl {pct}%',
      'hero.hungry': 'still hungry · never full',
      'hero.happinessLine': 'happiness {pct}% · capacity ∞ · never full',
      'hero.rate': '{tokens} tokens in the last 60s',
      'hero.speed': 'eating speed ×{speed}',
      'hero.tokens': '{tokens} tokens in total',
      'hero.bubble.idle.0': 'The basin is on my head — feed me, master~',
      'hero.bubble.idle.1': 'Do today’s tokens smell tasty?',
      'hero.bubble.idle.2': 'Basin polished. Waiting for the next token.',
      'hero.bubble.grow.0': 'Yay! More rice!',
      'hero.bubble.grow.1': 'Master’s tokens are so tasty — one more bowl!',
      'hero.bubble.grow.2': 'Bowl {n}! Still hungry!',
      'hero.bubble.feast': 'FEAST MODE!!',
      'hero.bubble.offline': 'The basin is here, but the data is not… wait a moment.',
      'hero.bubble.loading': 'Counting rice grains… one moment.',
      'hero.note': 'Every token growth starts a meal; the bowl count only goes up.',
      'hero.imageAlt': 'Xi the whale girl holding a bowl of rice',
      'hero.bowlAlt': 'stainless steel rice basin',
      'kpi.tokens': 'Total tokens',
      'kpi.tokensSub': 'input {input} · output {output} · cache read {cache}',
      'kpi.sessions': 'Sessions',
      'kpi.sessionsSub': '{n} in progress',
      'kpi.cost': 'Estimated cost',
      'kpi.costSub': 'estimated at official DeepSeek peak/off-peak rates',
      'kpi.costSubCustom': 'estimated with custom rates',
      'kpi.budget': 'Budget',
      'kpi.budgetRemaining': '¥{remaining} left / ¥{amount}',
      'kpi.budgetNone': 'No budget set',
      'kpi.budgetSpent': '{pct}% used',
      'kpi.budgetOver': '{pct}% over budget',
      'kpi.today': '{tokens} tokens today',
      'kpi.todayCost': '¥{cost} today',
      'timeline.title': 'Last {days} days',
      'timeline.sub': 'input / output / cache read stacked on one scale, gold line is estimated cost',
      'timeline.legend.input': 'input',
      'timeline.legend.output': 'output',
      'timeline.legend.cache': 'cache read',
      'timeline.legend.cost': 'cost',
      'timeline.empty': 'No tokens recorded in this period yet.',
      'timeline.cacheNote': 'Cache reads usually dwarf input/output; all bars share one scale.',
      'timeline.total': 'total',
      'timeline.requests': 'requests',
      'timeline.cost': 'cost',
      'cpu.title': 'CPU monitor',
      'cpu.usage': 'current usage',
      'cpu.cores': 'per-core usage ({n} cores)',
      'cpu.coresEmpty': 'per-core data unavailable',
      'cpu.processUptime': 'process uptime',
      'cpu.uptime': 'system uptime',
      'cpu.processCpu': 'process CPU',
      'cpu.memory': 'memory',
      'cpu.processMemory': 'process memory',
      'cpu.load': 'load 1/5/15',
      'cpu.history': 'last 40 samples',
      'cpu.empty': 'CPU data unavailable',
      'cpu.na': '—',
      'sessions.title': 'Session breakdown',
      'sessions.sub': 'sorted by time by default; click a header to sort, a row to expand',
      'sessions.col.session': 'Session',
      'sessions.col.updated': 'Updated',
      'sessions.col.tokens': 'Tokens',
      'sessions.col.cost': 'Cost',
      'sessions.col.model': 'Model',
      'sessions.col.status': 'Status',
      'sessions.live': 'in progress',
      'sessions.loaded': 'loaded',
      'sessions.archived': 'archived',
      'sessions.empty': 'No sessions recorded yet.',
      'sessions.more': '{n} sessions in total, showing first {shown}',
      'sessions.today': 'today',
      'sessions.detail.input': 'input',
      'sessions.detail.output': 'output',
      'sessions.detail.cacheRead': 'cache read',
      'sessions.detail.cacheWrite': 'cache write',
      'sessions.detail.requests': 'requests',
      'sessions.detail.turns': 'turns',
      'sessions.detail.cwd': 'working directory',
      'sessions.detail.model': 'model',
      'sessions.detail.created': 'created',
      'settings.title': 'Statistics settings',
      'settings.note': 'Costs are estimates: each message uses the official rate for its own model and timestamp (peak/off-peak); Search/Fetch fees are excluded.',
      'settings.budget': 'Budget',
      'settings.budgetAmount': 'Budget amount (0 = no budget, CNY)',
      'settings.budgetPeriod': 'Budget period',
      'settings.period.month': 'per month',
      'settings.period.total': 'cumulative',
      'settings.pricing': 'Prices (custom mode)',
      'settings.priceMode': 'Pricing mode',
      'settings.priceModeHint': 'Official DeepSeek peak/off-peak rates are used by default; custom mode covers non-DeepSeek or unknown models.',
      'settings.mode.official': 'Official DeepSeek peak/off-peak',
      'settings.mode.custom': 'Custom per-token rates',
      'settings.officialNote': 'Official rates (CNY / 1M tokens, peak/off-peak): deepseek-flash cache hit 0.04/0.02, cache miss 2/1, output 8/4; deepseek-v4-pro 0.30/0.15, 9/4.5, 27/13.5. Peak is Beijing time Mon-Fri 09:00-12:00 and 14:00-18:00; Chinese public holidays are off-peak. Cache writes are billed at the cache-miss input rate.',
      'settings.inputPerM': 'cache-miss input',
      'settings.outputPerM': 'output',
      'settings.cacheReadPerM': 'cache hit',
      'settings.cacheWritePerM': 'cache write',
      'settings.character': 'Feeding parameters',
      'settings.tokensPerBowl': 'tokens per bowl',
      'settings.timelineDays': 'timeline days',
      'settings.days7': '7 days',
      'settings.days14': '14 days',
      'settings.days30': '30 days',
      'settings.save': 'Save and reload',
      'settings.saving': 'Saving…',
      'settings.saved': 'Saved. The plugin is reloading.',
      'settings.failed': 'Save failed: ',
      'settings.loading': 'Loading settings…',
      'settings.loadFailed': 'Could not load settings: ',
      'settings.notEditable': 'This profile cannot write configuration. Edit cordis.patch.yml directly.',
      'settings.close': 'Close settings',
      'settings.reloadHint': 'The plugin reloads briefly after saving; the panel reconnects automatically.',
      'state.loading': 'Reading local session data…',
      'state.offline': 'Disconnected, retrying…',
      'state.offlineHint': 'The last snapshot is kept; it refreshes when the connection returns.',
      'state.unavailable': 'Session data is unavailable.',
      'state.unavailableHint': 'The statistics endpoint returned available=false; the rest of the panel still renders.',
      'state.unpriced': 'Some models are unpriced',
      'state.unpricedHint': '{n} requests use a model outside the official price catalog; their cost is counted as 0. Switch to custom rates in Settings to price them.',
      'common.close': 'Close',
      'common.na': '—',
    };

    const DICTS = { zh: ZH, en: EN };

    /* ============================================================
     * 纯函数工具
     * ============================================================ */

    const INT_FORMAT = (function () {
      try {
        return new Intl.NumberFormat('zh-CN');
      } catch (error) {
        return null;
      }
    })();

    function num(value, fallback) {
      const parsed = typeof value === 'number' ? value : Number(value);
      if (!isFinite(parsed)) return fallback === undefined ? 0 : fallback;
      return parsed;
    }

    function clamp(value, min, max) {
      return Math.min(max, Math.max(min, value));
    }

    function pad2(value) {
      const rounded = Math.round(value);
      return rounded < 10 ? '0' + rounded : String(rounded);
    }

    function trimDecimal(value) {
      const text = value >= 100 ? value.toFixed(0) : value.toFixed(1);
      return text.replace(/\.0$/, '');
    }

    function formatInt(value) {
      const rounded = Math.round(num(value, 0));
      if (INT_FORMAT) {
        try {
          return INT_FORMAT.format(rounded);
        } catch (error) {
          /* Fall through to plain digits. */
        }
      }
      return String(rounded);
    }

    function formatTokens(value) {
      const amount = Math.max(0, num(value, 0));
      if (amount >= 1e9) return trimDecimal(amount / 1e9) + 'B';
      if (amount >= 1e6) return trimDecimal(amount / 1e6) + 'M';
      if (amount >= 1e3) return trimDecimal(amount / 1e3) + 'K';
      return formatInt(amount);
    }

    function formatMoney(value) {
      const amount = num(value, 0);
      if (amount >= 1000) return '¥' + formatInt(amount);
      if (amount >= 10) return '¥' + amount.toFixed(1);
      return '¥' + amount.toFixed(2);
    }

    function formatShortMoney(value) {
      return '¥' + num(value, 0).toFixed(2);
    }

    function formatAmount(value) {
      const amount = num(value, 0);
      if (amount >= 1000) return formatInt(amount);
      if (amount >= 10) return amount.toFixed(1).replace(/\.0$/, '');
      return amount.toFixed(2).replace(/\.?0+$/, '') || '0';
    }

    function formatClock(timestamp) {
      const time = num(timestamp, 0);
      if (!time) return DICTS.zh['common.na'];
      const date = new Date(time);
      if (isNaN(date.getTime())) return DICTS.zh['common.na'];
      return pad2(date.getHours()) + ':' + pad2(date.getMinutes());
    }

    function formatSessionTime(timestamp, todayLabel) {
      const time = num(timestamp, 0);
      if (!time) return DICTS.zh['common.na'];
      const date = new Date(time);
      if (isNaN(date.getTime())) return DICTS.zh['common.na'];
      const now = new Date();
      const sameDay =
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate();
      const hm = pad2(date.getHours()) + ':' + pad2(date.getMinutes());
      if (sameDay) return (todayLabel || DICTS.zh['sessions.today']) + ' ' + hm;
      return pad2(date.getMonth() + 1) + '-' + pad2(date.getDate()) + ' ' + hm;
    }

    function formatUptime(seconds) {
      const total = Math.max(0, Math.round(num(seconds, 0)));
      const days = Math.floor(total / 86400);
      const hours = Math.floor((total % 86400) / 3600);
      const minutes = Math.floor((total % 3600) / 60);
      if (days > 0) return days + 'd ' + hours + 'h';
      if (total >= 60) return hours + 'h ' + minutes + 'm';
      return total + 's';
    }

    function totalTokensOf(data) {
      const totals = data && data.totals ? data.totals : {};
      const direct = num(totals.totalTokens, 0);
      if (direct > 0) return direct;
      return (
        num(totals.inputTokens, 0) +
        num(totals.outputTokens, 0) +
        num(totals.cacheReadTokens, 0) +
        num(totals.cacheWriteTokens, 0)
      );
    }

    function speedFromRate(data) {
      const rate = data && data.rate ? data.rate : {};
      const tokensPerMin = Math.max(0, num(rate.tokensPerMin, 0));
      const factor = 1 + Math.min(1.2, (tokensPerMin / 5000) * 1.2);
      return Math.round(clamp(factor, 1, 2.2) * 10) / 10;
    }

    function bubbleText(t, options) {
      if (options.loading) return t('hero.bubble.loading');
      if (options.offline) return t('hero.bubble.offline');
      if (options.feast) return t('hero.bubble.feast');
      if (options.eating) {
        const index = options.seed % 3;
        if (index === 2) return t('hero.bubble.grow.2', null, { n: formatInt(options.bowlNo) });
        return index === 0 ? t('hero.bubble.grow.0') : t('hero.bubble.grow.1');
      }
      return t('hero.bubble.idle.' + (options.seed % 3));
    }

    function describeError(error) {
      if (!error) return DICTS.zh['state.offline'];
      const status = error.status;
      if (status === 404) return 'HTTP 404 · /api/whale-girl-stats not ready';
      if (status) return 'HTTP ' + status;
      if (error.name === 'AbortError') return 'timeout';
      return String(error.message || error);
    }

    function formFromConfig(config) {
      const cfg = config || {};
      const budget = cfg.budget || {};
      const pricing = cfg.pricing || {};
      return {
        budgetAmount: String(num(budget.amount, 0)),
        budgetPeriod: budget.period === 'total' ? 'total' : 'month',
        pricingMode: pricing.mode === 'custom' ? 'custom' : 'official',
        inputPerM: String(num(pricing.inputPerM, 2)),
        outputPerM: String(num(pricing.outputPerM, 8)),
        cacheReadPerM: String(num(pricing.cacheReadPerM, 0.04)),
        cacheWritePerM: String(num(pricing.cacheWritePerM, 2)),
        tokensPerBowl: String(num(cfg.tokensPerBowl, 8000)),
        timelineDays: String(num(cfg.timelineDays, 14)),
      };
    }

    function patchFromForm(form) {
      const source = form || {};
      const days = num(source.timelineDays, 14);
      return {
        budget: {
          amount: Math.max(0, num(source.budgetAmount, 0)),
          period: source.budgetPeriod === 'total' ? 'total' : 'month',
        },
        pricing: {
          mode: source.pricingMode === 'custom' ? 'custom' : 'official',
          inputPerM: Math.max(0, num(source.inputPerM, 2)),
          outputPerM: Math.max(0, num(source.outputPerM, 8)),
          cacheReadPerM: Math.max(0, num(source.cacheReadPerM, 0.04)),
          cacheWritePerM: Math.max(0, num(source.cacheWritePerM, 2)),
        },
        tokensPerBowl: Math.max(1, Math.round(num(source.tokensPerBowl, 8000))),
        timelineDays: [7, 14, 30].indexOf(days) >= 0 ? days : 14,
      };
    }

    function coreColor(percent) {
      if (percent > 85) return '#ff8296';
      if (percent > 60) return '#e9c27a';
      return '#6fc3ff';
    }

    const RICE_PARTICLES = [
      { left: '42%', delay: 0, duration: 0.92, drift: '-7px' },
      { left: '47%', delay: 0.18, duration: 0.84, drift: '4px' },
      { left: '52%', delay: 0.36, duration: 0.98, drift: '-3px' },
      { left: '57%', delay: 0.1, duration: 0.88, drift: '6px' },
      { left: '39%', delay: 0.52, duration: 1.04, drift: '8px' },
      { left: '50%', delay: 0.64, duration: 0.8, drift: '-5px' },
      { left: '44%', delay: 0.78, duration: 0.9, drift: '3px' },
      { left: '60%', delay: 0.44, duration: 0.94, drift: '-8px' },
      { left: '48%', delay: 0.88, duration: 1.08, drift: '5px' },
      { left: '54%', delay: 0.28, duration: 0.86, drift: '-4px' },
      { left: '36%', delay: 0.7, duration: 0.96, drift: '7px' },
      { left: '63%', duration: 1, delay: 0.58, drift: '4px' },
    ];

    /* ============================================================
     * 面板开关：footer 按钮与 overlay 面板之间的模块内共享状态
     * ============================================================ */

    const panelState = { open: false, listeners: new Set() };

    function setPanelOpen(next) {
      const value = Boolean(next);
      if (panelState.open === value) return;
      panelState.open = value;
      for (const listener of Array.from(panelState.listeners)) {
        try {
          listener(value);
        } catch (error) {
          console.warn('[whale-girl-stats] panel listener failed:', error);
        }
      }
    }

    function usePanelOpen() {
      const [open, setOpen] = useState(panelState.open);
      useEffect(() => {
        panelState.listeners.add(setOpen);
        setOpen(panelState.open);
        return () => {
          panelState.listeners.delete(setOpen);
        };
      }, []);
      return open;
    }

    /* ============================================================
     * locale / t
     * ============================================================ */

    function makeTranslator(provided) {
      return function t(key, fallback, vars) {
        let value = '';
        if (provided) {
          try {
            const got = provided(key);
            if (typeof got === 'string' && got && got !== key) value = got;
          } catch (error) {
            value = '';
          }
        }
        if (!value) value = ZH[key] || EN[key] || (typeof fallback === 'string' ? fallback : key);
        if (vars && typeof value === 'string') {
          for (const name in vars) {
            if (Object.prototype.hasOwnProperty.call(vars, name)) {
              value = value.split('{' + name + '}').join(String(vars[name]));
            }
          }
        }
        return value;
      };
    }

    function useTranslator(props) {
      const provided = props && typeof props.t === 'function' ? props.t : null;
      return useMemo(() => makeTranslator(provided), [provided]);
    }

    /* ============================================================
     * 本插件 API 访问（只读 + 设置）
     * ============================================================ */

    async function fetchJson(path, options) {
      const request = options || {};
      const headers = {};
      const given = request.headers || {};
      for (const name in given) {
        if (Object.prototype.hasOwnProperty.call(given, name)) headers[name] = given[name];
      }
      if (request.body !== undefined) headers['content-type'] = 'application/json';
      if (typeof fetch !== 'function') throw new Error('fetch 不可用');
      let controller = null;
      let timer = 0;
      try {
        if (typeof AbortController === 'function') {
          controller = new AbortController();
          timer = window.setTimeout(() => {
            try {
              controller.abort();
            } catch (error) {
              /* Abort is best effort. */
            }
          }, 9000);
        }
        const response = await fetch(API + path, {
          method: request.method || 'GET',
          headers: headers,
          body: request.body,
          cache: 'no-store',
          signal: controller ? controller.signal : undefined,
        });
        let data = {};
        try {
          data = await response.json();
        } catch (error) {
          data = {};
        }
        if (!response.ok) {
          const failure = new Error(
            (data && (data.message || data.error)) || 'HTTP ' + response.status,
          );
          failure.status = response.status;
          failure.data = data;
          throw failure;
        }
        if (data && data.ok === false) {
          const failure = new Error(data.message || data.error || '接口返回 ok=false');
          failure.status = response.status;
          failure.data = data;
          throw failure;
        }
        return data;
      } finally {
        if (timer) window.clearTimeout(timer);
      }
    }

    const CSS = `
      .wgs-root,
      .wgs-root *,
      .wgs-footer-btn,
      .wgs-footer-btn * { box-sizing: border-box; }

      .wgs-footer-btn {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        height: 30px;
        padding: 0 9px;
        border: 1px solid transparent;
        border-radius: 9px;
        background: transparent;
        color: inherit;
        font: inherit;
        font-size: 13px;
        line-height: 1;
        cursor: pointer;
        white-space: nowrap;
        transition: background 160ms ease, border-color 160ms ease, transform 160ms ease;
      }
      .wgs-footer-btn:hover {
        background: color-mix(in srgb, currentColor 10%, transparent);
        border-color: color-mix(in srgb, currentColor 16%, transparent);
      }
      .wgs-footer-btn:active { transform: scale(0.97); }
      .wgs-footer-btn:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
      .wgs-footer-btn[data-open="true"] {
        background: color-mix(in srgb, currentColor 14%, transparent);
        border-color: color-mix(in srgb, currentColor 22%, transparent);
      }
      .wgs-footer-icon { display: inline-flex; width: 17px; height: 17px; flex: none; }
      .wgs-footer-text { overflow: hidden; text-overflow: ellipsis; }

      /* ---------- always-visible draggable status window ---------- */
      .wgs-launcher {
        position: fixed;
        left: 14px;
        bottom: 88px;
        z-index: 900;
        display: flex;
        flex-direction: column;
        gap: 7px;
        width: 214px;
        padding: 10px 12px 11px;
        border-radius: 14px;
        border: 1px solid rgba(233, 194, 122, 0.42);
        background:
          radial-gradient(180px 90px at 8% 0%, rgba(79, 158, 232, 0.26), transparent 70%),
          linear-gradient(155deg, rgba(15, 33, 60, 0.96), rgba(6, 15, 30, 0.97));
        color: #e9f4ff;
        font: inherit;
        line-height: 1;
        box-shadow: 0 14px 32px rgba(3, 10, 22, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(9px) saturate(1.08);
        cursor: grab;
        pointer-events: auto;
        touch-action: none;
        user-select: none;
        transition: border-color 160ms ease, box-shadow 160ms ease;
      }
      .wgs-launcher:hover {
        border-color: rgba(233, 194, 122, 0.78);
        box-shadow: 0 18px 36px rgba(3, 10, 22, 0.58), inset 0 1px 0 rgba(255, 255, 255, 0.1);
      }
      .wgs-launcher[data-dragging="true"] {
        cursor: grabbing;
        border-color: rgba(143, 208, 255, 0.8);
        box-shadow: 0 22px 44px rgba(3, 10, 22, 0.65), 0 0 0 1px rgba(143, 208, 255, 0.25);
      }
      .wgs-launcher:focus-visible { outline: 2px solid #8fd0ff; outline-offset: 3px; }
      .wgs-launcher-top {
        display: flex;
        align-items: center;
        gap: 7px;
        min-width: 0;
      }
      .wgs-launcher-icon { display: inline-flex; width: 19px; height: 19px; color: #ffd99a; flex: none; }
      .wgs-launcher-title {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.02em;
        color: #eef8ff;
      }
      .wgs-launcher-grip {
        margin-left: auto;
        font-size: 13px;
        line-height: 0.7;
        letter-spacing: -1px;
        color: rgba(233, 194, 122, 0.62);
        flex: none;
      }
      .wgs-launcher-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #7ff0c8;
        box-shadow: 0 0 8px #7ff0c8;
        animation: wgs-launch-pulse 2.2s ease-in-out infinite;
        flex: none;
      }
      .wgs-launcher-metrics {
        display: flex;
        align-items: stretch;
        gap: 0;
        padding-top: 7px;
        border-top: 1px solid rgba(143, 208, 255, 0.14);
      }
      .wgs-launcher-metric {
        display: flex;
        flex-direction: column;
        gap: 3px;
        flex: 1 1 0;
        min-width: 0;
      }
      .wgs-launcher-metric + .wgs-launcher-metric {
        margin-left: 10px;
        padding-left: 10px;
        border-left: 1px solid rgba(143, 208, 255, 0.14);
      }
      .wgs-launcher-label {
        font-size: 9.5px;
        line-height: 1;
        color: #87a6ca;
        letter-spacing: 0.05em;
        white-space: nowrap;
      }
      .wgs-launcher-value {
        font-size: 17px;
        font-weight: 700;
        line-height: 1.05;
        letter-spacing: 0.01em;
        font-variant-numeric: tabular-nums;
        color: #f4fbff;
        white-space: nowrap;
      }
      .wgs-launcher-value--cost { color: #ffd99a; }
      @keyframes wgs-launch-pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
      @media (max-width: 720px) {
        .wgs-launcher {
          left: 10px;
          bottom: 82px;
          width: 186px;
          padding: 9px 10px 10px;
        }
        .wgs-launcher-value { font-size: 15px; }
        .wgs-launcher-title { font-size: 11.5px; }
      }
      @media (prefers-reduced-motion: reduce) {
        .wgs-launcher-dot { animation: none; }
      }

      /* ---------- overlay ---------- */
      .wgs-root {
        position: fixed;
        inset: 0;
        z-index: 140;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        color: #e9f2ff;
        font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", "PingFang SC", sans-serif;
        background:
          radial-gradient(900px 620px at 50% -12%, rgba(79, 158, 232, 0.30), transparent 62%),
          radial-gradient(700px 520px at 102% 104%, rgba(233, 194, 122, 0.12), transparent 62%),
          rgba(3, 8, 18, 0.78);
        backdrop-filter: blur(7px) saturate(1.1);
        -webkit-backdrop-filter: blur(7px) saturate(1.1);
        animation: wgs-fade 200ms ease-out both;
      }
      .wgs-shell {
        position: relative;
        width: min(1120px, 100%);
        max-height: 86vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border-radius: 22px;
        border: 1px solid rgba(233, 194, 122, 0.42);
        background: linear-gradient(180deg, #12233f 0%, #0b1830 56%, #081326 100%);
        box-shadow:
          0 30px 90px rgba(0, 0, 0, 0.62),
          inset 0 0 0 1px rgba(143, 208, 255, 0.06),
          0 0 64px rgba(79, 158, 232, 0.18);
        animation: wgs-panel-in 260ms cubic-bezier(0.2, 0.9, 0.2, 1) both;
        font-variant-numeric: tabular-nums;
      }
      .wgs-shell::before {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;
        background:
          radial-gradient(1100px 260px at 10% -10%, rgba(79, 158, 232, 0.22), transparent 72%),
          repeating-linear-gradient(115deg, rgba(143, 208, 255, 0.045) 0 2px, transparent 2px 48px),
          repeating-linear-gradient(65deg, rgba(143, 208, 255, 0.028) 0 2px, transparent 2px 76px);
      }
      .wgs-shell::after {
        content: "";
        position: absolute;
        left: -12%;
        right: -12%;
        bottom: -46%;
        height: 78%;
        pointer-events: none;
        background: radial-gradient(closest-side, rgba(79, 158, 232, 0.18), transparent 72%);
        filter: blur(12px);
      }
      .wgs-head,
      .wgs-body { position: relative; z-index: 1; }

      .wgs-head {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 13px 16px 12px 18px;
        border-bottom: 1px solid rgba(233, 194, 122, 0.26);
        background: linear-gradient(180deg, rgba(21, 40, 70, 0.92), rgba(11, 24, 48, 0.72));
        flex: none;
      }
      .wgs-head-avatar {
        position: relative;
        width: 42px;
        height: 42px;
        flex: none;
        border-radius: 50%;
        overflow: hidden;
        border: 1px solid rgba(233, 194, 122, 0.55);
        background: radial-gradient(circle at 50% 30%, #1d3a63, #081326);
        box-shadow: 0 0 0 3px rgba(79, 158, 232, 0.12);
      }
      .wgs-head-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .wgs-avatar-fallback {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #8fd0ff;
        font-size: 17px;
        font-weight: 800;
        letter-spacing: 0.04em;
      }
      .wgs-head-text { min-width: 0; flex: 1; }
      .wgs-head-title {
        margin: 0;
        font-size: 15.5px;
        font-weight: 800;
        letter-spacing: 0.015em;
        color: #f3f8ff;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .wgs-head-sub {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-top: 3px;
        font-size: 11px;
        color: #9db4d4;
        min-width: 0;
      }
      .wgs-head-sub span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .wgs-dot {
        width: 7px;
        height: 7px;
        flex: none;
        border-radius: 50%;
        background: #6d84a8;
        box-shadow: 0 0 0 2px rgba(143, 208, 255, 0.12);
        transition: background 240ms ease, box-shadow 240ms ease;
      }
      .wgs-dot[data-state="online"] {
        background: #74e0c0;
        box-shadow: 0 0 9px rgba(116, 224, 192, 0.9);
        animation: wgs-pulse 2.4s ease-in-out infinite;
      }
      .wgs-dot[data-state="offline"] { background: #ff8296; box-shadow: 0 0 8px rgba(255, 130, 150, 0.7); }
      .wgs-dot[data-state="loading"] { background: #e9c27a; box-shadow: 0 0 8px rgba(233, 194, 122, 0.7); }
      .wgs-head-sep { color: rgba(157, 180, 212, 0.45); }
      .wgs-head-actions { display: flex; align-items: center; gap: 5px; flex: none; }
      .wgs-icon-btn {
        width: 31px;
        height: 31px;
        padding: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        border: 1px solid rgba(143, 208, 255, 0.22);
        background: rgba(143, 208, 255, 0.07);
        color: #cfe6ff;
        cursor: pointer;
        transition: background 160ms ease, transform 160ms ease, border-color 160ms ease;
      }
      .wgs-icon-btn:hover { background: rgba(143, 208, 255, 0.18); border-color: rgba(143, 208, 255, 0.42); }
      .wgs-icon-btn:active { transform: scale(0.94); }
      .wgs-icon-btn:focus-visible { outline: 2px solid #8fd0ff; outline-offset: 2px; }
      .wgs-icon-btn[data-spin="true"] svg { animation: wgs-spin 900ms linear infinite; }
      .wgs-icon-btn--gold { border-color: rgba(233, 194, 122, 0.4); color: #f4dfb0; background: rgba(233, 194, 122, 0.1); }
      .wgs-icon-btn--gold:hover { background: rgba(233, 194, 122, 0.2); border-color: rgba(233, 194, 122, 0.62); }

      .wgs-body {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        overscroll-behavior: contain;
        padding: 14px 16px 18px;
        display: flex;
        flex-direction: column;
        gap: 13px;
        scrollbar-width: thin;
        scrollbar-color: rgba(143, 208, 255, 0.4) transparent;
      }
      .wgs-body::-webkit-scrollbar { width: 8px; }
      .wgs-body::-webkit-scrollbar-thumb { background: rgba(143, 208, 255, 0.32); border-radius: 99px; }
      .wgs-body::-webkit-scrollbar-track { background: transparent; }
      /* Scrollport children keep their intrinsic height: the hero card uses
         overflow:hidden, so without this it is the one flex item that shrinks
         to a few pixels when the panel height is constrained. */
      .wgs-body > * { flex: 0 0 auto; }

      .wgs-banner {
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding: 9px 12px;
        border-radius: 12px;
        border: 1px solid rgba(255, 130, 150, 0.36);
        background: rgba(255, 130, 150, 0.08);
        font-size: 11.5px;
        line-height: 1.5;
      }
      .wgs-banner[data-kind="info"] {
        border-color: rgba(143, 208, 255, 0.3);
        background: rgba(79, 158, 232, 0.1);
      }
      .wgs-banner-title { color: #ffb3c1; font-weight: 700; display: flex; align-items: center; gap: 6px; }
      .wgs-banner[data-kind="info"] .wgs-banner-title { color: #9fd4ff; }
      .wgs-banner-sub { color: #9db4d4; font-size: 10.5px; }

      /* ---------- shared card ---------- */
      .wgs-card {
        position: relative;
        border-radius: 16px;
        border: 1px solid rgba(143, 208, 255, 0.16);
        background: linear-gradient(160deg, rgba(27, 50, 86, 0.86), rgba(10, 23, 46, 0.9));
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.045);
      }
      .wgs-section-head {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 10px;
        padding: 13px 15px 9px;
        flex-wrap: wrap;
      }
      .wgs-section-title {
        margin: 0;
        font-size: 13.5px;
        font-weight: 800;
        letter-spacing: 0.02em;
        color: #eaf4ff;
        display: flex;
        align-items: center;
        gap: 7px;
      }
      .wgs-section-title::before {
        content: "";
        width: 4px;
        height: 14px;
        border-radius: 2px;
        background: linear-gradient(180deg, #8fd0ff, #4f9ee8);
        box-shadow: 0 0 8px rgba(143, 208, 255, 0.55);
      }
      .wgs-section-sub { font-size: 10.5px; line-height: 1.5; color: #8fa7c8; }
      .wgs-empty {
        margin: 0 15px 14px;
        padding: 18px 12px;
        border-radius: 12px;
        border: 1px dashed rgba(143, 208, 255, 0.22);
        color: #8fa7c8;
        font-size: 11.5px;
        text-align: center;
        line-height: 1.6;
      }

      /* ---------- hero ---------- */
      .wgs-hero {
        display: grid;
        grid-template-columns: minmax(250px, 340px) minmax(0, 1fr);
        gap: 8px;
        align-items: center;
        padding: 6px 14px 10px 6px;
        overflow: hidden;
        background:
          radial-gradient(520px 300px at 16% 12%, rgba(79, 158, 232, 0.26), transparent 68%),
          radial-gradient(420px 260px at 88% 108%, rgba(255, 183, 207, 0.12), transparent 70%),
          linear-gradient(155deg, rgba(24, 48, 84, 0.94), rgba(9, 21, 42, 0.96));
      }
      .wgs-hero[data-eating="true"] {
        background:
          radial-gradient(560px 320px at 16% 12%, rgba(79, 158, 232, 0.34), transparent 66%),
          radial-gradient(460px 280px at 88% 108%, rgba(233, 194, 122, 0.18), transparent 70%),
          linear-gradient(155deg, rgba(26, 52, 92, 0.96), rgba(10, 23, 45, 0.97));
      }
      .wgs-hero-stage {
        position: relative;
        height: 380px;
        min-width: 0;
        overflow: visible;
      }
      .wgs-aura {
        position: absolute;
        left: 50%;
        bottom: 12px;
        width: 270px;
        height: 270px;
        margin-left: -135px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(143, 208, 255, 0.3) 0%, rgba(79, 158, 232, 0.12) 46%, transparent 72%);
        filter: blur(2px);
        animation: wgs-aura 5.2s ease-in-out infinite;
      }
      .wgs-hero[data-eating="true"] .wgs-aura {
        background: radial-gradient(circle, rgba(255, 224, 160, 0.3) 0%, rgba(143, 208, 255, 0.16) 48%, transparent 72%);
        animation-duration: calc(3.2s * var(--wgs-inv, 1));
      }
      .wgs-mascot {
        position: absolute;
        left: 50%;
        bottom: 14px;
        width: 190px;
        height: 326px;
        margin-left: -95px;
        transform-origin: 50% 100%;
        animation: wgs-float 6s ease-in-out infinite;
        filter: drop-shadow(0 18px 26px rgba(0, 0, 0, 0.42));
      }
      .wgs-hero[data-eating="true"] .wgs-mascot {
        animation: wgs-chew calc(640ms * var(--wgs-inv, 1)) ease-in-out infinite;
      }
      .wgs-pose {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: auto;
        display: block;
        transition: opacity 420ms ease, filter 420ms ease;
        user-select: none;
        -webkit-user-drag: none;
      }
      .wgs-pose--idle { opacity: 1; }
      .wgs-pose--eat { opacity: 0; }
      .wgs-hero[data-eating="true"] .wgs-pose--idle { opacity: 0; }
      .wgs-hero[data-eating="true"] .wgs-pose--eat { opacity: 1; }
      .wgs-mascot-shadow {
        position: absolute;
        left: 50%;
        bottom: 2px;
        width: 150px;
        height: 18px;
        margin-left: -75px;
        border-radius: 50%;
        background: radial-gradient(ellipse, rgba(0, 0, 0, 0.5), transparent 70%);
        filter: blur(3px);
      }
      .wgs-mascot-fallback {
        position: absolute;
        left: 50%;
        bottom: 26px;
        width: 150px;
        height: 190px;
        margin-left: -75px;
        border-radius: 50% 50% 46% 46%;
        background: radial-gradient(circle at 42% 22%, #f7f3ff 0%, #dbe9ff 34%, #9bbde8 66%, #4f7fbf 100%);
        border: 2px solid rgba(143, 208, 255, 0.5);
        box-shadow: 0 16px 30px rgba(0, 0, 0, 0.4);
      }
      .wgs-mascot-fallback::before {
        content: "";
        position: absolute;
        left: 26px;
        top: 74px;
        width: 20px;
        height: 26px;
        border-radius: 50%;
        background: #17335c;
        box-shadow: 52px 0 0 #17335c;
      }
      .wgs-mascot-fallback::after {
        content: "";
        position: absolute;
        left: 50%;
        top: 112px;
        width: 26px;
        height: 12px;
        margin-left: -13px;
        border-radius: 0 0 14px 14px;
        border-bottom: 3px solid #17335c;
      }
      .wgs-bowl {
        position: absolute;
        left: 50%;
        top: 16px;
        width: 152px;
        margin-left: -76px;
        z-index: 4;
        transform: rotate(-4deg);
        transform-origin: 50% 84%;
        transition: transform 640ms cubic-bezier(0.22, 0.9, 0.24, 1), filter 400ms ease;
        filter: drop-shadow(0 9px 15px rgba(0, 0, 0, 0.45));
      }
      .wgs-bowl svg { width: 100%; height: auto; display: block; }
      .wgs-hero[data-eating="true"] .wgs-bowl {
        transform: translateY(-22px) rotate(-24deg) scale(1.03);
        filter: drop-shadow(0 14px 20px rgba(0, 0, 0, 0.5)) drop-shadow(0 0 14px rgba(233, 194, 122, 0.32));
      }
      .wgs-rice-field {
        position: absolute;
        left: 50%;
        top: 74px;
        width: 190px;
        height: 190px;
        margin-left: -95px;
        pointer-events: none;
        z-index: 5;
      }
      .wgs-rice {
        position: absolute;
        top: 0;
        width: 7px;
        height: 4px;
        border-radius: 2px;
        background: linear-gradient(180deg, #fffdf5, #f0e3c4);
        box-shadow: 0 0 5px rgba(255, 255, 255, 0.75);
        opacity: 0;
        animation-name: wgs-rice-fall;
        animation-timing-function: linear;
        animation-iteration-count: infinite;
        animation-play-state: paused;
      }
      .wgs-hero[data-eating="true"] .wgs-rice { animation-play-state: running; }
      .wgs-steam {
        position: absolute;
        left: 50%;
        top: 92px;
        width: 130px;
        height: 110px;
        margin-left: -65px;
        pointer-events: none;
        z-index: 6;
        opacity: 0;
        transition: opacity 420ms ease;
      }
      .wgs-hero[data-eating="true"] .wgs-steam { opacity: 0.92; }
      .wgs-steam i {
        position: absolute;
        bottom: 0;
        width: 18px;
        height: 38px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255, 255, 255, 0.72), rgba(255, 255, 255, 0) 70%);
        filter: blur(3px);
        animation: wgs-steam-rise calc(1.7s * var(--wgs-inv, 1)) ease-out infinite;
      }
      .wgs-steam i:nth-child(1) { left: 12%; animation-delay: 0s; }
      .wgs-steam i:nth-child(2) { left: 46%; animation-delay: 0.45s; width: 22px; height: 44px; }
      .wgs-steam i:nth-child(3) { left: 76%; animation-delay: 0.9s; width: 15px; }
      .wgs-sparkles {
        position: absolute;
        left: 50%;
        top: 34px;
        width: 258px;
        height: 280px;
        margin-left: -129px;
        pointer-events: none;
        z-index: 6;
        opacity: 0;
        transition: opacity 380ms ease;
      }
      .wgs-hero[data-eating="true"] .wgs-sparkles { opacity: 1; }
      .wgs-sparkles span {
        position: absolute;
        width: 9px;
        height: 9px;
        background: #ffe8a3;
        clip-path: polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%);
        animation: wgs-twinkle calc(1.5s * var(--wgs-inv, 1)) ease-in-out infinite;
        filter: drop-shadow(0 0 5px rgba(255, 232, 163, 0.8));
      }
      .wgs-sparkles span:nth-child(1) { left: 8%; top: 26%; animation-delay: 0s; }
      .wgs-sparkles span:nth-child(2) { right: 4%; top: 14%; animation-delay: 0.25s; width: 11px; height: 11px; }
      .wgs-sparkles span:nth-child(3) { right: 12%; top: 54%; animation-delay: 0.5s; width: 7px; height: 7px; }
      .wgs-sparkles span:nth-child(4) { left: 6%; top: 58%; animation-delay: 0.75s; }
      .wgs-sparkles span:nth-child(5) { left: 44%; top: 6%; animation-delay: 1s; width: 6px; height: 6px; }
      .wgs-sparkles span:nth-child(6) { right: 28%; top: 78%; animation-delay: 1.2s; width: 8px; height: 8px; }
      .wgs-hearts {
        position: absolute;
        left: 50%;
        top: 96px;
        width: 150px;
        height: 170px;
        margin-left: -75px;
        pointer-events: none;
        z-index: 6;
        opacity: 0;
        transition: opacity 380ms ease;
      }
      .wgs-hero[data-eating="true"] .wgs-hearts { opacity: 1; }
      .wgs-hearts span {
        position: absolute;
        bottom: 0;
        font-size: 15px;
        color: #ffb7cf;
        text-shadow: 0 0 8px rgba(255, 183, 207, 0.7);
        animation: wgs-heart-up calc(1.9s * var(--wgs-inv, 1)) ease-out infinite;
        opacity: 0;
      }
      .wgs-hearts span:nth-child(1) { left: 12%; animation-delay: 0s; }
      .wgs-hearts span:nth-child(2) { left: 38%; animation-delay: 0.35s; font-size: 12px; }
      .wgs-hearts span:nth-child(3) { left: 64%; animation-delay: 0.7s; }
      .wgs-hearts span:nth-child(4) { left: 84%; animation-delay: 1.05s; font-size: 11px; }
      .wgs-hearts span:nth-child(5) { left: 24%; animation-delay: 1.35s; font-size: 13px; }
      .wgs-bubble {
        position: absolute;
        left: 0;
        top: 2px;
        max-width: 186px;
        padding: 9px 12px;
        border-radius: 14px;
        background: rgba(245, 239, 226, 0.97);
        color: #1e304f;
        font-size: 12px;
        font-weight: 600;
        line-height: 1.5;
        z-index: 8;
        box-shadow: 0 10px 24px rgba(0, 0, 0, 0.38);
        animation: wgs-bubble-in 260ms ease-out both;
      }
      .wgs-bubble::after {
        content: "";
        position: absolute;
        left: 26px;
        bottom: -6px;
        width: 12px;
        height: 12px;
        background: rgba(245, 239, 226, 0.97);
        transform: rotate(45deg);
        border-radius: 2px;
      }
      .wgs-state-chip {
        position: absolute;
        left: 4px;
        bottom: 8px;
        z-index: 8;
        padding: 3px 10px;
        border-radius: 999px;
        border: 1px solid rgba(143, 208, 255, 0.34);
        background: rgba(9, 22, 44, 0.8);
        color: #cfe6ff;
        font-size: 10.5px;
        letter-spacing: 0.05em;
        white-space: nowrap;
      }
      .wgs-state-chip[data-eating="true"] {
        border-color: rgba(233, 194, 122, 0.55);
        color: #ffe6b3;
        background: rgba(56, 41, 18, 0.72);
      }
      .wgs-hero-stats {
        min-width: 0;
        padding: 8px 4px 8px 0;
        display: flex;
        flex-direction: column;
        gap: 9px;
      }
      .wgs-bowl-line { display: flex; align-items: baseline; gap: 7px; flex-wrap: wrap; }
      .wgs-bowl-prefix { font-size: 15px; font-weight: 700; color: #9db4d4; }
      .wgs-bowl-number {
        font-size: 44px;
        font-weight: 800;
        line-height: 1;
        letter-spacing: -0.02em;
        background: linear-gradient(180deg, #fff4d6 6%, #e9c27a 54%, #c99a45 100%);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        filter: drop-shadow(0 3px 10px rgba(233, 194, 122, 0.28));
        animation: wgs-pop 460ms cubic-bezier(0.2, 0.9, 0.2, 1) both;
      }
      .wgs-bowl-unit { font-size: 15px; font-weight: 700; color: #c9b68a; }
      .wgs-bowl-caption { font-size: 11px; color: #8fa7c8; letter-spacing: 0.03em; }
      .wgs-meter-row { display: flex; flex-direction: column; gap: 4px; }
      .wgs-meter-label { font-size: 10.5px; color: #9db4d4; display: flex; justify-content: space-between; gap: 8px; }
      .wgs-meter {
        height: 8px;
        border-radius: 99px;
        background: rgba(143, 208, 255, 0.15);
        overflow: hidden;
        box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.35);
      }
      .wgs-meter i {
        display: block;
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(90deg, #4f9ee8, #8fd0ff 70%, #d7efff);
        box-shadow: 0 0 10px rgba(143, 208, 255, 0.55);
        transition: width 620ms cubic-bezier(0.2, 0.8, 0.2, 1);
        min-width: 2px;
      }
      .wgs-meter--pink i { background: linear-gradient(90deg, #ff9fc4, #ffb7cf 60%, #ffd9e6); box-shadow: 0 0 10px rgba(255, 183, 207, 0.55); }
      .wgs-happy { display: flex; flex-direction: column; gap: 5px; }
      .wgs-happy-line { font-size: 10.5px; color: #9db4d4; letter-spacing: 0.01em; }
      .wgs-chips { display: flex; flex-wrap: wrap; gap: 6px; }
      .wgs-chip {
        padding: 4px 9px;
        border-radius: 999px;
        border: 1px solid rgba(143, 208, 255, 0.22);
        background: rgba(79, 158, 232, 0.12);
        color: #bcdcff;
        font-size: 10.5px;
        white-space: nowrap;
      }
      .wgs-chip--gold {
        border-color: rgba(233, 194, 122, 0.4);
        background: rgba(233, 194, 122, 0.1);
        color: #f4dfb0;
      }
      .wgs-hero-note { font-size: 10px; color: #7c93b4; line-height: 1.5; }
      .wgs-hero[data-intensity="high"] .wgs-aura {
        background: radial-gradient(circle, rgba(255, 224, 160, 0.42) 0%, rgba(143, 208, 255, 0.2) 48%, transparent 72%);
      }
      .wgs-hero[data-intensity="high"] .wgs-sparkles { opacity: 1; }
      .wgs-hero[data-intensity="high"] .wgs-hearts span { font-size: 18px; }

      /* ---------- KPI ---------- */
      .wgs-kpis {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 10px;
      }
      .wgs-kpi {
        position: relative;
        min-width: 0;
        padding: 12px 13px 11px;
        border-radius: 15px;
        border: 1px solid rgba(143, 208, 255, 0.16);
        background: linear-gradient(160deg, rgba(28, 52, 88, 0.92), rgba(11, 24, 48, 0.94));
        overflow: hidden;
      }
      .wgs-kpi::after {
        content: "";
        position: absolute;
        right: -30px;
        top: -34px;
        width: 96px;
        height: 96px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(143, 208, 255, 0.16), transparent 70%);
        pointer-events: none;
      }
      .wgs-kpi[data-accent="gold"]::after { background: radial-gradient(circle, rgba(233, 194, 122, 0.18), transparent 70%); }
      .wgs-kpi-head { display: flex; align-items: center; gap: 7px; margin-bottom: 7px; }
      .wgs-kpi-icon {
        width: 24px;
        height: 24px;
        flex: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        background: rgba(143, 208, 255, 0.12);
        color: #8fd0ff;
      }
      .wgs-kpi[data-accent="gold"] .wgs-kpi-icon { background: rgba(233, 194, 122, 0.14); color: #e9c27a; }
      .wgs-kpi-label { font-size: 10.5px; color: #9db4d4; letter-spacing: 0.04em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .wgs-kpi-value {
        font-size: 25px;
        font-weight: 800;
        line-height: 1.15;
        color: #f3f8ff;
        letter-spacing: -0.01em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .wgs-kpi-value--money { color: #ffe6b3; }
      .wgs-kpi-value[data-over="true"] { color: #ff9bab; }
      .wgs-kpi-sub {
        margin-top: 4px;
        font-size: 10px;
        line-height: 1.45;
        color: #8fa7c8;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .wgs-kpi-bar {
        margin-top: 7px;
        height: 6px;
        border-radius: 99px;
        background: rgba(143, 208, 255, 0.14);
        overflow: hidden;
      }
      .wgs-kpi-bar i {
        display: block;
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(90deg, #4f9ee8, #8fd0ff);
        transition: width 620ms ease;
        min-width: 2px;
      }
      .wgs-kpi-bar i[data-over="true"] { background: linear-gradient(90deg, #ff8296, #ffb3c1); }

      /* ---------- timeline ---------- */
      .wgs-legend { display: flex; flex-wrap: wrap; gap: 9px; align-items: center; }
      .wgs-legend span { display: inline-flex; align-items: center; gap: 5px; font-size: 10.5px; color: #9db4d4; white-space: nowrap; }
      .wgs-legend i { width: 9px; height: 9px; border-radius: 3px; flex: none; }
      .wgs-legend i[data-kind="input"] { background: #2f5f9e; box-shadow: 0 0 6px rgba(47, 95, 158, 0.7); }
      .wgs-legend i[data-kind="output"] { background: #5aa9f0; box-shadow: 0 0 6px rgba(90, 169, 240, 0.7); }
      .wgs-legend i[data-kind="cache"] { background: rgba(127, 231, 214, 0.6); border: 1px solid rgba(127, 231, 214, 0.85); }
      .wgs-legend i[data-kind="cost"] { background: #e9c27a; border-radius: 50%; box-shadow: 0 0 6px rgba(233, 194, 122, 0.8); }
      .wgs-chart-wrap { position: relative; padding: 2px 10px 10px; }
      .wgs-chart { display: block; width: 100%; height: auto; overflow: visible; }
      .wgs-chart .wgs-grid { stroke: rgba(143, 208, 255, 0.12); stroke-width: 1; }
      .wgs-chart .wgs-axis { fill: #7c93b4; font-size: 10px; font-family: inherit; }
      .wgs-chart .wgs-axis--cost { fill: #c9a95e; }
      .wgs-chart .wgs-bar-input { fill: #2f5f9e; }
      .wgs-chart .wgs-bar-output { fill: #5aa9f0; }
      .wgs-chart .wgs-bar-cache { fill: rgba(127, 231, 214, 0.45); }
      .wgs-chart .wgs-cost-line { fill: none; stroke: #e9c27a; stroke-width: 2; stroke-linejoin: round; stroke-linecap: round; filter: drop-shadow(0 0 4px rgba(233, 194, 122, 0.5)); }
      .wgs-chart .wgs-cost-dot { fill: #ffe6b3; stroke: #b98e3f; stroke-width: 1; }
      .wgs-chart .wgs-hover { fill: transparent; cursor: pointer; }
      .wgs-chart .wgs-hover:hover, .wgs-chart .wgs-hover[data-active="true"] { fill: rgba(143, 208, 255, 0.1); }
      .wgs-tooltip {
        position: absolute;
        z-index: 6;
        min-width: 120px;
        padding: 8px 10px;
        border-radius: 10px;
        border: 1px solid rgba(233, 194, 122, 0.4);
        background: rgba(6, 16, 33, 0.96);
        color: #e9f2ff;
        font-size: 10.5px;
        line-height: 1.65;
        pointer-events: none;
        box-shadow: 0 12px 26px rgba(0, 0, 0, 0.5);
        transform: translateX(-50%);
      }
      .wgs-tooltip-title { font-weight: 800; color: #ffe6b3; margin-bottom: 2px; }
      .wgs-tooltip-row { display: flex; justify-content: space-between; gap: 12px; color: #b9cde8; }
      .wgs-tooltip-row b { color: #f3f8ff; font-weight: 600; }
      .wgs-chart-note { padding: 0 15px 12px; font-size: 10px; color: #7c93b4; line-height: 1.5; }

      /* ---------- CPU ---------- */
      .wgs-cpu { display: grid; grid-template-columns: 168px minmax(0, 1fr); gap: 14px; padding: 2px 15px 14px; align-items: start; }
      .wgs-cpu-gauge { display: flex; flex-direction: column; align-items: center; gap: 6px; }
      .wgs-ring { display: block; width: 152px; height: 152px; }
      .wgs-ring-track { fill: none; stroke: rgba(143, 208, 255, 0.14); stroke-width: 12; }
      .wgs-ring-value { fill: none; stroke-width: 12; stroke-linecap: round; transition: stroke-dasharray 700ms cubic-bezier(0.2, 0.8, 0.2, 1), stroke 400ms ease; }
      .wgs-ring-num { fill: #f3f8ff; font-size: 30px; font-weight: 800; font-family: inherit; }
      .wgs-ring-cap { fill: #8fa7c8; font-size: 10px; font-family: inherit; }
      .wgs-cpu-main { min-width: 0; display: flex; flex-direction: column; gap: 10px; }
      .wgs-core-label { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 10.5px; color: #9db4d4; }
      .wgs-cores {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(13px, 1fr));
        gap: 4px;
        align-items: end;
        height: 58px;
      }
      .wgs-core {
        position: relative;
        height: 100%;
        display: flex;
        align-items: flex-end;
        border-radius: 3px;
        background: rgba(143, 208, 255, 0.08);
        overflow: hidden;
      }
      .wgs-core i {
        display: block;
        width: 100%;
        border-radius: 3px 3px 0 0;
        transition: height 600ms ease;
        min-height: 3px;
      }
      .wgs-spark-wrap { min-width: 0; }
      .wgs-spark { display: block; width: 100%; height: 54px; }
      .wgs-spark-area { fill: rgba(143, 208, 255, 0.14); stroke: none; }
      .wgs-spark-line { fill: none; stroke: #8fd0ff; stroke-width: 2; stroke-linejoin: round; stroke-linecap: round; filter: drop-shadow(0 0 4px rgba(143, 208, 255, 0.5)); }
      .wgs-spark-empty { font-size: 10.5px; color: #7c93b4; padding: 14px 0; }
      .wgs-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 7px; }
      .wgs-stat {
        min-width: 0;
        padding: 7px 9px;
        border-radius: 10px;
        border: 1px solid rgba(143, 208, 255, 0.12);
        background: rgba(9, 22, 44, 0.55);
      }
      .wgs-stat-label { font-size: 9.5px; color: #8fa7c8; letter-spacing: 0.03em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .wgs-stat-value { margin-top: 2px; font-size: 12.5px; font-weight: 700; color: #e9f2ff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

      /* ---------- sessions ---------- */
      .wgs-table-wrap { padding: 0 10px 12px; }
      .wgs-thead {
        display: grid;
        grid-template-columns: var(--wgs-cols);
        gap: 8px;
        padding: 7px 10px 6px;
        border-bottom: 1px solid rgba(143, 208, 255, 0.14);
        font-size: 10px;
        color: #8fa7c8;
        letter-spacing: 0.04em;
      }
      .wgs-thead .wgs-th { display: flex; align-items: center; gap: 3px; min-width: 0; }
      .wgs-thead .wgs-th--right { justify-content: flex-end; }
      .wgs-sort {
        padding: 0;
        border: 0;
        background: transparent;
        color: inherit;
        font: inherit;
        font-size: 10px;
        letter-spacing: 0.04em;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 3px;
        border-radius: 4px;
      }
      .wgs-sort:hover { color: #cfe6ff; }
      .wgs-sort:focus-visible { outline: 1px solid #8fd0ff; outline-offset: 2px; }
      .wgs-sort[data-active="true"] { color: #ffe6b3; font-weight: 700; }
      .wgs-tbody {
        --wgs-cols: minmax(0, 2.4fr) 100px 132px 82px 96px 84px;
        max-height: 286px;
        overflow-y: auto;
        padding-top: 4px;
        scrollbar-width: thin;
        scrollbar-color: rgba(143, 208, 255, 0.4) transparent;
      }
      .wgs-tbody::-webkit-scrollbar { width: 7px; }
      .wgs-tbody::-webkit-scrollbar-thumb { background: rgba(143, 208, 255, 0.3); border-radius: 99px; }
      .wgs-thead { --wgs-cols: minmax(0, 2.4fr) 100px 132px 82px 96px 84px; }
      .wgs-tr {
        display: grid;
        grid-template-columns: var(--wgs-cols);
        gap: 8px;
        align-items: center;
        min-width: 0;
      }
      .wgs-row {
        padding: 8px 10px;
        border-radius: 9px;
        cursor: pointer;
        outline: none;
        transition: background 140ms ease;
      }
      .wgs-row:hover { background: rgba(143, 208, 255, 0.08); }
      .wgs-row:focus-visible { box-shadow: inset 0 0 0 1px rgba(143, 208, 255, 0.6); background: rgba(143, 208, 255, 0.08); }
      .wgs-row[data-expanded="true"] { background: rgba(143, 208, 255, 0.1); }
      .wgs-cell { min-width: 0; font-size: 11px; color: #d7e6fb; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .wgs-cell--right { text-align: right; }
      .wgs-thead .wgs-th { min-width: 0; overflow: hidden; }
      .wgs-session-name {
        display: block;
        font-size: 11.5px;
        font-weight: 600;
        color: #f0f7ff;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .wgs-session-id {
        display: block;
        margin-top: 1px;
        font-size: 9.5px;
        color: #7c93b4;
        font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .wgs-session-tokens { display: flex; flex-direction: column; align-items: flex-end; gap: 1px; }
      .wgs-session-tokens b { font-size: 11.5px; color: #f3f8ff; }
      .wgs-session-tokens span { font-size: 9.5px; color: #7c93b4; white-space: nowrap; }
      .wgs-session-cost { font-size: 11px; color: #ffe6b3; text-align: right; }
      .wgs-session-model { font-size: 10px; color: #9db4d4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .wgs-status { display: flex; align-items: center; gap: 5px; font-size: 10px; color: #9db4d4; white-space: nowrap; }
      .wgs-status-dot { width: 6px; height: 6px; border-radius: 50%; background: #6d84a8; flex: none; }
      .wgs-status[data-live="true"] { color: #8ee9cd; }
      .wgs-status[data-live="true"] .wgs-status-dot { background: #74e0c0; box-shadow: 0 0 7px rgba(116, 224, 192, 0.85); }
      .wgs-session-detail {
        margin: 2px 4px 6px;
        padding: 9px 11px;
        border-radius: 10px;
        border: 1px dashed rgba(143, 208, 255, 0.22);
        background: rgba(6, 16, 33, 0.6);
        animation: wgs-bubble-in 180ms ease-out both;
      }
      .wgs-detail-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 7px 12px; }
      .wgs-detail-item { min-width: 0; }
      .wgs-detail-label { font-size: 9.5px; color: #7c93b4; letter-spacing: 0.03em; }
      .wgs-detail-value { font-size: 11px; color: #e3eefc; overflow-wrap: anywhere; line-height: 1.45; }
      .wgs-table-foot { padding: 6px 10px 0; font-size: 9.5px; color: #7c93b4; }

      /* ---------- settings drawer ---------- */
      .wgs-drawer {
        position: absolute;
        inset: 0;
        z-index: 20;
        display: flex;
        justify-content: flex-end;
        background: rgba(3, 9, 20, 0.62);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        animation: wgs-fade 180ms ease-out both;
      }
      .wgs-drawer-panel {
        width: min(436px, 100%);
        height: 100%;
        display: flex;
        flex-direction: column;
        border-left: 1px solid rgba(233, 194, 122, 0.38);
        background: linear-gradient(180deg, #132644 0%, #0a172c 100%);
        box-shadow: -22px 0 60px rgba(0, 0, 0, 0.52);
        animation: wgs-drawer-in 240ms cubic-bezier(0.2, 0.9, 0.2, 1) both;
      }
      .wgs-drawer-head {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 13px 14px 12px;
        border-bottom: 1px solid rgba(233, 194, 122, 0.26);
        flex: none;
      }
      .wgs-drawer-title { flex: 1; margin: 0; font-size: 14px; font-weight: 800; color: #f3f8ff; }
      .wgs-drawer-body {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        padding: 13px 14px 18px;
        display: flex;
        flex-direction: column;
        gap: 13px;
        scrollbar-width: thin;
        scrollbar-color: rgba(143, 208, 255, 0.4) transparent;
      }
      .wgs-drawer-body::-webkit-scrollbar { width: 7px; }
      .wgs-drawer-body::-webkit-scrollbar-thumb { background: rgba(143, 208, 255, 0.3); border-radius: 99px; }
      .wgs-form-group {
        display: flex;
        flex-direction: column;
        gap: 9px;
        padding: 11px 12px 12px;
        border-radius: 13px;
        border: 1px solid rgba(143, 208, 255, 0.15);
        background: rgba(9, 22, 44, 0.5);
      }
      .wgs-form-group-title {
        font-size: 10.5px;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #8fd0ff;
      }
      .wgs-field { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
      .wgs-field > label { font-size: 10.5px; color: #9db4d4; }
      .wgs-field > small { font-size: 9.5px; color: #7c93b4; line-height: 1.45; }
      .wgs-input, .wgs-select {
        width: 100%;
        padding: 7px 9px;
        border-radius: 8px;
        border: 1px solid rgba(143, 208, 255, 0.22);
        background: rgba(6, 16, 33, 0.85);
        color: #e9f2ff;
        font: inherit;
        font-size: 12px;
        line-height: 1.4;
        outline: none;
        transition: border-color 150ms ease, box-shadow 150ms ease;
      }
      .wgs-input:focus, .wgs-select:focus {
        border-color: rgba(143, 208, 255, 0.65);
        box-shadow: 0 0 0 2px rgba(79, 158, 232, 0.2);
      }
      .wgs-select option { background: #0b1830; color: #e9f2ff; }
      .wgs-grid2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; }
      .wgs-note {
        padding: 8px 10px;
        border-radius: 9px;
        border: 1px solid rgba(143, 208, 255, 0.2);
        background: rgba(79, 158, 232, 0.08);
        color: #9fd4ff;
        font-size: 10px;
        line-height: 1.55;
      }
      .wgs-warning {
        padding: 8px 10px;
        border-radius: 9px;
        border: 1px solid rgba(255, 130, 150, 0.38);
        background: rgba(255, 130, 150, 0.08);
        color: #ffb3c1;
        font-size: 10px;
        line-height: 1.55;
      }
      .wgs-save-row { display: flex; align-items: center; gap: 9px; flex-wrap: wrap; }
      .wgs-btn-primary {
        padding: 8px 15px;
        border: 0;
        border-radius: 9px;
        background: linear-gradient(135deg, #e9c27a, #d3a44e);
        color: #2a1d06;
        font: inherit;
        font-size: 12px;
        font-weight: 800;
        cursor: pointer;
        box-shadow: 0 6px 18px rgba(233, 194, 122, 0.28);
        transition: transform 150ms ease, filter 150ms ease;
      }
      .wgs-btn-primary:hover { filter: brightness(1.06); }
      .wgs-btn-primary:active { transform: scale(0.97); }
      .wgs-btn-primary:disabled { opacity: 0.5; cursor: default; box-shadow: none; }
      .wgs-btn-ghost {
        padding: 7px 12px;
        border-radius: 9px;
        border: 1px solid rgba(143, 208, 255, 0.26);
        background: transparent;
        color: #bcdcff;
        font: inherit;
        font-size: 11.5px;
        cursor: pointer;
      }
      .wgs-btn-ghost:hover { background: rgba(143, 208, 255, 0.12); }
      .wgs-save-note { font-size: 10.5px; line-height: 1.5; color: #8ee9cd; }
      .wgs-save-note[data-error="true"] { color: #ffb3c1; }

      /* ---------- skeleton ---------- */
      .wgs-skel {
        display: block;
        border-radius: 8px;
        background: linear-gradient(100deg, rgba(143, 208, 255, 0.08) 8%, rgba(143, 208, 255, 0.2) 40%, rgba(143, 208, 255, 0.08) 72%);
        background-size: 220% 100%;
        animation: wgs-shimmer 1.4s linear infinite;
      }
      .wgs-skel-kpis { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
      .wgs-skel-card { height: 104px; border-radius: 15px; }
      .wgs-skel-chart { height: 224px; border-radius: 16px; }
      .wgs-skel-cpu { height: 190px; border-radius: 16px; }
      .wgs-skel-table { height: 210px; border-radius: 16px; }
      .wgs-footer-note { padding: 2px 4px 0; font-size: 9.5px; color: #6d84a8; text-align: center; line-height: 1.6; }

      /* ---------- animations ---------- */
      @keyframes wgs-fade { from { opacity: 0; } to { opacity: 1; } }
      @keyframes wgs-panel-in {
        from { opacity: 0; transform: translateY(14px) scale(0.982); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes wgs-drawer-in {
        from { opacity: 0.4; transform: translateX(28px); }
        to { opacity: 1; transform: translateX(0); }
      }
      @keyframes wgs-bubble-in {
        from { opacity: 0; transform: translateY(6px) scale(0.97); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes wgs-float {
        0%, 100% { transform: translateY(0) rotate(-0.5deg); }
        50% { transform: translateY(-7px) rotate(0.5deg); }
      }
      @keyframes wgs-chew {
        0%, 100% { transform: translateY(0) scale(1, 1) rotate(0); }
        22% { transform: translateY(-9px) scale(1.014, 0.986) rotate(-1.6deg); }
        44% { transform: translateY(0) scale(0.988, 1.014) rotate(0.8deg); }
        66% { transform: translateY(-5px) scale(1.008, 0.994) rotate(1.2deg); }
        88% { transform: translateY(0) scale(1, 1) rotate(0); }
      }
      @keyframes wgs-aura {
        0%, 100% { opacity: 0.65; transform: scale(0.95); }
        50% { opacity: 1; transform: scale(1.04); }
      }
      @keyframes wgs-rice-fall {
        0% { opacity: 0; transform: translate(0, 0) rotate(0deg) scale(0.7); }
        12% { opacity: 1; }
        70% { opacity: 1; }
        100% { opacity: 0; transform: translate(var(--wgs-drift, 4px), 108px) rotate(190deg) scale(1); }
      }
      @keyframes wgs-steam-rise {
        0% { opacity: 0; transform: translateY(6px) scale(0.7); }
        25% { opacity: 0.85; }
        100% { opacity: 0; transform: translateY(-56px) scale(1.15); }
      }
      @keyframes wgs-twinkle {
        0%, 100% { opacity: 0.2; transform: scale(0.65) rotate(0deg); }
        50% { opacity: 1; transform: scale(1.18) rotate(45deg); }
      }
      @keyframes wgs-heart-up {
        0% { opacity: 0; transform: translateY(0) scale(0.6); }
        18% { opacity: 1; }
        100% { opacity: 0; transform: translate(10px, -104px) scale(1.2); }
      }
      @keyframes wgs-shimmer {
        from { background-position: 180% 0; }
        to { background-position: -80% 0; }
      }
      @keyframes wgs-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.45; }
      }
      @keyframes wgs-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes wgs-pop {
        0% { transform: scale(1); }
        34% { transform: scale(1.09); }
        100% { transform: scale(1); }
      }

      /* ---------- responsive ---------- */
      @media (max-width: 900px) {
        .wgs-hero { grid-template-columns: minmax(0, 1fr); padding: 8px 12px 12px; }
        .wgs-hero-stage { height: 356px; }
        .wgs-mascot { width: 176px; height: 302px; margin-left: -88px; }
        .wgs-bowl { width: 140px; margin-left: -70px; top: 12px; }
        .wgs-cpu { grid-template-columns: 148px minmax(0, 1fr); }
        .wgs-kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .wgs-skel-kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }
      @media (max-width: 720px) {
        .wgs-root { padding: 8px; }
        .wgs-shell { width: 100%; max-height: 86vh; border-radius: 16px; }
        .wgs-head { padding: 10px 10px 9px; gap: 8px; }
        .wgs-head-avatar { width: 36px; height: 36px; }
        .wgs-head-title { font-size: 13.5px; }
        .wgs-head-sub { font-size: 10px; }
        .wgs-body { padding: 11px 9px 14px; gap: 11px; }
        .wgs-hero-stage { height: 330px; }
        .wgs-mascot { width: 160px; height: 275px; margin-left: -80px; }
        .wgs-bowl { width: 126px; margin-left: -63px; top: 12px; }
        .wgs-bubble { max-width: 158px; font-size: 11px; padding: 8px 10px; }
        .wgs-bowl-number { font-size: 36px; }
        .wgs-kpis { grid-template-columns: minmax(0, 1fr); gap: 8px; }
        .wgs-kpi { padding: 10px 11px; }
        .wgs-kpi-value { font-size: 21px; }
        .wgs-cpu { grid-template-columns: minmax(0, 1fr); }
        .wgs-cpu-gauge { flex-direction: row; align-items: center; justify-content: flex-start; gap: 12px; }
        .wgs-ring { width: 106px; height: 106px; }
        .wgs-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .wgs-thead { --wgs-cols: minmax(0, 1.8fr) 62px 84px 52px 44px; }
        .wgs-tbody { --wgs-cols: minmax(0, 1.8fr) 62px 84px 52px 44px; }
        .wgs-col-model { display: none; }
        .wgs-status-text { display: none; }
        .wgs-status { justify-content: flex-end; }
        .wgs-section-head { padding: 11px 11px 8px; }
        .wgs-table-wrap { padding: 0 6px 10px; }
        .wgs-detail-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .wgs-tooltip { min-width: 106px; font-size: 10px; }
        .wgs-chart .wgs-axis { font-size: 14px; }
        .wgs-skel-kpis { grid-template-columns: minmax(0, 1fr); }
        .wgs-skel-chart, .wgs-skel-cpu, .wgs-skel-table { height: 180px; }
        .wgs-drawer-panel { width: 100%; }
        .wgs-grid2 { grid-template-columns: minmax(0, 1fr); }
      }
      @media (max-width: 430px) {
        .wgs-kpis { grid-template-columns: minmax(0, 1fr); }
        .wgs-skel-kpis { grid-template-columns: minmax(0, 1fr); }
        .wgs-hero-stage { height: 312px; }
        .wgs-mascot { width: 146px; height: 250px; margin-left: -73px; }
        .wgs-bowl { width: 116px; margin-left: -58px; top: 10px; }
        .wgs-bubble { max-width: 132px; font-size: 10.5px; }
        .wgs-bowl-number { font-size: 31px; }
        .wgs-head-actions { gap: 3px; }
        .wgs-icon-btn { width: 28px; height: 28px; }
        .wgs-thead { --wgs-cols: minmax(0, 1.5fr) 78px 48px 40px; }
        .wgs-tbody { --wgs-cols: minmax(0, 1.5fr) 78px 48px 40px; }
        .wgs-col-updated { display: none; }
        .wgs-chart .wgs-axis { font-size: 18px; }
      }
      @media (prefers-reduced-motion: reduce) {
        .wgs-root,
        .wgs-shell,
        .wgs-head-avatar,
        .wgs-dot,
        .wgs-aura,
        .wgs-mascot,
        .wgs-bowl,
        .wgs-bowl-number,
        .wgs-rice,
        .wgs-steam i,
        .wgs-sparkles span,
        .wgs-hearts span,
        .wgs-bubble,
        .wgs-hero[data-intensity="high"] .wgs-hearts span,
        .wgs-skel,
        .wgs-drawer,
        .wgs-drawer-panel,
        .wgs-icon-btn[data-spin="true"] svg {
          animation: none !important;
        }
        .wgs-hero[data-eating="true"] .wgs-rice { animation-play-state: running; }
      }
    `;

    /* ============================================================
     * 图标
     * ============================================================ */

    function Icon(props) {
      const kind = props.kind;
      const size = num(props.size, 16);
      const root = {
        viewBox: '0 0 24 24',
        width: size,
        height: size,
        fill: 'none',
        'aria-hidden': true,
        focusable: 'false',
      };
      if (kind === 'bowl') {
        return h(
          'svg',
          root,
          h('path', {
            d: 'M3.8 11.4h16.4c-.3 4.8-3.7 7.8-8.2 7.8s-7.9-3-8.2-7.8z',
            stroke: 'currentColor',
            strokeWidth: 1.7,
            strokeLinejoin: 'round',
          }),
          h('path', {
            d: 'M7.2 8.2c0-1.9 1.3-3.1 2.9-3.3M12.4 8.2c.1-2.4 1.6-4 3.5-4.2',
            stroke: 'currentColor',
            strokeWidth: 1.5,
            strokeLinecap: 'round',
          }),
        );
      }
      if (kind === 'refresh') {
        return h(
          'svg',
          root,
          h('path', {
            d: 'M19.6 12a7.6 7.6 0 1 1-2.3-5.4',
            stroke: 'currentColor',
            strokeWidth: 1.7,
            strokeLinecap: 'round',
          }),
          h('path', {
            d: 'M19.8 4.4v4.2h-4.2',
            stroke: 'currentColor',
            strokeWidth: 1.7,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
          }),
        );
      }
      if (kind === 'settings') {
        return h(
          'svg',
          root,
          h('circle', { cx: 12, cy: 12, r: 3.1, stroke: 'currentColor', strokeWidth: 1.6 }),
          h('path', {
            d: 'M12 3.4v2.2M12 18.4v2.2M3.4 12h2.2M18.4 12h2.2M5.9 5.9l1.6 1.6M16.5 16.5l1.6 1.6M18.1 5.9l-1.6 1.6M7.5 16.5l-1.6 1.6',
            stroke: 'currentColor',
            strokeWidth: 1.6,
            strokeLinecap: 'round',
          }),
        );
      }
      if (kind === 'close') {
        return h(
          'svg',
          root,
          h('path', { d: 'M6 6l12 12M18 6L6 18', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' }),
        );
      }
      if (kind === 'tokens') {
        return h(
          'svg',
          root,
          h('path', {
            d: 'M12 3.2l7.2 4.2v9.2L12 20.8l-7.2-4.2V7.4z',
            stroke: 'currentColor',
            strokeWidth: 1.6,
            strokeLinejoin: 'round',
          }),
          h('path', { d: 'M12 8v8M9 10.4h4.6a1.6 1.6 0 0 1 0 3.2H9.6', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round' }),
        );
      }
      if (kind === 'sessions') {
        return h(
          'svg',
          root,
          h('rect', { x: 4, y: 4.6, width: 16, height: 14.8, rx: 3, stroke: 'currentColor', strokeWidth: 1.6 }),
          h('path', { d: 'M4.4 9.4h15.2', stroke: 'currentColor', strokeWidth: 1.4 }),
          h('circle', { cx: 8, cy: 13.6, r: 1.1, fill: 'currentColor' }),
          h('path', { d: 'M11 13.6h6', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round' }),
        );
      }
      if (kind === 'coin') {
        return h(
          'svg',
          root,
          h('circle', { cx: 12, cy: 12, r: 8.2, stroke: 'currentColor', strokeWidth: 1.6 }),
          h('path', { d: 'M9 8.4l3 3.6 3-3.6M12 12v5.4M9.2 13.2h5.6M9.2 15.6h5.6', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round' }),
        );
      }
      if (kind === 'budget') {
        return h(
          'svg',
          root,
          h('circle', { cx: 12, cy: 12, r: 8.2, stroke: 'currentColor', strokeWidth: 1.6 }),
          h('path', { d: 'M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round' }),
          h('circle', { cx: 12, cy: 12, r: 3.2, stroke: 'currentColor', strokeWidth: 1.4 }),
        );
      }
      if (kind === 'cpu') {
        return h(
          'svg',
          root,
          h('rect', { x: 6.2, y: 6.2, width: 11.6, height: 11.6, rx: 2.4, stroke: 'currentColor', strokeWidth: 1.6 }),
          h('path', {
            d: 'M9.6 2.8v2.6M14.4 2.8v2.6M9.6 18.6v2.6M14.4 18.6v2.6M2.8 9.6h2.6M2.8 14.4h2.6M18.6 9.6h2.6M18.6 14.4h2.6',
            stroke: 'currentColor',
            strokeWidth: 1.5,
            strokeLinecap: 'round',
          }),
        );
      }
      return h('svg', root, h('circle', { cx: 12, cy: 12, r: 7, stroke: 'currentColor', strokeWidth: 1.6 }));
    }

    /* ============================================================
     * 不锈钢饭盆（内联 SVG）
     * ============================================================ */

    function BowlSvg() {
      return h(
        'svg',
        { viewBox: '0 0 200 120', 'aria-hidden': true, focusable: 'false' },
        h(
          'defs',
          null,
          h(
            'linearGradient',
            { id: 'wgs-bowl-steel', x1: '12%', y1: '0%', x2: '88%', y2: '100%' },
            h('stop', { offset: '0%', stopColor: '#fdfeff' }),
            h('stop', { offset: '20%', stopColor: '#e2e9f1' }),
            h('stop', { offset: '44%', stopColor: '#aab6c5' }),
            h('stop', { offset: '66%', stopColor: '#e8eef6' }),
            h('stop', { offset: '100%', stopColor: '#8b98a8' }),
          ),
          h(
            'linearGradient',
            { id: 'wgs-bowl-rim', x1: '0%', y1: '0%', x2: '100%', y2: '0%' },
            h('stop', { offset: '0%', stopColor: '#94a2b2' }),
            h('stop', { offset: '32%', stopColor: '#f7fafd' }),
            h('stop', { offset: '68%', stopColor: '#c3ccd7' }),
            h('stop', { offset: '100%', stopColor: '#f2f6fa' }),
          ),
          h(
            'radialGradient',
            { id: 'wgs-bowl-shine', cx: '36%', cy: '22%', r: '64%' },
            h('stop', { offset: '0%', stopColor: 'rgba(255,255,255,0.95)' }),
            h('stop', { offset: '52%', stopColor: 'rgba(255,255,255,0.14)' }),
            h('stop', { offset: '100%', stopColor: 'rgba(255,255,255,0)' }),
          ),
        ),
        h('path', {
          d: 'M24 76 C10 68, 8 50, 20 44',
          fill: 'none',
          stroke: 'url(#wgs-bowl-rim)',
          strokeWidth: 5,
          strokeLinecap: 'round',
        }),
        h('path', {
          d: 'M176 76 C190 68, 192 50, 180 44',
          fill: 'none',
          stroke: 'url(#wgs-bowl-rim)',
          strokeWidth: 5,
          strokeLinecap: 'round',
        }),
        h('path', {
          d: 'M86 20 C86 7, 114 7, 114 20',
          fill: 'none',
          stroke: 'url(#wgs-bowl-rim)',
          strokeWidth: 5,
          strokeLinecap: 'round',
        }),
        h('path', {
          d: 'M20 76 C24 33, 62 15, 100 15 C138 15, 176 33, 180 76 Z',
          fill: 'url(#wgs-bowl-steel)',
          stroke: '#778595',
          strokeWidth: 1.4,
        }),
        h('ellipse', {
          cx: 100,
          cy: 76,
          rx: 80,
          ry: 11.5,
          fill: 'url(#wgs-bowl-rim)',
          stroke: '#6d7b8b',
          strokeWidth: 1.2,
        }),
        h('ellipse', { cx: 100, cy: 74, rx: 69, ry: 7.4, fill: '#0e1c33', opacity: 0.32 }),
        h('path', {
          d: 'M43 64 C52 39, 76 26, 100 23',
          fill: 'none',
          stroke: 'url(#wgs-bowl-shine)',
          strokeWidth: 7,
          strokeLinecap: 'round',
          opacity: 0.9,
        }),
        h('ellipse', {
          cx: 76,
          cy: 39,
          rx: 19,
          ry: 8,
          fill: '#ffffff',
          opacity: 0.55,
          transform: 'rotate(-18 76 39)',
        }),
        h('ellipse', { cx: 133, cy: 46, rx: 9, ry: 4, fill: '#ffffff', opacity: 0.34, transform: 'rotate(14 133 46)' }),
      );
    }

    /* ============================================================
     * 角色干饭区
     * ============================================================ */

    function Hero(props) {
      const t = props.t;
      const data = props.data;
      const status = props.status;
      const eating = props.eating;
      const feast = props.feast;
      const speed = props.speed;
      const intensity = props.intensity === undefined ? 0.4 : props.intensity;
      const bubbleSeed = props.bubbleSeed;
      const pulse = props.pulse;

      const rate = data && data.rate ? data.rate : {};
      const character = data && data.character ? data.character : {};
      const config = data && data.config ? data.config : {};
      const tokensPerBowl = Math.max(
        1,
        num(character.tokensPerBowl, num(config.tokensPerBowl, 8000)) || 8000,
      );
      const bowls = num(character.bowls, totalTokensOf(data) / tokensPerBowl);
      const bowlNo = Math.max(0, Math.floor(bowls));
      const bowlFraction = clamp(num(character.bowlFraction, 0), 0, 1);
      const happiness = clamp(num(character.happiness, 0), 0, 1);
      const tokensPerMin = Math.max(0, num(rate.tokensPerMin, 0));
      const inverse = String(Number((1 / speed).toFixed(3)));
      const loading = !data && status === 'loading';
      const offline = status === 'offline';
      const bubble = bubbleText(t, {
        eating: eating,
        feast: feast,
        bowlNo: bowlNo,
        seed: bubbleSeed,
        loading: loading,
        offline: offline,
      });
      const stateLabel = feast
        ? t('hero.state.feast')
        : eating
          ? t('hero.state.eating')
          : t('hero.state.idle');

      const idleBase = API + '/assets/idle.webp';
      const eatBase = API + '/assets/eating.webp';
      const idlePoseSrc = props.idleFailed
        ? props.eatingFailed
          ? null
          : eatBase
        : idleBase;
      const eatPoseSrc = props.eatingFailed
        ? props.idleFailed
          ? null
          : idleBase
        : eatBase;
      const showFallback = idlePoseSrc === null && eatPoseSrc === null;
      const imageAlt = t('hero.imageAlt');

      const rice = RICE_PARTICLES.slice(0, 6 + Math.round(clamp(intensity, 0, 1) * 6)).map((item, index) =>
        h('span', {
          key: 'rice-' + index,
          className: 'wgs-rice',
          style: {
            left: item.left,
            animationDelay: item.delay.toFixed(2) + 's',
            animationDuration: (item.duration * (1 / speed)).toFixed(2) + 's',
            '--wgs-drift': item.drift,
          },
        }),
      );

      const stars = [];
      for (let index = 0; index < 6; index += 1) stars.push(h('span', { key: 'star-' + index }));
      const hearts = [];
      for (let index = 0; index < 5; index += 1) hearts.push(h('span', { key: 'heart-' + index }, '♥'));

      return h(
        'section',
        {
          className: 'wgs-card wgs-hero',
          'data-eating': eating ? 'true' : 'false',
          'data-feast': feast ? 'true' : 'false',
          'data-intensity': intensity >= 0.6 ? 'high' : 'normal',
          'aria-label': t('header.title'),
          style: { '--wgs-speed': String(speed), '--wgs-inv': inverse },
        },
        h(
          'div',
          { className: 'wgs-hero-stage' },
          h('div', { className: 'wgs-aura', 'aria-hidden': true }),
          h(
            'div',
            { className: 'wgs-bowl', role: 'img', 'aria-label': t('hero.bowlAlt') },
            h(BowlSvg),
          ),
          h(
            'div',
            { className: 'wgs-mascot' },
            idlePoseSrc
              ? h('img', {
                  className: 'wgs-pose wgs-pose--idle',
                  src: idlePoseSrc,
                  alt: imageAlt,
                  draggable: false,
                  onError: props.onIdleError,
                })
              : null,
            eatPoseSrc
              ? h('img', {
                  className: 'wgs-pose wgs-pose--eat',
                  src: eatPoseSrc,
                  alt: imageAlt,
                  draggable: false,
                  onError: props.onEatingError,
                })
              : null,
            showFallback ? h('div', { className: 'wgs-mascot-fallback', 'aria-hidden': true }) : null,
          ),
          h('div', { className: 'wgs-mascot-shadow', 'aria-hidden': true }),
          h('div', { className: 'wgs-rice-field', 'aria-hidden': true }, rice),
          h('div', { className: 'wgs-steam', 'aria-hidden': true }, h('i', null), h('i', null), h('i', null)),
          h('div', { className: 'wgs-sparkles', 'aria-hidden': true }, stars),
          h('div', { className: 'wgs-hearts', 'aria-hidden': true }, hearts),
          h(
            'div',
            {
              className: 'wgs-bubble',
              key: 'bubble-' + (eating ? 'eat' : 'idle') + '-' + bubbleSeed + '-' + pulse,
              role: 'status',
              'aria-live': 'polite',
            },
            bubble,
          ),
          h('div', { className: 'wgs-state-chip', 'data-eating': eating ? 'true' : 'false' }, stateLabel),
        ),
        h(
          'div',
          { className: 'wgs-hero-stats' },
          h(
            'div',
            { className: 'wgs-bowl-line' },
            h('span', { className: 'wgs-bowl-prefix' }, t('hero.bowlPrefix')),
            h('span', { className: 'wgs-bowl-number', key: 'bowl-' + pulse }, formatInt(bowlNo)),
            t('hero.bowlUnit') ? h('span', { className: 'wgs-bowl-unit' }, t('hero.bowlUnit')) : null,
          ),
          h('div', { className: 'wgs-bowl-caption' }, t('hero.bowlCaption')),
          h(
            'div',
            { className: 'wgs-meter-row' },
            h(
              'div',
              { className: 'wgs-meter-label' },
              h('span', null, t('hero.bowlProgress', null, { pct: Math.round(bowlFraction * 100) })),
              h('span', null, t('hero.hungry')),
            ),
            h(
              'div',
              { className: 'wgs-meter' },
              h('i', { style: { width: clamp(bowlFraction * 100, 0, 100).toFixed(1) + '%' } }),
            ),
          ),
          h(
            'div',
            { className: 'wgs-happy' },
            h(
              'div',
              { className: 'wgs-meter wgs-meter--pink' },
              h('i', { style: { width: clamp(happiness * 100, 0, 100).toFixed(1) + '%' } }),
            ),
            h(
              'div',
              { className: 'wgs-happy-line' },
              t('hero.happinessLine', null, { pct: Math.min(99.9, happiness * 100).toFixed(1) }),
            ),
          ),
          h(
            'div',
            { className: 'wgs-chips' },
            h('span', { className: 'wgs-chip' }, t('hero.rate', null, { tokens: formatTokens(tokensPerMin) })),
            h(
              'span',
              { className: 'wgs-chip wgs-chip--gold' },
              t('hero.speed', null, { speed: speed.toFixed(1) }),
            ),
            h('span', { className: 'wgs-chip' }, t('hero.tokens', null, { tokens: formatTokens(totalTokensOf(data)) })),
          ),
          h('div', { className: 'wgs-hero-note' }, t('hero.note')),
        ),
      );
    }

    /* ============================================================
     * KPI 卡片
     * ============================================================ */

    function KpiCard(props) {
      return h(
        'div',
        { className: 'wgs-kpi', 'data-accent': props.accent || 'sea' },
        h(
          'div',
          { className: 'wgs-kpi-head' },
          h('span', { className: 'wgs-kpi-icon', 'aria-hidden': true }, h(Icon, { kind: props.icon, size: 14 })),
          h('span', { className: 'wgs-kpi-label' }, props.label),
        ),
        h(
          'div',
          {
            className: 'wgs-kpi-value' + (props.money ? ' wgs-kpi-value--money' : ''),
            'data-over': props.over ? 'true' : 'false',
            style: props.valueStyle,
          },
          props.value,
        ),
        props.sub ? h('div', { className: 'wgs-kpi-sub' }, props.sub) : null,
        props.bar !== undefined
          ? h(
              'div',
              { className: 'wgs-kpi-bar' },
              h('i', {
                style: { width: clamp(props.bar, 0, 100).toFixed(1) + '%' },
                'data-over': props.over ? 'true' : 'false',
              }),
            )
          : null,
      );
    }

    function KpiGrid(props) {
      const t = props.t;
      const data = props.data || {};
      const totals = data.totals || {};
      const today = data.today || {};
      const budget = data.budget || {};
      const config = data.config || {};
      const amount = Math.max(0, num(budget.amount, num(config.budget && config.budget.amount, 0)));
      const cost = num(totals.cost, 0);
      const spent = num(budget.spent, cost);
      const remaining = num(budget.remaining, Math.max(0, amount - spent));
      const rawPercent = amount > 0 ? (spent / amount) * 100 : 0;
      const barPercent = clamp(rawPercent, 0, 100);
      const over = amount > 0 && spent > amount;
      const hasBudget = amount > 0;
      return h(
        'div',
        { className: 'wgs-kpis' },
        h(KpiCard, {
          icon: 'tokens',
          label: t('kpi.tokens'),
          value: formatTokens(totalTokensOf(data)),
          sub: t('kpi.tokensSub', null, {
            input: formatTokens(totals.inputTokens),
            output: formatTokens(totals.outputTokens),
            cache: formatTokens(totals.cacheReadTokens),
          }),
        }),
        h(KpiCard, {
          icon: 'sessions',
          label: t('kpi.sessions'),
          value: formatInt(totals.sessions),
          sub: t('kpi.sessionsSub', null, { n: formatInt(totals.liveSessions) }),
        }),
        h(KpiCard, {
          icon: 'coin',
          label: t('kpi.cost'),
          value: formatMoney(cost),
          money: true,
          sub:
            t(pricingMode === 'custom' ? 'kpi.costSubCustom' : 'kpi.costSub') +
            ' · ' +
            t('kpi.todayCost', null, { cost: formatAmount(today.cost) }),
        }),
        h(KpiCard, {
          icon: 'budget',
          label: t('kpi.budget'),
          value: hasBudget
            ? t('kpi.budgetRemaining', null, {
                remaining: formatAmount(remaining),
                amount: formatAmount(amount),
              })
            : t('kpi.budgetNone'),
          sub: hasBudget
            ? over
              ? t('kpi.budgetOver', null, { pct: Math.round(rawPercent) })
              : t('kpi.budgetSpent', null, { pct: Math.round(rawPercent) })
            : t('kpi.todayCost', null, { cost: formatAmount(today.cost) }),
          money: true,
          over: over,
          bar: hasBudget ? barPercent : undefined,
          valueStyle: hasBudget ? { fontSize: '16px' } : { fontSize: '18px', color: '#b9cde8' },
          accent: 'gold',
        }),
      );
    }

    /* ============================================================
     * 14 天堆叠时间线 + 成本折线（原生 SVG）
     * ============================================================ */

    const CHART = { width: 780, height: 252, left: 54, right: 724, top: 18, bottom: 206 };

    function chartLabel(bucket) {
      if (bucket && bucket.label) return String(bucket.label);
      if (bucket && bucket.date) return String(bucket.date).slice(5);
      return '';
    }

    function TimelineCard(props) {
      const t = props.t;
      const timeline = props.timeline || {};
      const buckets = Array.isArray(timeline.buckets) ? timeline.buckets : [];
      const days = buckets.length || Math.max(1, num(timeline.days, 14));
      const [hover, setHover] = useState(null);

      let allTokens = 0;
      let allCost = 0;
      for (const bucket of buckets) {
        allTokens += num(bucket.totalTokens, 0);
        allCost += num(bucket.cost, 0);
      }
      const empty = buckets.length === 0 || (allTokens <= 0 && allCost <= 0);

      const head = h(
        'div',
        { className: 'wgs-section-head' },
        h(
          'div',
          null,
          h('h3', { className: 'wgs-section-title' }, t('timeline.title', null, { days: days })),
          h('div', { className: 'wgs-section-sub' }, t('timeline.sub')),
        ),
        h(
          'div',
          { className: 'wgs-legend' },
          h('span', null, h('i', { 'data-kind': 'input' }), t('timeline.legend.input')),
          h('span', null, h('i', { 'data-kind': 'output' }), t('timeline.legend.output')),
          h('span', null, h('i', { 'data-kind': 'cache' }), t('timeline.legend.cache')),
          h('span', null, h('i', { 'data-kind': 'cost' }), t('timeline.legend.cost')),
        ),
      );

      if (empty) {
        return h('section', { className: 'wgs-card' }, head, h('div', { className: 'wgs-empty' }, t('timeline.empty')));
      }

      let maxTokens = 0;
      let maxCost = 0;
      for (const bucket of buckets) {
        const stacked =
          num(bucket.inputTokens, 0) +
          num(bucket.outputTokens, 0) +
          num(bucket.cacheReadTokens, 0) +
          num(bucket.cacheWriteTokens, 0);
        maxTokens = Math.max(maxTokens, stacked, num(bucket.totalTokens, 0));
        maxCost = Math.max(maxCost, num(bucket.cost, 0));
      }
      maxTokens = Math.max(1, maxTokens, num(timeline.maxTokens, 0));
      maxCost = Math.max(0.01, maxCost, num(timeline.maxCost, 0));

      const count = buckets.length;
      const step = (CHART.right - CHART.left) / Math.max(1, count);
      const barWidth = clamp(step * 0.52, 4, 26);
      const plotHeight = CHART.bottom - CHART.top;
      const tokenHeight = (value) => (num(value, 0) / maxTokens) * plotHeight;
      const costY = (value) => CHART.bottom - (num(value, 0) / maxCost) * plotHeight;
      const labelEvery = count <= 7 ? 1 : count <= 14 ? 2 : 3;

      const gridLines = [];
      for (let index = 0; index <= 4; index += 1) {
        const ratio = index / 4;
        const y = CHART.top + plotHeight * ratio;
        gridLines.push(
          h('line', {
            key: 'grid-' + index,
            className: 'wgs-grid',
            x1: CHART.left,
            y1: y.toFixed(1),
            x2: CHART.right,
            y2: y.toFixed(1),
          }),
          h(
            'text',
            { key: 'grid-l-' + index, className: 'wgs-axis', x: CHART.left - 8, y: (y + 3.5).toFixed(1), textAnchor: 'end' },
            formatTokens(maxTokens * (1 - ratio)),
          ),
          h(
            'text',
            { key: 'grid-r-' + index, className: 'wgs-axis wgs-axis--cost', x: CHART.right + 8, y: (y + 3.5).toFixed(1), textAnchor: 'start' },
            formatShortMoney(maxCost * (1 - ratio)),
          ),
        );
      }

      const bars = [];
      const dots = [];
      const points = [];
      const xLabels = [];
      const hovers = [];
      for (let index = 0; index < count; index += 1) {
        const bucket = buckets[index];
        const centerX = CHART.left + step * (index + 0.5);
        const segments = [
          ['input', num(bucket.inputTokens, 0), 'wgs-bar-input'],
          ['output', num(bucket.outputTokens, 0), 'wgs-bar-output'],
          ['cache', num(bucket.cacheReadTokens, 0), 'wgs-bar-cache'],
        ];
        let stacked = 0;
        for (const segment of segments) {
          const height = tokenHeight(segment[1]);
          if (height <= 0) continue;
          const y = CHART.bottom - stacked - height;
          stacked += height;
          bars.push(
            h('rect', {
              key: segment[0] + '-' + index,
              className: segment[2],
              x: (centerX - barWidth / 2).toFixed(1),
              y: y.toFixed(2),
              width: barWidth.toFixed(1),
              height: Math.max(height, 0.9).toFixed(2),
              rx: Math.min(2.5, barWidth / 4).toFixed(1),
            }),
          );
        }
        const cost = num(bucket.cost, 0);
        const pointY = costY(cost);
        points.push(centerX.toFixed(1) + ',' + pointY.toFixed(1));
        dots.push(
          h('circle', {
            key: 'cost-dot-' + index,
            className: 'wgs-cost-dot',
            cx: centerX.toFixed(1),
            cy: pointY.toFixed(1),
            r: 2.1,
          }),
        );
        if (index % labelEvery === 0 || index === count - 1) {
          xLabels.push(
            h(
              'text',
              {
                key: 'x-' + index,
                className: 'wgs-axis',
                x: centerX.toFixed(1),
                y: CHART.bottom + 17,
                textAnchor: 'middle',
              },
              chartLabel(bucket),
            ),
          );
        }
        hovers.push(
          h('rect', {
            key: 'hover-' + index,
            className: 'wgs-hover',
            'data-active': hover === index ? 'true' : 'false',
            x: (CHART.left + step * index).toFixed(1),
            y: CHART.top,
            width: Math.max(step, 2).toFixed(1),
            height: plotHeight,
            onMouseEnter: () => setHover(index),
            onMouseLeave: () => setHover((current) => (current === index ? null : current)),
            onClick: () => setHover((current) => (current === index ? null : index)),
          }),
        );
      }

      let tooltip = null;
      if (hover !== null && buckets[hover]) {
        const bucket = buckets[hover];
        const centerX = CHART.left + step * (hover + 0.5);
        const leftPercent = clamp((centerX / CHART.width) * 100, 18, 82);
        tooltip = h(
          'div',
          { className: 'wgs-tooltip', style: { left: leftPercent.toFixed(1) + '%', top: '6px' } },
          h('div', { className: 'wgs-tooltip-title' }, bucket.date || chartLabel(bucket)),
          h(
            'div',
            { className: 'wgs-tooltip-row' },
            h('span', null, t('timeline.legend.input')),
            h('b', null, formatTokens(bucket.inputTokens)),
          ),
          h(
            'div',
            { className: 'wgs-tooltip-row' },
            h('span', null, t('timeline.legend.output')),
            h('b', null, formatTokens(bucket.outputTokens)),
          ),
          h(
            'div',
            { className: 'wgs-tooltip-row' },
            h('span', null, t('timeline.legend.cache')),
            h('b', null, formatTokens(bucket.cacheReadTokens)),
          ),
          h(
            'div',
            { className: 'wgs-tooltip-row' },
            h('span', null, t('timeline.total')),
            h('b', null, formatTokens(bucket.totalTokens)),
          ),
          h(
            'div',
            { className: 'wgs-tooltip-row' },
            h('span', null, t('timeline.requests')),
            h('b', null, formatInt(bucket.requests)),
          ),
          h(
            'div',
            { className: 'wgs-tooltip-row' },
            h('span', null, t('timeline.cost')),
            h('b', null, formatShortMoney(bucket.cost)),
          ),
        );
      }

      const svg = h(
        'svg',
        {
          className: 'wgs-chart',
          viewBox: '0 0 ' + CHART.width + ' ' + CHART.height,
          preserveAspectRatio: 'xMidYMid meet',
          role: 'img',
          'aria-label': t('timeline.title', null, { days: days }),
        },
        h('g', null, gridLines),
        h('g', null, bars),
        count > 0
          ? h('polyline', { className: 'wgs-cost-line', points: points.join(' ') })
          : null,
        h('g', null, dots),
        h('g', null, xLabels),
        h('g', null, hovers),
      );

      return h(
        'section',
        { className: 'wgs-card' },
        head,
        h('div', { className: 'wgs-chart-wrap' }, svg, tooltip),
        h('div', { className: 'wgs-chart-note' }, t('timeline.cacheNote')),
      );
    }

    /* ============================================================
     * CPU 监控
     * ============================================================ */

    function CpuCard(props) {
      const t = props.t;
      const cpu = props.cpu;
      const history = Array.isArray(props.history) ? props.history : [];
      const head = h(
        'div',
        { className: 'wgs-section-head' },
        h(
          'div',
          null,
          h('h3', { className: 'wgs-section-title' }, t('cpu.title')),
          h('div', { className: 'wgs-section-sub' }, t('cpu.history')),
        ),
      );
      if (!cpu) {
        return h('section', { className: 'wgs-card' }, head, h('div', { className: 'wgs-empty' }, t('cpu.empty')));
      }

      const usage = clamp(num(cpu.usage, 0), 0, 100);
      const radius = 62;
      const circumference = 2 * Math.PI * radius;
      const dash = (usage / 100) * circumference;
      const cores = Array.isArray(cpu.cores) ? cpu.cores.slice(0, 32) : [];
      const coreCount = num(cpu.coreCount, cores.length);
      const memory = cpu.memory || {};
      const memoryUnit = memory.unit || 'GB';
      const load = Array.isArray(cpu.load) && cpu.load.length > 0
        ? cpu.load.map((value) => num(value, 0).toFixed(2)).join(' / ')
        : t('cpu.na');

      const ring = h(
        'svg',
        { className: 'wgs-ring', viewBox: '0 0 160 160', role: 'img', 'aria-label': t('cpu.usage') + ' ' + usage.toFixed(0) + '%' },
        h('circle', { className: 'wgs-ring-track', cx: 80, cy: 80, r: radius }),
        h('circle', {
          className: 'wgs-ring-value',
          cx: 80,
          cy: 80,
          r: radius,
          stroke: coreColor(usage),
          strokeDasharray: dash.toFixed(1) + ' ' + (circumference - dash).toFixed(1),
          transform: 'rotate(-90 80 80)',
        }),
        h('text', { className: 'wgs-ring-num', x: 80, y: 84, textAnchor: 'middle' }, usage.toFixed(0) + '%'),
        h('text', { className: 'wgs-ring-cap', x: 80, y: 104, textAnchor: 'middle' }, t('cpu.usage')),
      );

      const coreBars = cores.map((value, index) => {
        const percent = clamp(num(value, 0), 0, 100);
        return h(
          'span',
          { className: 'wgs-core', key: 'core-' + index, title: 'CPU ' + (index + 1) + ' · ' + percent.toFixed(0) + '%' },
          h('i', {
            style: {
              height: Math.max(3, percent).toFixed(1) + '%',
              background: coreColor(percent),
            },
          }),
        );
      });

      let spark = null;
      if (history.length >= 2) {
        const sparkWidth = 300;
        const sparkHeight = 52;
        const points = [];
        const areaPoints = [];
        for (let index = 0; index < history.length; index += 1) {
          const x = history.length === 1 ? 0 : (index / (history.length - 1)) * sparkWidth;
          const y = sparkHeight - (clamp(history[index], 0, 100) / 100) * (sparkHeight - 4) - 2;
          points.push(x.toFixed(1) + ',' + y.toFixed(1));
          areaPoints.push(x.toFixed(1) + ',' + y.toFixed(1));
        }
        const linePoints = points.join(' ');
        const area = 'M' + points[0] + ' L' + points.slice(1).join(' L') + ' L' + sparkWidth + ',' + sparkHeight + ' L0,' + sparkHeight + ' Z';
        spark = h(
          'svg',
          {
            className: 'wgs-spark',
            viewBox: '0 0 ' + sparkWidth + ' ' + sparkHeight,
            preserveAspectRatio: 'none',
            role: 'img',
            'aria-label': t('cpu.history'),
          },
          h('path', { className: 'wgs-spark-area', d: area }),
          h('polyline', { className: 'wgs-spark-line', points: linePoints }),
        );
      } else {
        spark = h('div', { className: 'wgs-spark-empty' }, t('cpu.history'));
      }

      const stats = [
        [t('cpu.processUptime'), formatUptime(cpu.processUptimeSec)],
        [t('cpu.uptime'), formatUptime(cpu.uptimeSec)],
        [t('cpu.processCpu'), num(cpu.processCpu, 0).toFixed(1) + '%'],
        [
          t('cpu.memory'),
          memory.total
            ? num(memory.used, 0).toFixed(1) + ' / ' + num(memory.total, 0).toFixed(1) + ' ' + memoryUnit
            : t('cpu.na'),
        ],
        [t('cpu.processMemory'), formatInt(cpu.processMemoryMB) + ' MB'],
        [t('cpu.load'), load],
      ];

      return h(
        'section',
        { className: 'wgs-card' },
        head,
        h(
          'div',
          { className: 'wgs-cpu' },
          h('div', { className: 'wgs-cpu-gauge' }, ring),
          h(
            'div',
            { className: 'wgs-cpu-main' },
            h(
              'div',
              { className: 'wgs-core-label' },
              h('span', null, t('cpu.cores', null, { n: formatInt(coreCount) })),
              h('span', null, usage > 85 ? '⚠' : ''),
            ),
            cores.length > 0
              ? h('div', { className: 'wgs-cores' }, coreBars)
              : h('div', { className: 'wgs-spark-empty' }, t('cpu.coresEmpty')),
            h('div', { className: 'wgs-spark-wrap' }, spark),
            h(
              'div',
              { className: 'wgs-stats' },
              stats.map((entry, index) =>
                h(
                  'div',
                  { className: 'wgs-stat', key: 'stat-' + index },
                  h('div', { className: 'wgs-stat-label' }, entry[0]),
                  h('div', { className: 'wgs-stat-value' }, entry[1]),
                ),
              ),
            ),
          ),
        ),
      );
    }

    /* ============================================================
     * 会话明细表
     * ============================================================ */

    function sortSessions(list, key, direction) {
      const factor = direction === 'asc' ? 1 : -1;
      const copy = Array.isArray(list) ? list.slice() : [];
      copy.sort((left, right) => {
        if (key === 'cost') return (num(left.cost, 0) - num(right.cost, 0)) * factor;
        if (key === 'totalTokens') return (num(left.totalTokens, 0) - num(right.totalTokens, 0)) * factor;
        return (num(left.updatedAt, 0) - num(right.updatedAt, 0)) * factor;
      });
      return copy;
    }

    function SessionsCard(props) {
      const t = props.t;
      const sessions = Array.isArray(props.sessions) ? props.sessions : [];
      const sort = props.sort || { key: 'updatedAt', dir: 'desc' };
      const expandedId = props.expandedId;
      const sorted = useMemo(() => sortSessions(sessions, sort.key, sort.dir), [sessions, sort.key, sort.dir]);
      const shown = sorted.slice(0, 20);

      function headerCell(key, label, right, extraClass) {
        const active = sort.key === key;
        const content = key
          ? h(
              'button',
              {
                className: 'wgs-sort',
                type: 'button',
                'data-active': active ? 'true' : 'false',
                onClick: () => props.onSort(key),
              },
              label,
              active ? (sort.dir === 'asc' ? ' ↑' : ' ↓') : '',
            )
          : label;
        return h(
          'div',
          {
            className:
              'wgs-th' +
              (right ? ' wgs-th--right' : '') +
              (extraClass ? ' ' + extraClass : ''),
            key: 'th-' + (key || label),
          },
          content,
        );
      }

      const head = h(
        'div',
        { className: 'wgs-section-head' },
        h(
          'div',
          null,
          h('h3', { className: 'wgs-section-title' }, t('sessions.title')),
          h('div', { className: 'wgs-section-sub' }, t('sessions.sub')),
        ),
        h('div', { className: 'wgs-section-sub' }, formatInt(sessions.length)),
      );

      if (sessions.length === 0) {
        return h('section', { className: 'wgs-card' }, head, h('div', { className: 'wgs-empty' }, t('sessions.empty')));
      }

      const rows = [];
      for (const session of shown) {
        const id = session.id || session.shortId || 'session-' + rows.length;
        const expanded = expandedId === id;
        const live = Boolean(session.live);
        const active = session.active !== undefined ? Boolean(session.active) : live;
        const title = session.title || session.shortId || session.id || t('sessions.col.session');
        const shortId = session.shortId || String(session.id || '').slice(0, 8);
        rows.push(
          h(
            Fragment,
            { key: 'session-' + id },
            h(
              'div',
              {
                className: 'wgs-tr wgs-row',
                role: 'button',
                tabIndex: 0,
                'data-expanded': expanded ? 'true' : 'false',
                'aria-expanded': expanded ? 'true' : 'false',
                onClick: () => props.onToggle(id),
                onKeyDown: (event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    props.onToggle(id);
                  }
                },
              },
              h(
                'div',
                { className: 'wgs-cell' },
                h('span', { className: 'wgs-session-name', title: title }, title),
                h('span', { className: 'wgs-session-id' }, '#' + shortId),
              ),
              h('div', { className: 'wgs-cell wgs-col-updated' }, formatSessionTime(session.updatedAt, t('sessions.today'))),
              h(
                'div',
                { className: 'wgs-cell wgs-session-tokens' },
                h('b', null, formatTokens(session.totalTokens)),
                h(
                  'span',
                  null,
                  formatTokens(session.inputTokens) + ' / ' + formatTokens(session.outputTokens),
                ),
              ),
              h('div', { className: 'wgs-cell wgs-session-cost' }, formatShortMoney(session.cost)),
              h(
                'div',
                { className: 'wgs-cell wgs-session-model wgs-col-model', title: session.model || '' },
                session.model || t('common.na'),
              ),
                h('div', { className: 'wgs-cell' },
                  h(
                    'span',
                    { className: 'wgs-status', 'data-live': active ? 'true' : 'false' },
                    h('span', { className: 'wgs-status-dot' }),
                    h(
                      'span',
                      { className: 'wgs-status-text' },
                      active
                        ? t('sessions.live')
                        : live
                          ? t('sessions.loaded')
                          : t('sessions.archived'),
                    ),
                  ),
                ),
            ),
            expanded
              ? h(
                  'div',
                  { className: 'wgs-session-detail' },
                  h(
                    'div',
                    { className: 'wgs-detail-grid' },
                    h(
                      'div',
                      { className: 'wgs-detail-item' },
                      h('div', { className: 'wgs-detail-label' }, t('sessions.detail.input')),
                      h('div', { className: 'wgs-detail-value' }, formatTokens(session.inputTokens)),
                    ),
                    h(
                      'div',
                      { className: 'wgs-detail-item' },
                      h('div', { className: 'wgs-detail-label' }, t('sessions.detail.output')),
                      h('div', { className: 'wgs-detail-value' }, formatTokens(session.outputTokens)),
                    ),
                    h(
                      'div',
                      { className: 'wgs-detail-item' },
                      h('div', { className: 'wgs-detail-label' }, t('sessions.detail.cacheRead')),
                      h('div', { className: 'wgs-detail-value' }, formatTokens(session.cacheReadTokens)),
                    ),
                    h(
                      'div',
                      { className: 'wgs-detail-item' },
                      h('div', { className: 'wgs-detail-label' }, t('sessions.detail.cacheWrite')),
                      h('div', { className: 'wgs-detail-value' }, formatTokens(session.cacheWriteTokens)),
                    ),
                    h(
                      'div',
                      { className: 'wgs-detail-item' },
                      h('div', { className: 'wgs-detail-label' }, t('sessions.detail.requests')),
                      h('div', { className: 'wgs-detail-value' }, formatInt(session.requests)),
                    ),
                    h(
                      'div',
                      { className: 'wgs-detail-item' },
                      h('div', { className: 'wgs-detail-label' }, t('sessions.detail.turns')),
                      h('div', { className: 'wgs-detail-value' }, formatInt(session.turns)),
                    ),
                    h(
                      'div',
                      { className: 'wgs-detail-item' },
                      h('div', { className: 'wgs-detail-label' }, t('sessions.detail.created')),
                      h('div', { className: 'wgs-detail-value' }, formatSessionTime(session.createdAt, t('sessions.today'))),
                    ),
                    h(
                      'div',
                      { className: 'wgs-detail-item' },
                      h('div', { className: 'wgs-detail-label' }, t('sessions.detail.model')),
                      h('div', { className: 'wgs-detail-value' }, session.model || t('common.na')),
                    ),
                    h(
                      'div',
                      { className: 'wgs-detail-item', style: { gridColumn: '1 / -1' } },
                      h('div', { className: 'wgs-detail-label' }, t('sessions.detail.cwd')),
                      h('div', { className: 'wgs-detail-value' }, session.cwd || t('common.na')),
                    ),
                  ),
                )
              : null,
          ),
        );
      }

      return h(
        'section',
        { className: 'wgs-card' },
        head,
        h(
          'div',
          { className: 'wgs-table-wrap' },
          h(
            'div',
            { className: 'wgs-thead' },
            headerCell(null, t('sessions.col.session')),
            headerCell('updatedAt', t('sessions.col.updated'), false, 'wgs-col-updated'),
            headerCell('totalTokens', t('sessions.col.tokens'), true),
            headerCell('cost', t('sessions.col.cost'), true),
            headerCell(null, t('sessions.col.model'), false, 'wgs-col-model'),
            headerCell(null, t('sessions.col.status')),
          ),
          h('div', { className: 'wgs-tbody' }, rows),
          sessions.length > shown.length
            ? h(
                'div',
                { className: 'wgs-table-foot' },
                t('sessions.more', null, { n: formatInt(sessions.length), shown: shown.length }),
              )
            : null,
        ),
      );
    }

    /* ============================================================
     * 设置抽屉
     * ============================================================ */

    function Field(props) {
      return h(
        'div',
        { className: 'wgs-field' },
        props.label ? h('label', null, props.label) : null,
        props.children,
        props.hint ? h('small', null, props.hint) : null,
      );
    }

    function SettingsDrawer(props) {
      const t = props.t;
      const onClose = props.onClose;
      const onSaved = props.onSaved;
      const [form, setForm] = useState(() => formFromConfig({}));
      const [loading, setLoading] = useState(true);
      const [loadError, setLoadError] = useState('');
      const [editable, setEditable] = useState(true);
      const [saving, setSaving] = useState(false);
      const [note, setNote] = useState('');
      const [noteError, setNoteError] = useState(false);
      const aliveRef = useRef(true);
      const closeTimer = useRef(0);

      useEffect(() => {
        aliveRef.current = true;
        fetchJson('/config')
          .then((data) => {
            if (!aliveRef.current) return;
            setForm(formFromConfig(data && data.config));
            setEditable(!data || data.editable !== false);
            setLoading(false);
          })
          .catch((error) => {
            if (!aliveRef.current) return;
            setLoadError(String((error && error.message) || error));
            setEditable(false);
            setLoading(false);
          });
        return () => {
          aliveRef.current = false;
          if (closeTimer.current) window.clearTimeout(closeTimer.current);
        };
      }, []);

      const update = useCallback((name, value) => {
        setForm((previous) => {
          const next = {};
          for (const key in previous) {
            if (Object.prototype.hasOwnProperty.call(previous, key)) next[key] = previous[key];
          }
          next[name] = value;
          return next;
        });
      }, []);

      const save = useCallback(async () => {
        if (saving || !editable) return;
        setSaving(true);
        setNote('');
        setNoteError(false);
        try {
          await fetchJson('/config', {
            method: 'POST',
            body: JSON.stringify({ config: patchFromForm(form) }),
          });
          setNote(t('settings.saved'));
          closeTimer.current = window.setTimeout(() => {
            onClose();
            if (onSaved) onSaved();
          }, 1400);
        } catch (error) {
          setNoteError(true);
          setNote(t('settings.failed') + String((error && error.message) || error));
        } finally {
          setSaving(false);
        }
      }, [editable, form, onClose, onSaved, saving, t]);

      return h(
        'div',
        {
          className: 'wgs-drawer',
          onMouseDown: (event) => {
            if (event.target === event.currentTarget) onClose();
          },
        },
        h(
          'section',
          {
            className: 'wgs-drawer-panel',
            role: 'dialog',
            'aria-modal': 'true',
            'aria-label': t('settings.title'),
            onMouseDown: (event) => event.stopPropagation(),
          },
          h(
            'header',
            { className: 'wgs-drawer-head' },
            h('h3', { className: 'wgs-drawer-title' }, t('settings.title')),
            h(
              'button',
              {
                className: 'wgs-icon-btn',
                type: 'button',
                title: t('settings.close'),
                'aria-label': t('settings.close'),
                onClick: onClose,
              },
              h(Icon, { kind: 'close' }),
            ),
          ),
          h(
            'div',
            { className: 'wgs-drawer-body' },
            h('div', { className: 'wgs-note' }, t('settings.note')),
            loading
              ? h('div', { className: 'wgs-empty' }, t('settings.loading'))
              : h(
                  Fragment,
                  null,
                  loadError
                    ? h('div', { className: 'wgs-warning' }, t('settings.loadFailed') + loadError)
                    : null,
                  !editable
                    ? h('div', { className: 'wgs-warning' }, t('settings.notEditable'))
                    : null,
                  h(
                    'div',
                    { className: 'wgs-form-group' },
                    h('div', { className: 'wgs-form-group-title' }, t('settings.budget')),
                    h(
                      'div',
                      { className: 'wgs-grid2' },
                      h(
                        Field,
                        { label: t('settings.budgetAmount') },
                        h('input', {
                          className: 'wgs-input',
                          type: 'number',
                          min: 0,
                          step: 1,
                          value: form.budgetAmount,
                          disabled: !editable,
                          onChange: (event) => update('budgetAmount', event.target.value),
                        }),
                      ),
                      h(
                        Field,
                        { label: t('settings.budgetPeriod') },
                        h(
                          'select',
                          {
                            className: 'wgs-select',
                            value: form.budgetPeriod,
                            disabled: !editable,
                            onChange: (event) => update('budgetPeriod', event.target.value),
                          },
                          h('option', { value: 'month' }, t('settings.period.month')),
                          h('option', { value: 'total' }, t('settings.period.total')),
                        ),
                      ),
                    ),
                  ),
        h(
          'div',
          { className: 'wgs-form-group' },
          h('div', { className: 'wgs-form-group-title' }, t('settings.pricing')),
          h(
            Field,
            { label: t('settings.priceMode'), hint: t('settings.priceModeHint') },
            h(
              'select',
              {
                className: 'wgs-select',
                value: form.pricingMode,
                disabled: !editable,
                onChange: (event) => update('pricingMode', event.target.value),
              },
              h('option', { value: 'official' }, t('settings.mode.official')),
              h('option', { value: 'custom' }, t('settings.mode.custom')),
            ),
          ),
          h(
            'div',
            { className: 'wgs-grid2' },
            h(
              Field,
              { label: t('settings.inputPerM') },
              h('input', {
                className: 'wgs-input',
                type: 'number',
                min: 0,
                step: 0.01,
                value: form.inputPerM,
                disabled: !editable || form.pricingMode !== 'custom',
                onChange: (event) => update('inputPerM', event.target.value),
              }),
            ),
            h(
              Field,
              { label: t('settings.outputPerM') },
              h('input', {
                className: 'wgs-input',
                type: 'number',
                min: 0,
                step: 0.01,
                value: form.outputPerM,
                disabled: !editable || form.pricingMode !== 'custom',
                onChange: (event) => update('outputPerM', event.target.value),
              }),
            ),
            h(
              Field,
              { label: t('settings.cacheReadPerM') },
              h('input', {
                className: 'wgs-input',
                type: 'number',
                min: 0,
                step: 0.01,
                value: form.cacheReadPerM,
                disabled: !editable || form.pricingMode !== 'custom',
                onChange: (event) => update('cacheReadPerM', event.target.value),
              }),
            ),
            h(
              Field,
              { label: t('settings.cacheWritePerM') },
              h('input', {
                className: 'wgs-input',
                type: 'number',
                min: 0,
                step: 0.01,
                value: form.cacheWritePerM,
                disabled: !editable || form.pricingMode !== 'custom',
                onChange: (event) => update('cacheWritePerM', event.target.value),
              }),
            ),
          ),
          h('div', { className: 'wgs-note' }, t('settings.officialNote')),
        ),
                  h(
                    'div',
                    { className: 'wgs-form-group' },
                    h('div', { className: 'wgs-form-group-title' }, t('settings.character')),
                    h(
                      'div',
                      { className: 'wgs-grid2' },
                      h(
                        Field,
                        { label: t('settings.tokensPerBowl') },
                        h('input', {
                          className: 'wgs-input',
                          type: 'number',
                          min: 1,
                          step: 500,
                          value: form.tokensPerBowl,
                          disabled: !editable,
                          onChange: (event) => update('tokensPerBowl', event.target.value),
                        }),
                      ),
                      h(
                        Field,
                        { label: t('settings.timelineDays') },
                        h(
                          'select',
                          {
                            className: 'wgs-select',
                            value: form.timelineDays,
                            disabled: !editable,
                            onChange: (event) => update('timelineDays', event.target.value),
                          },
                          h('option', { value: '7' }, t('settings.days7')),
                          h('option', { value: '14' }, t('settings.days14')),
                          h('option', { value: '30' }, t('settings.days30')),
                        ),
                      ),
                    ),
                  ),
                  h(
                    'div',
                    { className: 'wgs-save-row' },
                    h(
                      'button',
                      {
                        className: 'wgs-btn-primary',
                        type: 'button',
                        disabled: saving || !editable,
                        onClick: save,
                      },
                      saving ? t('settings.saving') : t('settings.save'),
                    ),
                    h(
                      'button',
                      { className: 'wgs-btn-ghost', type: 'button', onClick: onClose },
                      t('common.close'),
                    ),
                  ),
                  note
                    ? h('div', { className: 'wgs-save-note', 'data-error': noteError ? 'true' : 'false' }, note)
                    : null,
                  h('div', { className: 'wgs-note' }, t('settings.reloadHint')),
                ),
          ),
        ),
      );
    }

    /* ============================================================
     * 骨架屏
     * ============================================================ */

    function Skeleton() {
      const cards = [];
      for (let index = 0; index < 4; index += 1) {
        cards.push(h('div', { key: 'skel-kpi-' + index, className: 'wgs-skel wgs-skel-card' }));
      }
      return h(
        Fragment,
        null,
        h('div', { className: 'wgs-skel-kpis' }, cards),
        h('div', { className: 'wgs-skel wgs-skel-chart' }),
        h('div', { className: 'wgs-skel wgs-skel-cpu' }),
        h('div', { className: 'wgs-skel wgs-skel-table' }),
      );
    }

    /* ============================================================
     * 侧边栏入口按钮
     * ============================================================ */

    function FooterAction(props) {
      const t = useTranslator(props);
      const open = usePanelOpen();
      const wide = !(props && props.wide === false);
      return h(
        Fragment,
        null,
        h('style', { key: 'wgs-style', 'data-wgs-package': PACKAGE_ID }, CSS),
        h(
          'button',
          {
            className: 'wgs-footer-btn',
            type: 'button',
            'data-open': open ? 'true' : 'false',
            'aria-haspopup': 'dialog',
            'aria-expanded': open ? 'true' : 'false',
            'aria-label': open ? t('header.close') : t('entry.title'),
            title: t('entry.title'),
            onClick: () => setPanelOpen(!panelState.open),
          },
          h('span', { className: 'wgs-footer-icon', 'aria-hidden': true }, h(Icon, { kind: 'bowl', size: 17 })),
          wide ? h('span', { className: 'wgs-footer-text' }, t('entry.label')) : null,
        ),
      );
    }

    /* ============================================================
     * 常驻浮标：侧边栏footer在部分窗口高度下会落在折叠线以下，
     * 这个左下角小浮标保证账本始终可打开。
     * ============================================================ */

    const LAUNCHER_POS_KEY = 'whale-girl-stats:launcher-position';
    const LAUNCHER_SIZE = { width: 214, height: 82 };

    function readLauncherPosition() {
      try {
        const stored = JSON.parse(window.localStorage.getItem(LAUNCHER_POS_KEY) || 'null');
        if (stored && Number.isFinite(stored.x) && Number.isFinite(stored.y)) {
          return { x: stored.x, y: stored.y };
        }
      } catch (error) {
        /* A broken stored position falls back to the default corner. */
      }
      return null;
    }

    function clampLauncherPosition(x, y, width, height) {
      const viewportWidth = window.innerWidth || 1280;
      const viewportHeight = window.innerHeight || 800;
      const maxX = Math.max(8, viewportWidth - width - 8);
      const maxY = Math.max(8, viewportHeight - height - 8);
      return {
        x: Math.round(clamp(x, 8, maxX)),
        y: Math.round(clamp(y, 8, maxY)),
      };
    }

    function Launcher(props) {
      const t = useTranslator(props);
      const open = usePanelOpen();
      const rootRef = useRef(null);
      const positionRef = useRef(null);
      const dragRef = useRef(null);
      const [position, setPosition] = useState(readLauncherPosition);
      const [dragging, setDragging] = useState(false);
      const [summary, setSummary] = useState({ ready: false, online: false, tokens: 0, cost: 0 });

      useEffect(() => {
        positionRef.current = position;
      }, [position]);

      // Keep the saved position inside the viewport after resize.
      useEffect(() => {
        if (!position) return undefined;
        const element = rootRef.current;
        if (!element) return undefined;
        const rect = element.getBoundingClientRect();
        const next = clampLauncherPosition(position.x, position.y, rect.width, rect.height);
        if (next.x !== position.x || next.y !== position.y) setPosition(next);
        return undefined;
      }, []);

      useEffect(() => {
        const onResize = () => {
          const element = rootRef.current;
          const current = positionRef.current;
          if (!element || !current) return;
          const rect = element.getBoundingClientRect();
          setPosition(clampLauncherPosition(current.x, current.y, rect.width, rect.height));
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
      }, []);

      // The mini window owns a slow poll while the full panel is closed.
      useEffect(() => {
        if (open) return undefined;
        let alive = true;
        let timer = 0;
        const load = async () => {
          try {
            const data = await fetchJson('/overview');
            if (!alive) return;
            const totals = data && data.totals ? data.totals : {};
            setSummary({
              ready: true,
              online: true,
              tokens: totalTokensOf(data),
              cost: num(totals.cost, 0),
            });
          } catch (error) {
            if (alive) setSummary((previous) => ({ ...previous, online: false }));
          } finally {
            if (alive) timer = window.setTimeout(load, 5000);
          }
        };
        load();
        return () => {
          alive = false;
          window.clearTimeout(timer);
        };
      }, [open]);

      const beginDrag = (event) => {
        if (event && event.button !== undefined && event.button !== 0) return;
        const element = rootRef.current;
        if (!element) return;
        const rect = element.getBoundingClientRect();
        dragRef.current = {
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          originX: rect.left,
          originY: rect.top,
          width: rect.width,
          height: rect.height,
          moved: false,
        };
        setDragging(true);
        try {
          element.setPointerCapture(event.pointerId);
        } catch (error) {
          /* Pointer capture is an enhancement; the document still tracks moves. */
        }
      };

      const moveDrag = (event) => {
        const drag = dragRef.current;
        if (!drag || drag.pointerId !== event.pointerId) return;
        const dx = event.clientX - drag.startX;
        const dy = event.clientY - drag.startY;
        if (!drag.moved && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) drag.moved = true;
        if (!drag.moved) return;
        if (event.cancelable) event.preventDefault();
        setPosition(clampLauncherPosition(drag.originX + dx, drag.originY + dy, drag.width, drag.height));
      };

      const endDrag = (event) => {
        const drag = dragRef.current;
        if (!drag || drag.pointerId !== event.pointerId) return;
        dragRef.current = null;
        setDragging(false);
        const element = rootRef.current;
        try {
          if (element) element.releasePointerCapture(event.pointerId);
        } catch (error) {
          /* Already released. */
        }
        if (!drag.moved) {
          setPanelOpen(true);
          return;
        }
        const rect = element
          ? element.getBoundingClientRect()
          : { left: drag.originX, top: drag.originY, width: drag.width, height: drag.height };
        const next = clampLauncherPosition(rect.left, rect.top, drag.width, drag.height);
        setPosition(next);
        try {
          window.localStorage.setItem(LAUNCHER_POS_KEY, JSON.stringify(next));
        } catch (error) {
          /* Position persistence is best effort. */
        }
      };

      const cancelDrag = () => {
        dragRef.current = null;
        setDragging(false);
      };

      if (open) return null;

      const style = position
        ? { left: position.x + 'px', top: position.y + 'px', bottom: 'auto' }
        : undefined;

      return h(
        'div',
        {
          ref: rootRef,
          className: 'wgs-launcher',
          role: 'button',
          tabIndex: 0,
          style: style,
          title: t('launcher.hint'),
          'aria-label': t('launcher.hint'),
          'aria-haspopup': 'dialog',
          'aria-expanded': 'false',
          'data-dragging': dragging ? 'true' : 'false',
          onPointerDown: beginDrag,
          onPointerMove: moveDrag,
          onPointerUp: endDrag,
          onPointerCancel: cancelDrag,
          onKeyDown: (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setPanelOpen(true);
            }
          },
        },
        h(
          'div',
          { className: 'wgs-launcher-top' },
          h('span', { className: 'wgs-launcher-icon', 'aria-hidden': true }, h(Icon, { kind: 'bowl', size: 19 })),
          h('span', { className: 'wgs-launcher-title' }, t('entry.label')),
          h('span', {
            className: 'wgs-launcher-dot',
            'aria-hidden': true,
            title: summary.online ? t('header.live') : t('header.offline'),
          }),
          h('span', { className: 'wgs-launcher-grip', 'aria-hidden': true }, '⋮⋮'),
        ),
        h(
          'div',
          { className: 'wgs-launcher-metrics' },
          h(
            'div',
            { className: 'wgs-launcher-metric' },
            h('span', { className: 'wgs-launcher-label' }, t('launcher.used')),
            h('span', { className: 'wgs-launcher-value' }, summary.ready ? formatTokens(summary.tokens) : '—'),
          ),
          h(
            'div',
            { className: 'wgs-launcher-metric' },
            h('span', { className: 'wgs-launcher-label' }, t('launcher.cost')),
            h(
              'span',
              { className: 'wgs-launcher-value wgs-launcher-value--cost' },
              summary.ready ? formatShortMoney(summary.cost) : '—',
            ),
          ),
        ),
      );
    }

    /* ============================================================
     * 统计面板（shell.overlay）
     * ============================================================ */    function Dashboard(props) {
      const t = useTranslator(props);
      const open = usePanelOpen();
      const rootRef = useRef(null);
      const mountedRef = useRef(true);
      const previousTotalRef = useRef(null);
      const lastGrowthRef = useRef(0);
      const overviewRef = useRef(null);
      const settingsOpenRef = useRef(false);

      const [overview, setOverview] = useState(null);
      const [status, setStatus] = useState('loading');
      const [errorMessage, setErrorMessage] = useState('');
      const [lastSuccessAt, setLastSuccessAt] = useState(0);
      const [refreshing, setRefreshing] = useState(false);
      const [cpuHistory, setCpuHistory] = useState([]);
      const [eating, setEating] = useState(false);
      const [intensity, setIntensity] = useState(0);
      const [pulse, setPulse] = useState(0);
      const [bubbleSeed, setBubbleSeed] = useState(0);
      const [settingsOpen, setSettingsOpen] = useState(false);
      const [sort, setSort] = useState({ key: 'updatedAt', dir: 'desc' });
      const [expandedId, setExpandedId] = useState(null);
      const [idleFailed, setIdleFailed] = useState(false);
      const [eatingFailed, setEatingFailed] = useState(false);
      const [avatarFailed, setAvatarFailed] = useState(false);

      useEffect(() => {
        mountedRef.current = true;
        return () => {
          mountedRef.current = false;
        };
      }, []);

      useEffect(() => {
        settingsOpenRef.current = settingsOpen;
      }, [settingsOpen]);

      const applySnapshot = useCallback((data) => {
        if (!data || typeof data !== 'object') return;
        const tokens = totalTokensOf(data);
        const previous = previousTotalRef.current;
        previousTotalRef.current = tokens;
        setOverview(data);
        overviewRef.current = data;
        setStatus('online');
        setErrorMessage('');
        setLastSuccessAt(Date.now());

        const cpu = data.cpu || {};
        if (typeof cpu.usage === 'number' && isFinite(cpu.usage)) {
          setCpuHistory((history) => {
            const next = history.concat([clamp(cpu.usage, 0, 100)]);
            return next.length > CPU_HISTORY_MAX ? next.slice(next.length - CPU_HISTORY_MAX) : next;
          });
        }

        const rate = data.rate || {};
        const active = Boolean(rate.active) && num(rate.tokensPerMin, 0) > 0;
        if (previous !== null && tokens > previous) {
          const delta = tokens - previous;
          lastGrowthRef.current = Date.now();
          setPulse((value) => value + 1);
          setIntensity(clamp(delta / 120000, 0.25, 1));
          setEating(true);
        } else if (previous !== null && active) {
          lastGrowthRef.current = Math.max(lastGrowthRef.current, Date.now() - 5000);
          setEating(true);
        }
        const character = data.character || {};
        const hostState = character.state;
        if (previous === null && (hostState === 'eating' || hostState === 'feast' || active)) {
          lastGrowthRef.current = Date.now() - 4000;
          setEating(true);
        }
      }, []);

      /* 轮询：打开时立即拉取，隐藏页面暂停，关闭时停止 */
      useEffect(() => {
        if (!open) return undefined;
        let alive = true;
        let timer = 0;
        let inFlight = false;

        const clearTimer = () => {
          if (timer) {
            window.clearTimeout(timer);
            timer = 0;
          }
        };
        const schedule = () => {
          if (!alive) return;
          clearTimer();
          if (document.visibilityState === 'hidden') return;
          timer = window.setTimeout(tick, POLL_MS);
        };
        const tick = async () => {
          if (!alive || inFlight) return;
          inFlight = true;
          try {
            const data = await fetchJson('/overview');
            if (!alive) return;
            applySnapshot(data);
          } catch (error) {
            if (!alive) return;
            setStatus('offline');
            setErrorMessage(describeError(error));
          } finally {
            inFlight = false;
            if (alive) schedule();
          }
        };

        if (!overviewRef.current) setStatus('loading');
        setCpuHistory([]);
        tick();

        const onVisibility = () => {
          if (document.visibilityState === 'visible') {
            tick();
          } else {
            clearTimer();
          }
        };
        document.addEventListener('visibilitychange', onVisibility);
        return () => {
          alive = false;
          clearTimer();
          document.removeEventListener('visibilitychange', onVisibility);
        };
      }, [open, applySnapshot]);

      /* 语气泡轮换 */
      useEffect(() => {
        if (!open) return undefined;
        const timer = window.setInterval(() => setBubbleSeed((value) => value + 1), 7000);
        return () => window.clearInterval(timer);
      }, [open]);

      /* 至少干饭 12 秒；Host 仍报告进食/速率时继续 */
      useEffect(() => {
        if (!open || !eating) return undefined;
        const timer = window.setInterval(() => {
          const current = overviewRef.current;
          const rate = current && current.rate ? current.rate : {};
          const character = current && current.character ? current.character : {};
          const hostEating = character.state === 'eating' || character.state === 'feast';
          const active = Boolean(rate.active) && num(rate.tokensPerMin, 0) > 0;
          const sinceGrowth = Date.now() - lastGrowthRef.current;
          if (sinceGrowth >= 20000) {
            setEating(false);
          } else if (sinceGrowth >= EATING_MS && !hostEating && !active) {
            setEating(false);
          }
        }, 1000);
        return () => window.clearInterval(timer);
      }, [open, eating]);

      /* Esc 关闭 + 锁定 body 滚动 + 焦点 */
      useEffect(() => {
        if (!open) return undefined;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKeyDown = (event) => {
          if (!event || event.key !== 'Escape') return;
          event.stopPropagation();
          if (event.preventDefault) event.preventDefault();
          if (settingsOpenRef.current) {
            setSettingsOpen(false);
          } else {
            setPanelOpen(false);
          }
        };
        window.addEventListener('keydown', onKeyDown, true);
        const focusTimer = window.setTimeout(() => {
          if (rootRef.current && typeof rootRef.current.focus === 'function') rootRef.current.focus();
        }, 60);
        return () => {
          document.body.style.overflow = previousOverflow;
          window.removeEventListener('keydown', onKeyDown, true);
          window.clearTimeout(focusTimer);
        };
      }, [open]);

      const refresh = useCallback(async () => {
        if (refreshing) return;
        setRefreshing(true);
        try {
          const data = await fetchJson('/overview');
          if (!mountedRef.current) return;
          applySnapshot(data);
        } catch (error) {
          if (!mountedRef.current) return;
          setStatus('offline');
          setErrorMessage(describeError(error));
        } finally {
          if (mountedRef.current) setRefreshing(false);
        }
      }, [applySnapshot, refreshing]);

      const onSettingsSaved = useCallback(() => {
        window.setTimeout(() => {
          if (mountedRef.current) refresh();
        }, 1400);
      }, [refresh]);

      const changeSort = useCallback((key) => {
        setSort((current) =>
          current.key === key
            ? { key: key, dir: current.dir === 'desc' ? 'asc' : 'desc' }
            : { key: key, dir: 'desc' },
        );
      }, []);

      const toggleSession = useCallback((id) => {
        setExpandedId((current) => (current === id ? null : id));
      }, []);

      const closePanel = useCallback(() => setPanelOpen(false), []);

      if (!open) return null;

      const data = overview;
      const pricingMode =
        data && data.config && data.config.pricing && data.config.pricing.mode === 'custom'
          ? 'custom'
          : 'official';
      const character = data && data.character ? data.character : {};
      const sessions = data && Array.isArray(data.sessions) ? data.sessions : [];
      const timeline = data && data.timeline ? data.timeline : null;
      const cpu = data && data.cpu ? data.cpu : null;
      const hostState = character.state;
      const eatingActive = eating;
      const speed = speedFromRate(data);
      const feast = eatingActive && (hostState === 'feast' || speed >= 1.9);
      const available = !data || data.available !== false;
      const showSkeleton = !data && status !== 'offline';
      const statusText =
        status === 'online'
          ? t('header.online')
          : status === 'loading'
            ? t('header.connecting')
            : t('header.offline');

      const banners = [];
      if (status === 'offline') {
        banners.push(
          h(
            'div',
            { className: 'wgs-banner', key: 'banner-offline' },
            h('div', { className: 'wgs-banner-title' }, t('state.offline')),
            errorMessage ? h('div', { className: 'wgs-banner-sub' }, errorMessage) : null,
            data ? h('div', { className: 'wgs-banner-sub' }, t('state.offlineHint')) : null,
          ),
        );
      }
      if (!available) {
        banners.push(
          h(
            'div',
            { className: 'wgs-banner', key: 'banner-unavailable' },
            h('div', { className: 'wgs-banner-title' }, t('state.unavailable')),
            h('div', { className: 'wgs-banner-sub' }, t('state.unavailableHint')),
          ),
        );
      }
      if (data && data.totals && num(data.totals.unpricedRequests, 0) > 0) {
        banners.push(
          h(
            'div',
            { className: 'wgs-banner', 'data-kind': 'info', key: 'banner-unpriced' },
            h('div', { className: 'wgs-banner-title' }, t('state.unpriced')),
            h(
              'div',
              { className: 'wgs-banner-sub' },
              t('state.unpricedHint', null, { n: formatInt(num(data.totals.unpricedRequests, 0)) }),
            ),
          ),
        );
      }
      if (showSkeleton) {
        banners.push(
          h(
            'div',
            { className: 'wgs-banner', 'data-kind': 'info', key: 'banner-loading' },
            h('div', { className: 'wgs-banner-title' }, t('state.loading')),
          ),
        );
      }

      const idleError = () => {
        if (!idleFailed) setIdleFailed(true);
        else if (!eatingFailed) setEatingFailed(true);
      };
      const eatingError = () => {
        if (!eatingFailed) setEatingFailed(true);
        else if (!idleFailed) setIdleFailed(true);
      };

      return h(
        'div',
        {
          className: 'wgs-root',
          onMouseDown: (event) => {
            if (event.target === event.currentTarget) closePanel();
          },
        },
        h(
          'section',
          {
            className: 'wgs-shell',
            role: 'dialog',
            'aria-modal': 'true',
            'aria-label': t('header.title'),
            tabIndex: -1,
            ref: rootRef,
            onMouseDown: (event) => event.stopPropagation(),
          },
          h(
            'header',
            { className: 'wgs-head' },
            h(
              'div',
              { className: 'wgs-head-avatar' },
              avatarFailed
                ? h('span', { className: 'wgs-avatar-fallback' }, '汐')
                : h('img', {
                    src: API + '/assets/avatar.webp',
                    alt: t('header.avatarAlt'),
                    onError: () => setAvatarFailed(true),
                  }),
            ),
            h(
              'div',
              { className: 'wgs-head-text' },
              h('h2', { className: 'wgs-head-title' }, t('header.title')),
              h(
                'div',
                { className: 'wgs-head-sub' },
                h('span', { className: 'wgs-dot', 'data-state': status, 'aria-hidden': true }),
                h('span', null, statusText),
                h('span', { className: 'wgs-head-sep' }, '·'),
                h('span', null, t('header.subtitle')),
                lastSuccessAt
                  ? h('span', { className: 'wgs-head-sep' }, '·')
                  : null,
                lastSuccessAt
                  ? h('span', null, t('header.updated', null, { time: formatClock(lastSuccessAt) }))
                  : null,
              ),
            ),
            h(
              'div',
              { className: 'wgs-head-actions' },
              h(
                'button',
                {
                  className: 'wgs-icon-btn',
                  type: 'button',
                  title: t('header.refresh'),
                  'aria-label': t('header.refresh'),
                  'data-spin': refreshing ? 'true' : 'false',
                  disabled: refreshing,
                  onClick: refresh,
                },
                h(Icon, { kind: 'refresh', size: 15 }),
              ),
              h(
                'button',
                {
                  className: 'wgs-icon-btn wgs-icon-btn--gold',
                  type: 'button',
                  title: t('header.settings'),
                  'aria-label': t('header.settings'),
                  onClick: () => setSettingsOpen(true),
                },
                h(Icon, { kind: 'settings', size: 15 }),
              ),
              h(
                'button',
                {
                  className: 'wgs-icon-btn',
                  type: 'button',
                  title: t('header.close'),
                  'aria-label': t('header.close'),
                  onClick: closePanel,
                },
                h(Icon, { kind: 'close', size: 15 }),
              ),
            ),
          ),
          h(
            'div',
            { className: 'wgs-body' },
            banners.length > 0 ? banners : null,
            h(Hero, {
              t: t,
              data: data,
              status: status,
              eating: eatingActive,
              feast: feast,
              speed: speed,
              intensity: intensity,
              pulse: pulse,
              bubbleSeed: bubbleSeed,
              idleFailed: idleFailed,
              eatingFailed: eatingFailed,
              onIdleError: idleError,
              onEatingError: eatingError,
            }),
            showSkeleton
              ? h(Skeleton)
              : h(
                  Fragment,
                  null,
                  h(KpiGrid, { t: t, data: data }),
                  h(TimelineCard, { t: t, timeline: timeline }),
                  h(CpuCard, { t: t, cpu: cpu, history: cpuHistory }),
                  h(SessionsCard, {
                    t: t,
                    sessions: sessions,
                    sort: sort,
                    onSort: changeSort,
                    expandedId: expandedId,
                    onToggle: toggleSession,
                  }),
                  h(
                    'div',
                    { className: 'wgs-footer-note' },
                    t('header.subtitle') +
                      (data && data.version ? ' · v' + data.version : '') +
                      (data && data.currency ? ' · ' + data.currency : ''),
                  ),
                ),
          ),
          settingsOpen
            ? h(SettingsDrawer, {
                t: t,
                onClose: () => setSettingsOpen(false),
                onSaved: onSettingsSaved,
              })
            : null,
        ),
      );
    }

    /* ============================================================
     * 注册
     * ============================================================ */

    function registerSafely(ctx, slot, component, options, label) {
      try {
        return ctx.slots.inject(slot, () => {
          try {
            return ctx.slots.register({ name: slot, ...options }, component);
          } catch (error) {
            console.warn('[whale-girl-stats] Could not register ' + label + ':', error);
            return () => {};
          }
        });
      } catch (error) {
        console.warn('[whale-girl-stats] Could not wait for ' + label + ':', error);
        return () => {};
      }
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => {
          try {
            return ctx.locale.register(LOCALE_NS, DICTS);
          } catch (error) {
            console.warn('[whale-girl-stats] Could not register locale copy:', error);
            return () => {};
          }
        }, 'whale-girl-stats: locale');

        ctx.effect(
          () =>
            registerSafely(
              ctx,
              'sidebar.footer.action',
              FooterAction,
              { id: 'whale-stats.footer', order: 120, locale: LOCALE_NS },
              'the sidebar ledger entry',
            ),
          'whale-girl-stats: sidebar entry',
        );

        ctx.effect(
          () =>
            registerSafely(
              ctx,
              'shell.overlay',
              Launcher,
              { id: 'whale-stats.launcher', order: 858, locale: LOCALE_NS },
              'the ledger launcher',
            ),
          'whale-girl-stats: ledger launcher',
        );

        ctx.effect(
          () =>
            registerSafely(
              ctx,
              'shell.overlay',
              Dashboard,
              { id: 'whale-stats.dashboard', order: 860, locale: LOCALE_NS },
              'the statistics panel',
            ),
          'whale-girl-stats: statistics panel',
        );
      },
    };
  },
});
