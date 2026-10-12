/**
 * Visual search ("صوّرها ولاقيها في بنها"). Product photos and shopper photos use the same
 * embedder so search results are ranked by garment meaning when Cloudflare Vision is enabled.
 */
import sharp from 'sharp';
import { q } from '../db/index.js';
import { readMediaFile } from './media.js';

const GRID_W = 6, GRID_H = 8, HUE_BINS = 12;
const COLOR_MODEL = 'color-v1';
const CF_MODEL = 'cf-vision-bge-m3';
const CF_VISION = '@cf/llava-hf/llava-1.5-7b-hf';
const CF_EMBED = '@cf/baai/bge-m3';
const DEF = { visual_enabled: '1', visual_model: 'color', visual_daily: '40' };

const cfAccount = () => process.env.CF_ACCOUNT_ID || process.env.R2_ACCOUNT_ID || '';
const cfToken = () => process.env.CF_AI_TOKEN || '';
const cfReady = () => !!(cfAccount() && cfToken());
let providerLastError = '';

export class VisualProviderError extends Error {
  constructor(message = 'Visual search provider is unavailable.') { super(message); this.name = 'VisualProviderError'; }
}

export function visualSettings() {
  const m = { ...DEF, ...Object.fromEntries(q.all("SELECT key, value FROM app_settings WHERE key LIKE 'visual_%'").map((r) => [r.key, r.value])) };
  const selected = ['color', 'cloudflare'].includes(m.visual_model) ? m.visual_model : 'color';
  return { enabled: m.visual_enabled === '1', model: selected, dailyFree: Math.max(0, Number(m.visual_daily) || 0) };
}

export function saveVisualSettings({ enabled, model, dailyFree }) {
  const put = (k, v) => q.run('INSERT INTO app_settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value', [k, String(v)]);
  if (enabled !== undefined) put('visual_enabled', enabled ? '1' : '0');
  if (model) put('visual_model', model);
  if (dailyFree !== undefined) put('visual_daily', Math.max(0, Math.min(1000, Math.floor(dailyFree))));
  return visualSettings();
}

export function visualStatus() {
  const s = visualSettings();
  const model = s.model === 'cloudflare' && cfReady() ? CF_MODEL : COLOR_MODEL;
  const counts = q.all('SELECT model, COUNT(*) AS c FROM product_vectors GROUP BY model');
  const indexed = Object.fromEntries(counts.map((r) => [r.model, r.c]));
  const pending = q.get(`SELECT COUNT(*) AS c FROM products p
    JOIN product_media pm ON pm.product_id=p.id AND pm.is_primary=1
    LEFT JOIN media m ON m.id=pm.media_id
    LEFT JOIN product_vectors v ON v.product_id=p.id
    WHERE p.status='active' AND (v.product_id IS NULL OR v.media_id!=m.id OR v.model!=?)`, [model])?.c || 0;
  return {
    ...s, effectiveModel: model, indexed, pending, rssMb: Math.round(process.memoryUsage().rss / 1048576),
    providers: {
      cloudflare: { configured: cfReady(), failed: !!providerLastError, lastError: providerLastError },
    },
  };
}

/** Weight cells near the centre more (the garment), ignore the borders (background / blurred padding). */
const CELL_W = Array.from({ length: GRID_H }, (_, y) => Array.from({ length: GRID_W }, (_, x) => {
  const dx = (x + 0.5) / GRID_W - 0.5, dy = (y + 0.5) / GRID_H - 0.5;
  return 0.35 + 0.65 * Math.exp(-(dx * dx * 5 + dy * dy * 4));
})).flat();

function rgbToHsv(r, g, b) {
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  let h = 0;
  if (d) { if (mx === r) h = ((g - b) / d) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4; h *= 60; if (h < 0) h += 360; }
  return [h, mx ? d / mx : 0, mx / 255];
}

async function colorEmbed(buffer) {
  const { data } = await sharp(buffer).rotate().resize(GRID_W * 4, GRID_H * 4, { fit: 'cover', position: 'centre' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = GRID_W * 4, grid = new Float32Array(GRID_W * GRID_H * 3), cnt = new Float32Array(GRID_W * GRID_H);
  const hue = new Float32Array(HUE_BINS);
  for (let y = 0; y < GRID_H * 4; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 3, c = Math.floor(y / 4) * GRID_W + Math.floor(x / 4);
    grid[c * 3] += data[i]; grid[c * 3 + 1] += data[i + 1]; grid[c * 3 + 2] += data[i + 2]; cnt[c]++;
    const [h, s, v] = rgbToHsv(data[i], data[i + 1], data[i + 2]);
    if (s > 0.18 && v > 0.15) hue[Math.floor(h / 360 * HUE_BINS) % HUE_BINS] += CELL_W[c] * s;
  }
  const out = [];
  for (let c = 0; c < GRID_W * GRID_H; c++) for (let k = 0; k < 3; k++) out.push(((grid[c * 3 + k] / cnt[c]) - 128) / 128 * CELL_W[c]);
  const hs = hue.reduce((a, b) => a + b, 0) || 1;
  for (let k = 0; k < HUE_BINS; k++) out.push((hue[k] / hs) * 3);
  return out;
}

async function cfAiRun(model, body) {
  if (!cfReady()) throw new VisualProviderError('Cloudflare Workers AI is not configured.');
  let res, json;
  try {
    res = await fetch(`${process.env.CF_API_BASE || 'https://api.cloudflare.com/client/v4'}/accounts/${cfAccount()}/ai/run/${model}`, {
      method: 'POST', headers: { 'content-type': 'application/json', Authorization: `Bearer ${cfToken()}` },
      body: JSON.stringify(body), signal: AbortSignal.timeout(45000),
    });
    json = await res.json().catch(() => ({}));
  } catch (e) {
    providerLastError = e.name === 'TimeoutError' ? 'انتهت مهلة الاتصال بـ Cloudflare' : 'تعذر الاتصال بـ Cloudflare';
    throw new VisualProviderError();
  }
  if (!res.ok || json.success === false) {
    providerLastError = `Cloudflare AI (${res.status})`;
    console.error('[visual] Cloudflare AI request failed:', res.status, JSON.stringify(json.errors || {}).slice(0, 300));
    throw new VisualProviderError();
  }
  providerLastError = '';
  return json.result || {};
}

async function visionDescription(buffer) {
  let image;
  try { image = await sharp(buffer).rotate().resize(512, 512, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer(); }
  catch { throw new Error('Unsupported image.'); }
  const prompt = 'Describe only the visible clothing and fashion items for a visual product search. In concise English list the main garment or footwear type, dominant colors, pattern, cut and sleeve/length details when clear. Ignore the person, pose, background and room. Do not guess brand, material or details that are not visible. If no fashion item is visible, say no clothing item is visible.';
  const result = await cfAiRun(CF_VISION, { image: image.toString('base64'), prompt, max_tokens: 110 });
  const description = String(result.description || '').trim().slice(0, 1200);
  if (!description) { providerLastError = 'Cloudflare لم يرجع وصفًا للصورة'; throw new VisualProviderError(); }
  if (/no clothing item is visible/i.test(description)) return description;
  return description;
}

async function textEmbed(text) {
  const result = await cfAiRun(CF_EMBED, { text: [String(text).slice(0, 1800)] });
  const vector = result.data?.[0];
  if (!Array.isArray(vector) || !vector.length || vector.some((x) => !Number.isFinite(x))) { providerLastError = 'Cloudflare لم يرجع متجه المطابقة'; throw new VisualProviderError(); }
  return vector;
}

const normVec = (v) => {
  let n = 0; for (const x of v) n += x * x; n = Math.sqrt(n) || 1;
  return Float32Array.from(v, (x) => x / n);
};
const productText = (p) => [p.name_ar, p.name_en, p.description_ar, p.description_en, p.department].filter(Boolean).join('. ');

async function cloudflareEmbed(buffer, product = null) {
  const caption = await visionDescription(buffer);
  const text = product ? `${caption}. Product information: ${productText(product)}` : caption;
  return normVec(await textEmbed(text));
}

/** The chosen setting controls both query embedding and product indexing. */
export async function activeModel() {
  const s = visualSettings();
  if (s.model === 'cloudflare' && cfReady()) return CF_MODEL;
  return COLOR_MODEL;
}

export async function embedImage(buffer, model, product = null) {
  const m = model || await activeModel();
  if (m === CF_MODEL) return { model: m, vec: await cloudflareEmbed(buffer, product) };
  if (m === COLOR_MODEL) return { model: m, vec: normVec(await colorEmbed(buffer)) };
  throw new Error(`Unsupported visual model: ${m}`);
}

const toBlob = (f32) => Buffer.from(f32.buffer, f32.byteOffset, f32.byteLength);
const fromBlob = (b) => new Float32Array(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
const dot = (a, b) => { if (a.length !== b.length) return -1; let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * b[i]; return s; };

/** Index products whose primary photo has no vector for the active model yet (or whose photo changed). */
export async function reindexPending(limit = 200) {
  const model = await activeModel();
  const rows = q.all(
    `SELECT p.id AS product_id, p.name_ar, p.name_en, p.description_ar, p.description_en, p.department, m.* FROM products p
       JOIN product_media pm ON pm.product_id=p.id AND pm.is_primary=1
       JOIN media m ON m.id=pm.media_id
       LEFT JOIN product_vectors v ON v.product_id=p.id
      WHERE p.status='active' AND (v.product_id IS NULL OR v.media_id!=m.id OR v.model!=?) LIMIT ?`, [model, limit]);
  let done = 0;
  for (const row of rows) {
    try {
      let buf = null;
      for (const f of ['md.jpg', 'sm.jpg', 'original.jpg']) { try { buf = await readMediaFile(row, f); break; } catch { /* try next */ } }
      if (!buf) continue;
      const e = await embedImage(buf, model, row);
      q.run('INSERT INTO product_vectors (product_id, media_id, model, vec) VALUES (?,?,?,?) ON CONFLICT(product_id) DO UPDATE SET media_id=excluded.media_id, model=excluded.model, vec=excluded.vec', [row.product_id, row.id, e.model, toBlob(e.vec)]);
      done++;
    } catch (e) { console.error('[visual] index failed for product', row.product_id, e.message); }
  }
  return { done, remaining: rows.length === limit };
}

let timer = null, running = false;
export function triggerReindex(delay = 4000) {
  clearTimeout(timer);
  timer = setTimeout(async () => {
    if (running) return triggerReindex(10000);
    running = true;
    try { let r; do { r = await reindexPending(100); } while (r.remaining); } catch (e) { console.error('[visual]', e.message); }
    running = false;
  }, delay);
  timer.unref?.();
}
export function startVisualIndexer() {
  triggerReindex(3000);
  setInterval(() => triggerReindex(0), 10 * 60 * 1000).unref?.();
}

/** Top-N active products most similar to the customer's photo. */
export async function searchByImage(buffer, { department = '', limit = 24 } = {}) {
  let query;
  try { query = await embedImage(buffer); }
  catch (e) {
    if (e instanceof VisualProviderError) throw e;
    throw new Error('Unsupported image.');
  }
  const { vec: qv, model } = query;
  const rows = q.all(
    `SELECT v.product_id, v.vec FROM product_vectors v JOIN products p ON p.id=v.product_id JOIN stores s ON s.id=p.store_id
      WHERE v.model=? AND p.status='active' AND s.status='active' AND s.hidden=0 ${department ? 'AND p.department=?' : ''}`,
    department ? [model, department] : [model]);
  return rows.map((r) => ({ id: r.product_id, score: dot(qv, fromBlob(r.vec)) })).filter((r) => r.score >= 0).sort((a, b) => b.score - a.score).slice(0, limit);
}
