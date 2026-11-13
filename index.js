import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import os from 'node:os';

const VERSION = '1.3.0';
const API = '/api/whale-girl-stats';
const CURRENCY = 'CNY';
const RATE_WINDOW_MS = 60 * 1000;
const PRICE_VERSION = '2026-11-11';

// Official DeepSeek CNY prices, per 1M tokens. Peak/off-peak is selected per
// assistant message from its own timestamp (Asia/Shanghai), never per session.
const DEEPSEEK_PRICING = {
  'deepseek-flash': {
    peak: { inputPerM: 2, outputPerM: 8, cacheReadPerM: 0.04 },
    offPeak: { inputPerM: 1, outputPerM: 4, cacheReadPerM: 0.02 },
  },
  'deepseek-v4-pro': {
    peak: { inputPerM: 9, outputPerM: 27, cacheReadPerM: 0.3 },
    offPeak: { inputPerM: 4.5, outputPerM: 13.5, cacheReadPerM: 0.15 },
  },
};
const DEEPSEEK_MODEL_ALIASES = {
  'deepseek-v4-flash': 'deepseek-flash',
  'deepseek-v4-flash-vision-exp': 'deepseek-flash',
};
// Chinese statutory holidays in 2026 (State Council notice 国办发明电〔2025〕7号).
// DeepSeek treats these as off-peak even when they fall on a weekday.
const CHINA_HOLIDAYS_2026 = new Set([
  '2026-01-01', '2026-01-02', '2026-01-03',
  '2026-02-15', '2026-02-16', '2026-02-17', '2026-02-18', '2026-02-19',
  '2026-02-20', '2026-02-21', '2026-02-22', '2026-02-23',
  '2026-04-04', '2026-04-05', '2026-04-06',
  '2026-05-01', '2026-05-02', '2026-05-03', '2026-05-04', '2026-05-05',
  '2026-06-19', '2026-06-20', '2026-06-21',
  '2026-09-25', '2026-09-26', '2026-09-27',
  '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05',
  '2026-10-06', '2026-10-07',
]);

const DEFAULT_CONFIG = {
  enabled: true,
  includeSubagents: true,
  budget: {
    amount: 50,
    period: 'month',
    dailyAmount: 0,
    alertThresholds: [80, 100],
    webhookUrl: '',
    notify: false,
  },
  pricing: {
    mode: 'official',
    inputPerM: 2,
    outputPerM: 8,
    cacheReadPerM: 0.04,
    cacheWritePerM: 2,
  },
  tokensPerBowl: 8000,
  timelineDays: 14,
};

const ASSETS = new Map([
  ['eating.webp', 'image/webp'],
  ['idle.webp', 'image/webp'],
  ['avatar.webp', 'image/webp'],
]);

const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

function number(value, fallback, min, max) {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value ?? ''));
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function integer(value, fallback, min, max) {
  return Math.round(number(value, fallback, min, max));
}

function isPeakTime(ms) {
  const date = new Date((Number(ms) || Date.now()) + 8 * 60 * 60 * 1000);
  const weekday = date.getUTCDay();
  if (weekday === 0 || weekday === 6) return false;
  const dateKey = `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;
  if (CHINA_HOLIDAYS_2026.has(dateKey)) return false;
  const hour = date.getUTCHours() + date.getUTCMinutes() / 60;
  return (hour >= 9 && hour < 12) || (hour >= 14 && hour < 18);
}

function normalizeModel(model) {
  const value = String(model || '').trim().toLowerCase();
  return DEEPSEEK_MODEL_ALIASES[value] || value;
}

function officialRates(model, time) {
  const table = DEEPSEEK_PRICING[normalizeModel(model)];
  if (!table) return null;
  const peak = isPeakTime(time);
  return { ...(peak ? table.peak : table.offPeak), peak };
}

function normalizeThresholds(value) {
  const source = Array.isArray(value)
    ? value
    : String(value == null ? '' : value).split(/[\s,，]+/).filter(Boolean);
  const thresholds = [...new Set(source
    .map((item) => Math.round(Number.parseFloat(String(item))))
    .filter((item) => Number.isFinite(item) && item >= 1 && item <= 100))]
    .sort((a, b) => a - b);
  return thresholds.length > 0 ? thresholds : [...DEFAULT_CONFIG.budget.alertThresholds];
}

function workspaceLabel(cwd) {
  const path = String(cwd || '').replace(/[\\/]+$/, '');
  if (!path) return '未知工作区';
  const parts = path.split(/[\\/]/).filter(Boolean);
  return parts[parts.length - 1] || path;
}

function mergeConfig(raw) {
  const input = isRecord(raw) ? raw : {};
  const budget = isRecord(input.budget) ? input.budget : {};
  const pricing = isRecord(input.pricing) ? input.pricing : {};
  return {
    enabled: typeof input.enabled === 'boolean' ? input.enabled : DEFAULT_CONFIG.enabled,
    includeSubagents: typeof input.includeSubagents === 'boolean' ? input.includeSubagents : DEFAULT_CONFIG.includeSubagents,
    budget: {
      amount: number(budget.amount, DEFAULT_CONFIG.budget.amount, 0, 1e9),
      period: budget.period === 'total' ? 'total' : 'month',
      dailyAmount: number(budget.dailyAmount, DEFAULT_CONFIG.budget.dailyAmount, 0, 1e9),
      alertThresholds: normalizeThresholds(budget.alertThresholds),
      webhookUrl: typeof budget.webhookUrl === 'string' ? budget.webhookUrl.trim().slice(0, 500) : '',
      notify: budget.notify === true,
    },
    pricing: {
      mode: pricing.mode === 'custom' ? 'custom' : 'official',
      inputPerM: number(pricing.inputPerM, DEFAULT_CONFIG.pricing.inputPerM, 0, 1e6),
      outputPerM: number(pricing.outputPerM, DEFAULT_CONFIG.pricing.outputPerM, 0, 1e6),
      cacheReadPerM: number(pricing.cacheReadPerM, DEFAULT_CONFIG.pricing.cacheReadPerM, 0, 1e6),
      cacheWritePerM: number(pricing.cacheWritePerM, DEFAULT_CONFIG.pricing.cacheWritePerM, 0, 1e6),
    },
    tokensPerBowl: integer(input.tokensPerBowl, DEFAULT_CONFIG.tokensPerBowl, 100, 1e9),
    timelineDays: integer(input.timelineDays, DEFAULT_CONFIG.timelineDays, 3, 365),
  };
}

function cleanConfigPatch(raw, current) {
  const input = isRecord(raw) ? (isRecord(raw.config) ? raw.config : raw) : {};
  const next = mergeConfig(current);
  const changed = {};

  if (isRecord(input.budget)) {
    if (input.budget.amount !== undefined) {
      next.budget.amount = number(input.budget.amount, next.budget.amount, 0, 1e9);
      changed.budget = true;
    }
    if (input.budget.period === 'month' || input.budget.period === 'total') {
      next.budget.period = input.budget.period;
      changed.budget = true;
    }
    if (input.budget.dailyAmount !== undefined) {
      next.budget.dailyAmount = number(input.budget.dailyAmount, next.budget.dailyAmount, 0, 1e9);
      changed.budget = true;
    }
    if (input.budget.alertThresholds !== undefined) {
      next.budget.alertThresholds = normalizeThresholds(input.budget.alertThresholds);
      changed.budget = true;
    }
    if (typeof input.budget.webhookUrl === 'string') {
      next.budget.webhookUrl = input.budget.webhookUrl.trim().slice(0, 500);
      changed.budget = true;
    }
    if (input.budget.notify !== undefined) {
      next.budget.notify = input.budget.notify === true;
      changed.budget = true;
    }
  }
  if (input.includeSubagents !== undefined) {
    next.includeSubagents = input.includeSubagents !== false;
    changed.includeSubagents = true;
  }
  if (isRecord(input.pricing)) {
    if (input.pricing.mode === 'official' || input.pricing.mode === 'custom') {
      next.pricing.mode = input.pricing.mode;
      changed.pricing = true;
    }
    for (const key of ['inputPerM', 'outputPerM', 'cacheReadPerM', 'cacheWritePerM']) {
      if (input.pricing[key] !== undefined) {
        next.pricing[key] = number(input.pricing[key], next.pricing[key], 0, 1e6);
        changed.pricing = true;
      }
    }
  }
  if (input.tokensPerBowl !== undefined) {
    next.tokensPerBowl = integer(input.tokensPerBowl, next.tokensPerBowl, 100, 1e9);
    changed.tokensPerBowl = true;
  }
  if (input.timelineDays !== undefined) {
    next.timelineDays = integer(input.timelineDays, next.timelineDays, 3, 365);
    changed.timelineDays = true;
  }
  if (input.enabled !== undefined) {
    next.enabled = input.enabled !== false;
    changed.enabled = true;
  }
  return { next, changed: Object.keys(changed).length > 0 };
}

function isLoopback(req) {
  const address = (req && req.socket && req.socket.remoteAddress) || '';
  return address === '127.0.0.1' || address === '::1' || address === '::ffff:127.0.0.1';
}

function jsonResponse(res, status, body) {
  const data = Buffer.from(JSON.stringify(body), 'utf8');
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'content-length': data.length,
  });
  res.end(data);
}

function textResponse(res, status, body) {
  const data = Buffer.from(String(body), 'utf8');
  res.writeHead(status, {
    'content-type': 'text/plain; charset=utf-8',
    'cache-control': 'no-store',
    'content-length': data.length,
  });
  res.end(data);
}

function readJson(req, limit = 64 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limit) {
        req.destroy();
        reject(Object.assign(new Error('body too large'), { code: 'BODY_TOO_LARGE' }));
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (chunks.length === 0) return resolve({});
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(Object.assign(new Error('invalid json'), { code: 'INVALID_JSON' }));
      }
    });
    req.on('error', reject);
  });
}

function pad2(value) {
  return String(value).padStart(2, '0');
}

function dayKey(ms) {
  const date = new Date(ms);
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function monthKey(ms) {
  const date = new Date(ms);
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;
}

function timeLabel(ms) {
  const date = new Date(ms);
  return `${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function extractText(content) {
  if (!Array.isArray(content)) return '';
  const parts = [];
  for (const block of content) {
    if (block && block.type === 'text' && typeof block.text === 'string') parts.push(block.text);
  }
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

function shotTitle(text, fallback) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (!clean) return fallback;
  return clean.length > 44 ? `${clean.slice(0, 44)}…` : clean;
}

function costOfPoint(point, pricing) {
  if (pricing.mode === 'custom') {
    const cost = (
      point.inputTokens * pricing.inputPerM +
      point.outputTokens * pricing.outputPerM +
      point.cacheReadTokens * pricing.cacheReadPerM +
      point.cacheWriteTokens * pricing.cacheWritePerM
    ) / 1_000_000;
    return { cost, priced: true, peak: null };
  }
  const rates = officialRates(point.model, point.time);
  if (!rates) return { cost: 0, priced: false, peak: null };
  // DeepSeek has no separate cache-write fee; a cache write is a cache-miss input.
  const cost = (
    point.inputTokens * rates.inputPerM +
    point.outputTokens * rates.outputPerM +
    point.cacheReadTokens * rates.cacheReadPerM +
    point.cacheWriteTokens * rates.inputPerM
  ) / 1_000_000;
  return { cost, priced: true, peak: rates.peak };
}

function emptyUsage() {
  return { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, totalTokens: 0, cost: 0, requests: 0, unpricedRequests: 0 };
}

function addUsage(target, usage) {
  target.inputTokens += usage.inputTokens;
  target.outputTokens += usage.outputTokens;
  target.cacheReadTokens += usage.cacheReadTokens;
  target.cacheWriteTokens += usage.cacheWriteTokens;
  target.totalTokens += usage.totalTokens;
  target.cost += usage.cost;
  target.requests += usage.requests;
  target.unpricedRequests += usage.unpricedRequests || 0;
}

function parseSession(header, events, live, inheritedFloor = 0) {
  const id = String(header && header.id ? header.id : '');
  const createdAt = Number(header && header.createdAt) || Date.now();
  let title = '';
  let firstUserText = '';
  let userMessages = 0;
  let turns = 0;
  let updatedAt = createdAt;
  const models = new Map();
  const points = [];
  const totals = emptyUsage();
  const floor = Math.max(0, Number(inheritedFloor) || 0);

  for (const event of events || []) {
    if (!event || typeof event !== 'object') continue;
    if (floor > 0 && Number(event.seq) < floor) continue;
    const time = Number(event.time) || 0;
    if (time > updatedAt) updatedAt = time;
    switch (event.type) {
      case 'session/title': {
        const value = event.data && event.data.title;
        if (typeof value === 'string' && value.trim()) title = value.trim();
        break;
      }
      case 'user/message': {
        userMessages += 1;
        if (!firstUserText) {
          const message = event.data && event.data.message;
          firstUserText = extractText(message && message.content);
        }
        break;
      }
      case 'turn/start': {
        const turn = Number(event.data && event.data.turn);
        if (Number.isFinite(turn) && turn > turns) turns = turn;
        break;
      }
      case 'assistant/message': {
        const usage = event.data && event.data.usage;
        if (!usage) break;
        const source = event.data && event.data.message && event.data.message.source;
        const modelName = source && typeof source.model === 'string' ? source.model : '';
        const point = {
          time,
          model: modelName,
          inputTokens: Math.max(0, Number(usage.inputTokens) || 0),
          outputTokens: Math.max(0, Number(usage.outputTokens) || 0),
          cacheReadTokens: Math.max(0, Number(usage.cacheReadTokens) || 0),
          cacheWriteTokens: Math.max(0, Number(usage.cacheWriteTokens) || 0),
        };
        point.totalTokens =
          Number.isFinite(Number(usage.totalTokens)) && Number(usage.totalTokens) > 0
            ? Number(usage.totalTokens)
            : point.inputTokens + point.outputTokens + point.cacheReadTokens + point.cacheWriteTokens;
        point.cost = 0;
        point.priced = true;
        points.push(point);
        if (modelName) models.set(modelName, (models.get(modelName) || 0) + 1);
        break;
      }
      default:
        break;
    }
  }

  const model = [...models.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || '';
  const parentSession = header && header.parentSession ? String(header.parentSession) : null;
  const isSubagent = Boolean(parentSession) || Boolean(header && header.origin === 'subagent') || Number(header && header.delegationDepth) > 0;
  return {
    id,
    shortId: id.replace(/^session-/, '').slice(0, 8),
    title: title || shotTitle(firstUserText, '未命名会话'),
    createdAt,
    updatedAt,
    userMessages,
    turns: Math.max(turns, userMessages > 0 ? 1 : 0),
    model,
    models: [...models.keys()],
    isSubagent,
    parentSession,
    live: Boolean(live),
    cwd: typeof (header && header.cwd) === 'string' ? header.cwd : '',
    points,
    totals,
  };
}

function usageFromPoints(points, pricing) {
  const totals = emptyUsage();
  for (const point of points) {
    totals.inputTokens += point.inputTokens;
    totals.outputTokens += point.outputTokens;
    totals.cacheReadTokens += point.cacheReadTokens;
    totals.cacheWriteTokens += point.cacheWriteTokens;
    totals.totalTokens += point.totalTokens;
    totals.requests += 1;
    const priced = costOfPoint(point, pricing);
    point.cost = priced.cost;
    point.priced = priced.priced;
    point.peak = priced.peak;
    if (!priced.priced) totals.unpricedRequests += 1;
    totals.cost += priced.cost;
  }
  return totals;
}

export const inject = ['webServer', 'timer'];

export function apply(ctx, rawConfig) {
  const state = {
    config: mergeConfig(rawConfig),
    startedAt: Date.now(),
    sessions: new Map(),
    snapshot: null,
    refreshing: null,
    sseClients: new Set(),
    alertFired: new Set(),
    balance: { status: 'unknown', wallets: [], bonusWallets: [], updatedAt: 0 },
    cpuPrev: null,
    cpuHistory: [],
    cpuSample: null,
    activityAt: 0,
    streaming: false,
    disposed: false,
  };

  const log = (...values) => console.info('[whale-girl-stats]', ...values);
  const warn = (...values) => console.warn('[whale-girl-stats]', ...values);

  function broadcastSse(payload) {
    if (state.disposed) return;
    const data = `data: ${JSON.stringify({ ...payload, at: Date.now() })}\n\n`;
    for (const res of state.sseClients) {
      try {
        res.write(data);
      } catch {
        state.sseClients.delete(res);
      }
    }
  }

  function fireBudgetAlert(scope, periodLabel, threshold, percent, spent, amount) {
    const key = `${scope}:${periodLabel}:${threshold}`;
    if (state.alertFired.has(key)) return;
    state.alertFired.add(key);
    if (state.alertFired.size > 500) {
      const keep = [...state.alertFired].slice(-200);
      state.alertFired = new Set(keep);
    }
    const url = state.config.budget.webhookUrl;
    if (!url) return;
    const payload = {
      type: 'whale-girl-stats/budget-alert',
      scope,
      periodLabel,
      threshold,
      percent: Math.round(percent * 10) / 10,
      spent: Math.round(spent * 10000) / 10000,
      amount,
      currency: CURRENCY,
      at: new Date().toISOString(),
    };
    Promise.resolve()
      .then(() =>
        fetch(url, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(5000),
        }),
      )
      .catch((error) => warn('预算 Webhook 推送失败', error && error.message));
  }

  async function refreshBalance() {
    const account = ctx.get('deepseekAccount');
    if (!account || typeof account.getState !== 'function' || typeof account.getBalance !== 'function') {
      state.balance = { status: 'unavailable', wallets: [], bonusWallets: [], updatedAt: Date.now() };
      return;
    }
    try {
      const view = await account.getState();
      if (!view || view.status !== 'credential-stored') {
        state.balance = { status: 'signed-out', wallets: [], bonusWallets: [], updatedAt: Date.now() };
        return;
      }
      const client = {
        version: VERSION,
        locale: 'zh-CN',
        timezoneOffsetSeconds: -new Date().getTimezoneOffset() * 60,
      };
      const result = await account.getBalance(client);
      if (!result) {
        state.balance = { status: 'signed-out', wallets: [], bonusWallets: [], updatedAt: Date.now() };
        return;
      }
      if (result.status !== 'ready') {
        state.balance = { status: 'failed', wallets: [], bonusWallets: [], updatedAt: Date.now() };
        return;
      }
      const wallets = Array.isArray(result.value) ? result.value : [];
      const bonusWallets = Array.isArray(result.bonusWallets) ? result.bonusWallets : [];
      state.balance = {
        status: 'ready',
        wallets: wallets.map((wallet) => ({ currency: wallet.currency, balance: wallet.balance })),
        bonusWallets: bonusWallets.map((wallet) => ({ currency: wallet.currency, balance: wallet.balance })),
        updatedAt: Date.now(),
      };
    } catch (error) {
      warn('读取账户余额失败', error && error.message);
      state.balance = { status: 'failed', wallets: [], bonusWallets: [], updatedAt: Date.now() };
    }
  }

  // --- CPU sampler -------------------------------------------------------
  function sampleCpu() {
    const at = Date.now();
    const cpus = os.cpus() || [];
    const coreCount = cpus.length || 1;
    const previous = state.cpuPrev;
    const cores = [];
    let totalDelta = 0;
    let idleDelta = 0;
    let userDelta = 0;
    let systemDelta = 0;

    for (let index = 0; index < cpus.length; index += 1) {
      const current = cpus[index];
      const old = previous && previous.cpus[index];
      if (!old || !current || !current.times) {
        cores.push(0);
        continue;
      }
      const currentTotal =
        current.times.user + current.times.nice + current.times.sys + current.times.idle + current.times.irq;
      const oldTotal = old.times.user + old.times.nice + old.times.sys + old.times.idle + old.times.irq;
      const delta = currentTotal - oldTotal;
      if (delta <= 0) {
        cores.push(0);
        continue;
      }
      const idle = current.times.idle - old.times.idle;
      const user = current.times.user - old.times.user;
      const nice = current.times.nice - old.times.nice;
      const system = current.times.sys - old.times.sys;
      const irq = current.times.irq - old.times.irq;
      totalDelta += delta;
      idleDelta += idle;
      userDelta += user + nice;
      systemDelta += system + irq;
      cores.push(clamp(100 * (1 - idle / delta), 0, 100));
    }

    const usage = totalDelta > 0 ? clamp(100 * (1 - idleDelta / totalDelta), 0, 100) : 0;
    const userShare = totalDelta > 0 ? clamp((100 * userDelta) / totalDelta, 0, 100) : 0;
    const systemShare = totalDelta > 0 ? clamp((100 * systemDelta) / totalDelta, 0, 100) : 0;

    const proc = process.cpuUsage();
    let processCpu = 0;
    if (previous && previous.proc && at > previous.at) {
      const elapsedMs = Math.max(1, at - previous.at);
      const deltaMicros = proc.user - previous.proc.user + (proc.system - previous.proc.system);
      processCpu = clamp((100 * (deltaMicros / 1000)) / (elapsedMs * coreCount), 0, 100 * coreCount);
    }

    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    let load = null;
    if (process.platform !== 'win32') {
      const values = os.loadavg();
      load = values.map((value) => Math.round(value * 100) / 100);
    }

    const sample = {
      usage: Math.round(usage * 10) / 10,
      user: Math.round(userShare * 10) / 10,
      system: Math.round(systemShare * 10) / 10,
      cores: cores.map((value) => Math.round(value * 10) / 10),
      coreCount,
      load,
      processCpu: Math.round(processCpu * 10) / 10,
      memory: {
        used: Math.round(((totalMemory - freeMemory) / 1024 ** 3) * 10) / 10,
        total: Math.round((totalMemory / 1024 ** 3) * 10) / 10,
        unit: 'GB',
      },
      processMemoryMB: Math.round(process.memoryUsage().rss / 1024 ** 2),
      uptimeSec: Math.round(os.uptime()),
      processUptimeSec: Math.round(process.uptime()),
      sampledAt: at,
    };

    state.cpuPrev = { at, cpus, proc };
    state.cpuSample = sample;
    state.cpuHistory.push({ at, usage: sample.usage });
    if (state.cpuHistory.length > 60) state.cpuHistory.splice(0, state.cpuHistory.length - 60);
    return sample;
  }

  // --- Session aggregation ----------------------------------------------
  function eventsOfLive(session) {
    try {
      if (typeof session.ownEvents === 'function') return session.ownEvents();
      if (typeof session.snapshotEvents === 'function') return session.snapshotEvents();
    } catch (error) {
      warn('读取活动会话事件失败', error && error.message);
    }
    return [];
  }

  async function collectFromQuery() {
    const query = ctx.get('sessionQuery');
    if (!query || typeof query.listSessions !== 'function') {
      return { available: false, sessions: [] };
    }
    const records = await query.listSessions();
    const liveSessions = new Map();
    const store = ctx.get('sessions');
    if (store && typeof store.list === 'function') {
      for (const session of store.list()) liveSessions.set(String(session.id), session);
    }

    // Persisted logs are append-only, but a Session can be read once while it
    // is live and then keep growing after it stops being live. Cache entries
    // keyed by the persistence revision keep those late events from being lost.
    const persistence = ctx.get('sessionPersistence');
    const revisions = new Map();
    if (persistence && typeof persistence.list === 'function') {
      try {
        const snapshots = await persistence.list();
        for (const snapshot of snapshots || []) {
          const header = snapshot && snapshot.header;
          if (header && header.id) revisions.set(String(header.id), String(snapshot.revision ?? ''));
        }
      } catch (error) {
        warn('读取会话 revision 失败', error && error.message);
      }
    }

    const collected = [];
    const recordIds = new Set();
    for (const record of records || []) {
      const header = record && record.header ? record.header : record;
      if (!header || !header.id) continue;
      const id = String(header.id);
      recordIds.add(id);
      const revision = revisions.get(id) || '';
      const live = liveSessions.get(id);
      let entry;
      if (live) {
        entry = parseSession(
          header,
          eventsOfLive(live),
          true,
          Number(live.inheritedEventCount) || 0,
        );
        entry.revision = revision;
        state.sessions.set(id, entry);
      } else {
        entry = state.sessions.get(id);
        const stale = Boolean(entry) && (
          entry.live ||
          (revision !== '' && (!entry.revision || entry.revision !== revision))
        );
        if (stale) {
          state.sessions.delete(id);
          entry = undefined;
        }
        if (!entry) {
          try {
            const snapshot = await query.readSession(id);
            if (snapshot && snapshot.session) {
              entry = parseSession(
                snapshot.session,
                snapshot.events,
                false,
                Number(snapshot.inheritedEventCount) || 0,
              );
              entry.persisted = true;
              entry.revision = revision;
              state.sessions.set(id, entry);
            }
          } catch (error) {
            warn('读取历史会话失败', id, error && error.message);
          }
        } else {
          entry.live = false;
        }
      }
      if (entry) collected.push(entry);
    }
    for (const id of state.sessions.keys()) {
      if (!recordIds.has(id)) state.sessions.delete(id);
    }
    return { available: true, sessions: collected };
  }

  function buildSnapshot(collection) {
      const pricing = state.config.pricing;
      const allEntries = collection.sessions || [];
      const titleById = new Map(allEntries.map((entry) => [entry.id, entry.title]));
      const included = allEntries.filter((entry) => state.config.includeSubagents || !entry.isSubagent);
      const sessions = [];
      const allPoints = [];
      const aggregate = emptyUsage();
      const modelStats = new Map();
      const workspaceStats = new Map();
      const agentStats = new Map();
      let liveSessions = 0;
      let subagentSessions = 0;
      let firstAt = 0;
      let lastAt = 0;
      const now = Date.now();

      const rowFor = (map, key, label) => {
        let row = map.get(key);
        if (!row) {
          row = { key, label, tokens: 0, cost: 0, requests: 0, sessions: new Set() };
          map.set(key, row);
        }
        return row;
      };

      for (const entry of included) {
        const points = entry.points || [];
        const totals = usageFromPoints(points, pricing);
        entry.totals = totals;
        for (const point of points) allPoints.push(point);
        const active = Boolean(entry.live) && entry.updatedAt > 0 && now - entry.updatedAt < 15 * 60 * 1000;
        if (active) liveSessions += 1;
        if (entry.isSubagent) subagentSessions += 1;

        for (const point of points) {
          const model = point.model || '未标注';
          const row = rowFor(modelStats, model, model);
          row.tokens += point.totalTokens;
          row.cost += point.cost;
          row.requests += 1;
          row.sessions.add(entry.id);
        }
        const workspaceKey = entry.cwd || '';
        const workspace = rowFor(workspaceStats, workspaceKey, workspaceLabel(workspaceKey));
        workspace.tokens += totals.totalTokens;
        workspace.cost += totals.cost;
        workspace.requests += totals.requests;
        workspace.sessions.add(entry.id);
        const agentKey = entry.isSubagent ? 'subagent' : 'main';
        const agent = rowFor(agentStats, agentKey, agentKey);
        agent.tokens += totals.totalTokens;
        agent.cost += totals.cost;
        agent.requests += totals.requests;
        agent.sessions.add(entry.id);

        const include = totals.requests > 0 || (entry.live && entry.userMessages > 0);
        if (include) {
          sessions.push({
            id: entry.id,
            shortId: entry.shortId,
            title: entry.title,
            createdAt: entry.createdAt,
            updatedAt: entry.updatedAt,
            inputTokens: totals.inputTokens,
            outputTokens: totals.outputTokens,
            cacheReadTokens: totals.cacheReadTokens,
            cacheWriteTokens: totals.cacheWriteTokens,
            totalTokens: totals.totalTokens,
            cost: totals.cost,
            requests: totals.requests,
            unpricedRequests: totals.unpricedRequests,
            turns: entry.turns,
            model: entry.model,
            models: entry.models || (entry.model ? [entry.model] : []),
            isSubagent: Boolean(entry.isSubagent),
            parentSession: entry.parentSession || null,
            parentTitle: entry.parentSession ? titleById.get(entry.parentSession) || null : null,
            live: entry.live,
            active,
            cwd: entry.cwd,
          });
          addUsage(aggregate, totals);
          if (!firstAt || entry.createdAt < firstAt) firstAt = entry.createdAt;
          if (entry.updatedAt > lastAt) lastAt = entry.updatedAt;
        }
      }

      sessions.sort((a, b) => b.updatedAt - a.updatedAt);

      const finalizeBreakdown = (map) =>
        [...map.values()]
          .map((row) => ({
            key: row.key,
            label: row.label,
            tokens: row.tokens,
            cost: Math.round(row.cost * 10000) / 10000,
            requests: row.requests,
            sessions: row.sessions.size,
          }))
          .filter((row) => row.tokens > 0 || row.cost > 0 || row.requests > 0)
          .sort((a, b) => b.cost - a.cost || b.tokens - a.tokens);

      const breakdown = {
        byModel: finalizeBreakdown(modelStats),
        byWorkspace: finalizeBreakdown(workspaceStats),
        byAgentType: finalizeBreakdown(agentStats),
      };

      const todayKey = dayKey(now);
      const currentMonth = monthKey(now);
      const today = emptyUsage();
      const monthSpend = { cost: 0 };
      const recentTokens = { sum: 0 };

      for (const point of allPoints) {
        if (dayKey(point.time) === todayKey) {
          today.inputTokens += point.inputTokens;
          today.outputTokens += point.outputTokens;
          today.cacheReadTokens += point.cacheReadTokens;
          today.cacheWriteTokens += point.cacheWriteTokens;
          today.totalTokens += point.totalTokens;
          today.requests += 1;
          today.cost += point.cost;
          if (!point.priced) today.unpricedRequests += 1;
        }
        if (monthKey(point.time) === currentMonth) monthSpend.cost += point.cost;
        if (point.time >= now - RATE_WINDOW_MS) recentTokens.sum += point.totalTokens;
      }

      const days = state.config.timelineDays;
      const buckets = [];
      const bucketMap = new Map();
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      for (let offset = days - 1; offset >= 0; offset -= 1) {
        const date = new Date(todayStart);
        date.setDate(date.getDate() - offset);
        const key = dayKey(date.getTime());
        const bucket = {
          date: key,
          label: timeLabel(date.getTime()),
          inputTokens: 0,
          outputTokens: 0,
          cacheReadTokens: 0,
          totalTokens: 0,
          cost: 0,
          requests: 0,
        };
        buckets.push(bucket);
        bucketMap.set(key, bucket);
      }
      for (const point of allPoints) {
        const bucket = bucketMap.get(dayKey(point.time));
        if (!bucket) continue;
        bucket.inputTokens += point.inputTokens;
        bucket.outputTokens += point.outputTokens;
        bucket.cacheReadTokens += point.cacheReadTokens;
        bucket.totalTokens += point.totalTokens;
        bucket.cost += point.cost;
        bucket.requests += 1;
      }
      let maxTokens = 0;
      let maxCost = 0;
      for (const bucket of buckets) {
        if (bucket.totalTokens > maxTokens) maxTokens = bucket.totalTokens;
        if (bucket.cost > maxCost) maxCost = bucket.cost;
      }

      const totalTokens = aggregate.totalTokens;
      const tokensPerBowl = state.config.tokensPerBowl;
      const bowls = totalTokens / tokensPerBowl;
      const happiness = Math.min(0.995, Math.max(0.2, 0.25 + 0.25 * Math.log10(1 + totalTokens / 1000)));
      const tokensPerMin = recentTokens.sum;
      const streaming = now - state.activityAt < 15000;
      const active = tokensPerMin > 0 || streaming;
      const charState = tokensPerMin > 30000 || state.streaming ? 'feast' : active ? 'eating' : 'idle';

      const budgetConfig = state.config.budget;
      const budgetAmount = budgetConfig.amount;
      const spent = budgetConfig.period === 'month' ? monthSpend.cost : aggregate.cost;
      const periodLabel = budgetConfig.period === 'month' ? currentMonth : '累计';
      const alerts = [];
      const collectAlerts = (scope, label, amount, spentValue) => {
        if (!(amount > 0)) return;
        const percent = (spentValue / amount) * 100;
        for (const threshold of budgetConfig.alertThresholds) {
          if (percent + 1e-9 < threshold) continue;
          alerts.push({
            scope,
            threshold,
            percent: Math.round(percent * 10) / 10,
            spent: Math.round(spentValue * 10000) / 10000,
            amount,
            periodLabel: label,
          });
          fireBudgetAlert(scope, label, threshold, percent, spentValue, amount);
        }
      };
      collectAlerts(budgetConfig.period, periodLabel, budgetAmount, spent);
      const dailyAmount = budgetConfig.dailyAmount;
      const dailySpent = today.cost;
      collectAlerts('daily', todayKey, dailyAmount, dailySpent);
      alerts.sort((a, b) => b.threshold - a.threshold || b.percent - a.percent);
      const budget = {
        enabled: budgetAmount > 0,
        amount: budgetAmount,
        spent: Math.round(spent * 10000) / 10000,
        remaining: Math.round((budgetAmount - spent) * 10000) / 10000,
        percent: budgetAmount > 0 ? Math.round((spent / budgetAmount) * 1000) / 10 : 0,
        period: budgetConfig.period,
        periodLabel,
        currency: CURRENCY,
        daily: {
          enabled: dailyAmount > 0,
          amount: dailyAmount,
          spent: Math.round(dailySpent * 10000) / 10000,
          remaining: Math.round((dailyAmount - dailySpent) * 10000) / 10000,
          percent: dailyAmount > 0 ? Math.round((dailySpent / dailyAmount) * 1000) / 10 : 0,
          periodLabel: todayKey,
        },
        alerts,
      };

      const cpu = state.cpuSample || sampleCpu();
      const pricingInfo = {
        mode: pricing.mode,
        version: PRICE_VERSION,
        currency: CURRENCY,
        peakNow: isPeakTime(now),
        peakSchedule: 'Asia/Shanghai · Mon-Fri 09:00-12:00 / 14:00-18:00; off-peak weekends and Chinese public holidays',
        models: Object.fromEntries(
          Object.entries(DEEPSEEK_PRICING).map(([model, value]) => [model, {
            peak: value.peak,
            offPeak: value.offPeak,
          }]),
        ),
      };

      return {
        ok: true,
        generatedAt: now,
        version: VERSION,
        available: collection.available,
        currency: CURRENCY,
        balance: state.balance,
        config: state.config,
        pricingInfo,
        totals: {
          inputTokens: aggregate.inputTokens,
          outputTokens: aggregate.outputTokens,
          cacheReadTokens: aggregate.cacheReadTokens,
          cacheWriteTokens: aggregate.cacheWriteTokens,
          totalTokens: aggregate.totalTokens,
          cost: Math.round(aggregate.cost * 10000) / 10000,
          unpricedRequests: aggregate.unpricedRequests,
          sessions: sessions.length,
          liveSessions,
          subagentSessions,
          requests: aggregate.requests,
          turns: sessions.reduce((sum, session) => sum + session.turns, 0),
          firstAt: firstAt || 0,
          lastAt: lastAt || 0,
        },
        today: {
          inputTokens: today.inputTokens,
          outputTokens: today.outputTokens,
          cacheReadTokens: today.cacheReadTokens,
          totalTokens: today.totalTokens,
          cost: Math.round(today.cost * 10000) / 10000,
          requests: today.requests,
          unpricedRequests: today.unpricedRequests,
        },
        budget,
        breakdown,
        rate: {
          windowSec: RATE_WINDOW_MS / 1000,
          tokensLastMin: tokensPerMin,
          tokensPerMin,
          active,
          appetite: clamp(tokensPerMin / 30000, 0, 1),
        },
        character: {
          name: '汐',
          bowls: Math.round(bowls * 10) / 10,
          bowlFraction: Math.round((bowls - Math.floor(bowls)) * 1000) / 1000,
          tokensPerBowl,
          happiness: Math.round(happiness * 1000) / 1000,
          state: charState,
        },
        timeline: {
          days,
          from: buckets.length > 0 ? buckets[0].date : todayKey,
          to: todayKey,
          buckets,
          maxTokens,
          maxCost: Math.round(maxCost * 10000) / 10000,
        },
        sessions,
        cpu: {
          ...cpu,
          history: state.cpuHistory.slice(-40),
        },
      };
    }

  async function refresh(force = false) {
    if (state.refreshing) return state.refreshing;
    const now = Date.now();
    if (!force && state.snapshot && now - state.snapshot.generatedAt < 1500) return state.snapshot;
    state.refreshing = (async () => {
      try {
        const collection = await collectFromQuery();
        const snapshot = buildSnapshot(collection);
        state.snapshot = snapshot;
        return snapshot;
      } catch (error) {
        warn('统计失败', error && error.message);
        const fallback = state.snapshot || buildSnapshot({ available: false, sessions: [] });
        return { ...fallback, available: false, error: String((error && error.message) || error) };
      } finally {
        state.refreshing = null;
      }
    })();
    return state.refreshing;
  }

  // --- HTTP --------------------------------------------------------------
  function handleOverview(res) {
    refresh()
      .then((snapshot) => jsonResponse(res, 200, snapshot))
      .catch((error) =>
        jsonResponse(res, 500, {
          ok: false,
          available: false,
          error: 'OVERVIEW_FAILED',
          message: String((error && error.message) || error),
        }),
      );
  }

  function handleSse(req, res) {
    res.writeHead(200, {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
      'x-accel-buffering': 'no',
    });
    res.write('retry: 3000\n\n');
    res.write(`data: ${JSON.stringify({ type: 'hello', version: VERSION, at: Date.now() })}\n\n`);
    state.sseClients.add(res);
    const heartbeat = setInterval(() => {
      try {
        res.write(': ping\n\n');
      } catch {
        clearInterval(heartbeat);
        state.sseClients.delete(res);
      }
    }, 20000);
    const cleanup = () => {
      clearInterval(heartbeat);
      state.sseClients.delete(res);
    };
    req.on('close', cleanup);
    req.on('error', cleanup);
  }

  function handleExport(res) {
    refresh()
      .then((snapshot) => {
        const csvCell = (value) => `"${String(value == null ? '' : value).replace(/"/g, '""')}"`;
        const rows = [
          ['session_id', 'title', 'kind', 'parent_title', 'workspace', 'models', 'requests', 'input_tokens', 'output_tokens', 'cache_read_tokens', 'total_tokens', 'cost_cny', 'created_at', 'updated_at'],
        ];
        for (const session of snapshot.sessions || []) {
          rows.push([
            session.id,
            session.title,
            session.isSubagent ? 'subagent' : 'main',
            session.parentTitle || '',
            session.cwd,
            (session.models || [session.model]).join(' / '),
            session.requests,
            session.inputTokens,
            session.outputTokens,
            session.cacheReadTokens,
            session.totalTokens,
            session.cost,
            new Date(session.createdAt).toISOString(),
            new Date(session.updatedAt).toISOString(),
          ]);
        }
        const data = Buffer.from(`\ufeff${rows.map((row) => row.map(csvCell).join(',')).join('\r\n')}\r\n`, 'utf8');
        res.writeHead(200, {
          'content-type': 'text/csv; charset=utf-8',
          'content-disposition': 'attachment; filename="whale-girl-stats-sessions.csv"',
          'content-length': data.length,
        });
        res.end(data);
      })
      .catch((error) => {
        warn('导出失败', error && error.message);
        textResponse(res, 500, 'Export failed');
      });
  }

  function handleConfigGet(res) {
    jsonResponse(res, 200, {
      ok: true,
      config: state.config,
      editable: Boolean(ctx.get('configEditor') && ctx.fiber && ctx.fiber.entry),
    });
  }

  async function handleConfigPost(req, res) {
    if (!isLoopback(req)) return jsonResponse(res, 403, { ok: false, error: 'LOCAL_ONLY' });
    let body;
    try {
      body = await readJson(req);
    } catch (error) {
      return jsonResponse(res, 400, { ok: false, error: error.code || 'BAD_REQUEST' });
    }
    const { next, changed } = cleanConfigPatch(body, state.config);
    if (!changed) return jsonResponse(res, 400, { ok: false, error: 'EMPTY_PATCH' });
    state.config = next;
    state.snapshot = null;
    const editor = ctx.get('configEditor');
    const entry = ctx.fiber && ctx.fiber.entry;
    if (!editor || !entry) {
      return jsonResponse(res, 200, {
        ok: true,
        config: state.config,
        editable: false,
        restart: false,
        warning: '当前 profile 不能写回配置，本次修改只在当前进程生效。',
      });
    }
    jsonResponse(res, 200, { ok: true, config: state.config, editable: true, restart: true });
    setTimeout(() => {
      editor
        .edit(entry, (current) => {
          const base = mergeConfig(current || {});
          return {
            ...base,
            budget: { ...base.budget, ...next.budget },
            pricing: { ...base.pricing, ...next.pricing },
            includeSubagents: next.includeSubagents,
            tokensPerBowl: next.tokensPerBowl,
            timelineDays: next.timelineDays,
            enabled: next.enabled,
          };
        })
        .catch((error) => warn('保存统计设置失败', error && error.message));
    }, 20);
  }

  function assetResponse(res, name) {
    const contentType = ASSETS.get(name);
    if (!contentType) return textResponse(res, 404, 'Not found');
    const path = fileURLToPath(new URL(`./assets/${name}`, import.meta.url));
    readFile(path)
      .then((data) => {
        res.writeHead(200, {
          'content-type': contentType,
          'cache-control': 'public, max-age=3600',
          'content-length': data.length,
        });
        res.end(data);
      })
      .catch((error) => {
        warn('读取素材失败', name, error && error.message);
        textResponse(res, 404, 'Not found');
      });
  }

  // Initial CPU sample so the first overview has real numbers.
  sampleCpu();

  ctx.effect(() => {
    const disposers = [];
    const register = (path, handler, kind = 'exact') => {
      disposers.push(ctx.webServer.register({ kind, path, handler }));
    };

    register(`${API}/overview`, (req, res) => {
      if (req.method !== 'GET') return textResponse(res, 405, 'Method not allowed');
      handleOverview(res);
    });
    register(`${API}/events`, (req, res) => {
      if (req.method !== 'GET') return textResponse(res, 405, 'Method not allowed');
      handleSse(req, res);
    });
    register(`${API}/export.csv`, (req, res) => {
      if (req.method !== 'GET') return textResponse(res, 405, 'Method not allowed');
      handleExport(res);
    });
    register(`${API}/config`, async (req, res) => {
      if (req.method === 'GET') return handleConfigGet(res);
      if (req.method !== 'POST') return textResponse(res, 405, 'Method not allowed');
      await handleConfigPost(req, res);
    });
    for (const name of ASSETS.keys()) {
      register(`${API}/assets/${name}`, (req, res) => {
        if (req.method !== 'GET') return textResponse(res, 405, 'Method not allowed');
        assetResponse(res, name);
      });
    }

    disposers.push(
      ctx.on('session/event', (session, event) => {
        if (!event || typeof event.type !== 'string') return;
        const type = event.type;
        if (
          type === 'assistant/attempt' ||
          type === 'assistant/message' ||
          type === 'step/start' ||
          type === 'tool/call' ||
          type === 'tool/result' ||
          type === 'user/message' ||
          type === 'turn/start' ||
          type === 'turn/end'
        ) {
          state.activityAt = Date.now();
          state.streaming = type === 'assistant/attempt' || type === 'step/start' || type === 'tool/call';
          if (type === 'assistant/message' || type === 'turn/end') {
            broadcastSse({ type: 'usage', sessionId: session && session.id ? String(session.id) : '' });
          }
        }
      }),
    );

    disposers.push(
      ctx.interval(() => {
        try {
          sampleCpu();
        } catch (error) {
          warn('CPU 采样失败', error && error.message);
        }
      }, 3000),
    );

    disposers.push(ctx.interval(() => { void refreshBalance(); }, 60000));
    void refreshBalance();

    log(`已加载 v${VERSION}`);
    return () => {
      state.disposed = true;
      state.sessions.clear();
      for (const res of state.sseClients) {
        try {
          res.end();
        } catch {
          /* already closed */
        }
      }
      state.sseClients.clear();
      for (const dispose of disposers) {
        try {
          dispose();
        } catch {
          /* teardown is best effort */
        }
      }
    };
  });
}
