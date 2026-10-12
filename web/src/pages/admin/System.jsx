import { useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, Download, DatabaseBackup, Sparkles, Plus, Pencil, Trash2, Power, HardDrive, Cloud, Database, ArrowUp, ArrowDown, ShieldCheck } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { PageHeader, Panel } from '../../components/dash/Kit.jsx';
import { Switch, Input, Textarea, Select } from '../../components/ui/Field.jsx';
import { ErrorState } from '../../components/ui/States.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import { useAdminApi, adminApi, adminUpload, adminKey, adminSession, fmtDateTime } from './adminApi.js';

const uptime = (s) => { const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60); return [d && `${d} يوم`, h && `${h} ساعة`, `${m} دقيقة`].filter(Boolean).join(' ') ; };

function VisualPanel() {
  const toast = useToast();
  const { data, reload } = useAdminApi('/visual');
  const [f, setF] = useState(null);
  const [busy, setBusy] = useState(false);
  if (data && !f) setF({ enabled: data.enabled, model: data.model, dailyFree: String(data.dailyFree) });
  if (!data || !f) return <Panel title="البحث بالصورة"><Skeleton className="h-40 w-full" /></Panel>;
  const dirty = f.enabled !== data.enabled || f.model !== data.model || Number(f.dailyFree) !== data.dailyFree;
  const save = async () => {
    setBusy(true);
    try { await adminApi('/visual', { method: 'PUT', body: { enabled: f.enabled, model: f.model, dailyFree: Number(f.dailyFree) || 0 } }); toast({ title: 'اتحفظ' }); setF(null); reload(); }
    catch (x) { toast({ tone: 'error', title: x.message }); }
    setBusy(false);
  };
  const idx = data.indexed || {};
  const P = data.providers || {};
  const OPTS = [
    ['color', 'مطابقة الألوان والشكل', 'بحث محلي خفيف ومجاني. يفيد في الألوان والتكوين، لكنه لا يفهم نوع القطعة بدقة.', ''],
    ['cloudflare', 'فهم نوع القطعة بالذكاء الاصطناعي', 'موديل الرؤية LLaVA تجريبي (Beta)، ويقارن Cloudflare وصف الصورة بوصف وصنف المنتج. الصور تُرسل إلى Cloudflare، وقد تُحسب عمليات الاستخدام.', 'CF_AI_TOKEN'],
  ];
  const Opt = ({ id, title, body, need }) => {
    const miss = need && !P[id]?.configured;
    return (
      <button type="button" onClick={() => setF({ ...f, model: id })} aria-pressed={f.model === id}
        className={`rounded-xl border p-3 text-start transition ${f.model === id ? 'border-fg bg-secondary' : 'border-line-strong hover:border-fg'}`}>
        <p className="font-semibold">{title}</p><p className="mt-0.5 text-[12.5px] text-muted">{body}</p>
        {miss && <p className="mt-1.5 text-[12px] font-medium text-sale">محتاج متغير <span dir="ltr">{need}</span> في Railway (ومعرّف الحساب CF_ACCOUNT_ID أو R2_ACCOUNT_ID)</p>}
        {!miss && P[id]?.failed && <p className="mt-1.5 text-[12px] font-medium text-sale" dir="auto">آخر اتصال بـ Cloudflare لم ينجح: {P[id].lastError || 'خطأ غير معروف'}. تأكد أن CF_AI_TOKEN له صلاحية Workers AI Read وأن معرّف الحساب صحيح.</p>}
      </button>
    );
  };
  return (
    <Panel title="البحث بالصورة" subtitle="«صوّرها ولاقيها في بنها»" className="lg:col-span-2">
      <div className="space-y-4">
        <Switch checked={f.enabled} onChange={(v) => setF({ ...f, enabled: v })} label="تفعيل البحث بالصورة للزباين" description="لو اتقفل، الزرار بيختفي من الموقع والبحث بيتوقف." />
        <div>
          <p className="mb-2 text-sm font-medium">نوع التحليل</p>
          <div className="grid gap-2 sm:grid-cols-2">{OPTS.map(([id, title, body, need]) => <Opt key={id} id={id} title={title} body={body} need={need} />)}</div>
          <p className="mt-2 text-[12.5px] text-muted">عند تغيير النوع، صور المنتجات بتتفهرس من جديد في الخلفية. في وضع Cloudflare، صور المنتجات وصورة العميل تُرسل إلى Workers AI للتحليل وقد تُحسب عليها عمليات استخدام؛ الموقع لا يحفظ صورة العميل بعد الطلب. لو الخدمة تعطلت، البحث بالصورة يعرض رسالة مؤقتة بدل نتائج غير موثوقة.</p>
        </div>
        <label className="block max-w-xs"><span className="mb-1.5 block text-sm font-medium">عمليات بحث مجانية لكل زائر في اليوم</span>
          <Input type="number" dir="ltr" min={0} max={1000} value={f.dailyFree} onChange={(e) => setF({ ...f, dailyFree: e.target.value })} className="text-start" />
          <span className="mt-1 block text-[12px] text-muted">0 = من غير حد. ده الأساس لو حبينا نعمل باقة مدفوعة بعدين.</span></label>
        <div className="flex flex-wrap items-center gap-3"><Button onClick={save} loading={busy} disabled={!dirty}>حفظ</Button>{dirty && <span className="text-[13px] text-muted">في تغييرات لسه ما اتحفظتش</span>}</div>
        <dl className="grid gap-2 border-t border-line pt-4 text-sm sm:grid-cols-2">
          {[['متفهرس (مطابقة الألوان)', idx['color-v1'] || 0], ['متفهرس (فهم الصور)', idx['cf-vision-bge-m3'] || 0],
            ['منتجات في انتظار الفهرسة', data.pending], ['الذاكرة المستخدمة حاليًا', `${data.rssMb} MB`], ['اتصال Cloudflare', P.cloudflare?.configured ? (P.cloudflare?.failed ? 'يحتاج مراجعة' : 'متاح') : 'غير مكتمل']].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3"><dt className="text-muted">{k}</dt><dd className="font-medium" dir="auto">{v}</dd></div>
          ))}
        </dl>
      </div>
    </Panel>
  );
}

function StylistPanel() {
  const toast = useToast();
  const { data, reload } = useAdminApi('/stylist');
  const [f, setF] = useState(null);
  const [busy, setBusy] = useState(false);
  if (data && !f) setF({ enabled: data.enabled, provider: data.provider, dailyFree: String(data.dailyFree), nameAr: data.name.ar, nameEn: data.name.en });
  if (!data || !f) return <Panel title="المساعد الذكي"><Skeleton className="h-40 w-full" /></Panel>;
  const dirty = f.enabled !== data.enabled || f.provider !== data.provider || Number(f.dailyFree) !== data.dailyFree || f.nameAr !== data.name.ar || f.nameEn !== data.name.en;
  const save = async () => {
    setBusy(true);
    try { await adminApi('/stylist', { method: 'PUT', body: { enabled: f.enabled, provider: f.provider, dailyFree: Number(f.dailyFree) || 0, nameAr: f.nameAr, nameEn: f.nameEn } }); toast({ title: 'اتحفظ' }); setF(null); reload(); }
    catch (x) { toast({ tone: 'error', title: x.message }); }
    setBusy(false);
  };
  const PROV = [['anthropic', 'Claude (Anthropic)', 'أحسن فهم للعامية المصرية وأدق في الاختيار. بيتحاسب بالاستخدام (قروش للمحادثة).', 'ANTHROPIC_API_KEY'], ['cloudflare', 'Llama على Cloudflare', 'أرخص وفيه باقة مجانية يومية، لكن أقل دقة في العربي.', 'CF_AI_TOKEN']];
  return (
    <Panel title="المساعد الذكي" subtitle="بيرشّح لوك كامل من منتجات المحلات الحقيقية (نص أو صوت)" className="lg:col-span-2">
      <div className="space-y-4">
        <Switch checked={f.enabled} onChange={(v) => setF({ ...f, enabled: v })} label="تفعيل المساعد للزباين" description="لو اتقفل، زرار المساعد بيختفي من الموقع." />
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block"><span className="mb-1.5 block text-sm font-medium">اسم المساعد (عربي)</span><Input value={f.nameAr} maxLength={20} onChange={(e) => setF({ ...f, nameAr: e.target.value })} /></label>
          <label className="block"><span className="mb-1.5 block text-sm font-medium">اسم المساعد (إنجليزي)</span><Input dir="ltr" value={f.nameEn} maxLength={20} onChange={(e) => setF({ ...f, nameEn: e.target.value })} className="text-start" /></label>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-line-strong p-3">
          <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-secondary"><img src={data.avatar || '/moda/moda.webp'} alt="" className="h-full w-full object-contain" /></div>
          <div className="min-w-0">
            <p className="text-sm font-medium">صورة {data.name.ar}</p>
            <p className="mt-0.5 text-[12.5px] text-muted">الصورة الافتراضية متحركة بالكامل (رمش، كلام، عيون بتتابعك). لو رفعت صورة تانية هتتحرك حركة أبسط (تنفّس وميلان وتموّجات) لأن الرمش والكلام متظبطين على الصورة الافتراضية بس.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <label className="inline-flex cursor-pointer items-center rounded-full border border-line-strong px-3.5 py-1.5 text-[13px] font-semibold hover:border-fg">رفع صورة
                <input type="file" accept="image/*" hidden onChange={async (e) => { const file = e.target.files?.[0]; e.target.value = ''; if (!file) return; setBusy(true); try { await adminUpload('/stylist/avatar', file); toast({ title: 'اتغيرت الصورة' }); setF(null); reload(); } catch (x) { toast({ tone: 'error', title: x.code === 'image_too_small' ? 'الصورة صغيرة (200 بكسل على الأقل)' : x.message }); } setBusy(false); }} /></label>
              {data.avatar && <button type="button" disabled={busy} onClick={async () => { setBusy(true); try { await adminApi('/stylist/avatar', { method: 'DELETE' }); setF(null); reload(); } catch (x) { toast({ tone: 'error', title: x.message }); } setBusy(false); }} className="rounded-full border border-line-strong px-3.5 py-1.5 text-[13px] font-semibold hover:border-fg">رجّع الافتراضية</button>}
            </div>
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium">الموديل اللي بيفهم الكلام</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {PROV.map(([id, title, body, need]) => {
              const miss = !data.providers[id].configured;
              return (
                <button key={id} type="button" onClick={() => setF({ ...f, provider: id })} aria-pressed={f.provider === id}
                  className={`rounded-xl border p-3 text-start transition ${f.provider === id ? 'border-fg bg-secondary' : 'border-line-strong hover:border-fg'}`}>
                  <p className="font-semibold">{title}</p><p className="mt-0.5 text-[12.5px] text-muted">{body}</p>
                  {miss && <p className="mt-1.5 text-[12px] font-medium text-sale">محتاج متغير <span dir="ltr">{need}</span> في Railway{id === 'cloudflare' ? ' (و CF_ACCOUNT_ID)' : ''}</p>}
                </button>
              );
            })}
          </div>
        </div>
        <label className="block max-w-xs"><span className="mb-1.5 block text-sm font-medium">رسايل مجانية لكل زائر في اليوم</span>
          <Input type="number" dir="ltr" min={0} max={1000} value={f.dailyFree} onChange={(e) => setF({ ...f, dailyFree: e.target.value })} className="text-start" />
          <span className="mt-1 block text-[12px] text-muted">0 = من غير حد. بيحمي الميزانية من الاستخدام الزايد.</span></label>
        <div className="flex flex-wrap items-center gap-3"><Button onClick={save} loading={busy} disabled={!dirty} icon={Sparkles}>حفظ</Button>{dirty && <span className="text-[13px] text-muted">في تغييرات لسه ما اتحفظتش</span>}</div>
        {data.lastError && <p className="rounded-xl bg-sale/10 px-3 py-2 text-[13px] text-sale" dir="auto">آخر خطأ من الموديل: {data.lastError}</p>}
      </div>
    </Panel>
  );
}

function StylistPromptsPanel() {
  const toast = useToast();
  const { data, error, loading, reload } = useAdminApi('/stylist/prompts');
  const [items, setItems] = useState(null);
  const [busy, setBusy] = useState(false);
  if (data && !items) setItems(data.items.map((p) => ({ ...p })));
  if (loading && !data) return <Panel title="الأسئلة الجاهزة لمودة"><Skeleton className="h-56 w-full" /></Panel>;
  if (error && !data) return <Panel title="الأسئلة الجاهزة لمودة"><ErrorState error={error} onRetry={reload} /></Panel>;
  if (!items) return null;
  const dirty = JSON.stringify(items) !== JSON.stringify(data.items);
  const patchItem = (index, patch) => setItems((current) => current.map((p, i) => i === index ? { ...p, ...patch } : p));
  const move = (index, delta) => setItems((current) => { const next = [...current]; const target = index + delta; if (target < 0 || target >= next.length) return current; [next[index], next[target]] = [next[target], next[index]]; return next; });
  const save = async () => {
    setBusy(true);
    try { const result = await adminApi('/stylist/prompts', { method: 'PUT', body: { items } }); setItems(result.items); toast({ title: 'اتحفظت أسئلة مودة وإجاباتها النموذجية' }); reload(); }
    catch (x) { toast({ tone: 'error', title: x.message }); }
    setBusy(false);
  };
  const add = () => {
    const id = `custom-${globalThis.crypto?.randomUUID?.() || Date.now()}`;
    setItems((current) => [...current, { id, textAr: '', textEn: '', guidance: '', active: true }]);
  };
  return (
    <Panel title="الأسئلة الجاهزة وإجابات مودة" subtitle="عدّل الاقتراحات التي تظهر للعميل. اربط كل سؤال برد نموذجي أو توجيه؛ مودة تستخدمه عند الضغط على السؤال ثم تختار المنتجات والأسعار من المخزون الحقيقي." className="lg:col-span-3">
      <div className="space-y-4">
        {items.map((item, i) => <article key={item.id} className="space-y-3 rounded-2xl border border-line bg-secondary/30 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Switch checked={item.active} onChange={(active) => patchItem(i, { active })} label={`إظهار الاقتراح ${i + 1} للعميل`} />
            <div className="flex items-center gap-1">
              <Button type="button" size="xs" variant="outline" disabled={i === 0} onClick={() => move(i, -1)} aria-label="تحريك لأعلى"><ArrowUp className="h-4 w-4" /></Button>
              <Button type="button" size="xs" variant="outline" disabled={i === items.length - 1} onClick={() => move(i, 1)} aria-label="تحريك لأسفل"><ArrowDown className="h-4 w-4" /></Button>
              <Button type="button" size="xs" variant="outline" disabled={items.length <= 1} onClick={() => setItems((current) => current.filter((_, j) => j !== i))} aria-label="حذف الاقتراح"><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block"><span className="mb-1 block text-sm font-medium">نص السؤال بالعربي</span><Input value={item.textAr} maxLength={120} onChange={(e) => patchItem(i, { textAr: e.target.value })} placeholder="مثال: عندي قميص أزرق، إيه الكوتشي المناسب؟" /></label>
            <label className="block"><span className="mb-1 block text-sm font-medium">نص السؤال بالإنجليزي</span><Input dir="ltr" value={item.textEn} maxLength={120} onChange={(e) => patchItem(i, { textEn: e.target.value })} className="text-start" placeholder="Example: Which sneakers go with my blue shirt?" /></label>
          </div>
          <label className="block"><span className="mb-1 block text-sm font-medium">الإجابة النموذجية أو التوجيه لمودة</span><Textarea rows={3} value={item.guidance} maxLength={1400} onChange={(e) => patchItem(i, { guidance: e.target.value })} placeholder="اكتب نوع القطعة التي تبحث عنها مودة، ما الذي تتجاهله، الألوان المناسبة، الميزانية، وطريقة الرد." /></label>
        </article>)}
        <p className="text-xs text-muted">تقدر ترتب أو توقف الاقتراحات، وتضيف حتى 8 اقتراحات. مودة لا تعرض الإجابة النموذجية حرفيًا؛ تستخدمها كقاعدة وتتحقق من المنتجات والأسعار المتاحة.</p>
        <div className="flex flex-wrap gap-2"><Button type="button" variant="outline" icon={Plus} onClick={add} disabled={items.length >= 8}>إضافة سؤال جاهز</Button><Button type="button" icon={Sparkles} onClick={save} loading={busy} disabled={!dirty}>حفظ الأسئلة والإجابات</Button></div>
      </div>
    </Panel>
  );
}

const emptyGuideItem = () => ({ id: `guide-${globalThis.crypto?.randomUUID?.() || Date.now()}`, titleAr: '', tags: [], rule: '', example: '', avoid: '', sources: [], active: true });
const parseGuideTags = (value) => value.split(/[،,\n]/).map((tag) => tag.trim()).filter(Boolean).slice(0, 16);

function StylistGuidePanel() {
  const toast = useToast();
  const { data, error, loading, reload } = useAdminApi('/stylist/guide');
  const [items, setItems] = useState(null);
  const [busy, setBusy] = useState(false);
  if (data && !items) setItems(data.items.map((item) => ({ ...item, tags: [...item.tags], sources: [...item.sources] })));
  if (loading && !data) return <Panel title="دليل تنسيق مودة"><Skeleton className="h-56 w-full" /></Panel>;
  if (error && !data) return <Panel title="دليل تنسيق مودة"><ErrorState error={error} onRetry={reload} /></Panel>;
  if (!items) return null;
  const dirty = JSON.stringify(items) !== JSON.stringify(data.items);
  const patchItem = (index, patch) => setItems((current) => current.map((item, i) => i === index ? { ...item, ...patch } : item));
  const move = (index, delta) => setItems((current) => { const next = [...current]; const target = index + delta; if (target < 0 || target >= next.length) return current; [next[index], next[target]] = [next[target], next[index]]; return next; });
  const save = async () => {
    setBusy(true);
    try { const result = await adminApi('/stylist/guide', { method: 'PUT', body: { items } }); setItems(result.items); toast({ title: 'اتحفظ دليل تنسيق مودة' }); reload(); }
    catch (x) { toast({ tone: 'error', title: x.message }); }
    setBusy(false);
  };
  const add = () => setItems((current) => [...current, emptyGuideItem()]);
  return (
    <Panel title="دليل تنسيق مودة" subtitle="قواعد مستخلصة من مناهج تنسيق الأزياء وآراء مصممين وتجارة أزياء مصرية. مودة تختار قاعدتين مرتبطتين بالسؤال فقط؛ كل قاعدة اختيار مرن وليست قانونًا ثابتًا." className="lg:col-span-3">
      <div className="space-y-4">
        <p className="rounded-xl bg-secondary/60 p-3 text-sm text-muted">عدّل دليل الاستشارة والستايلات والألوان والقصّات والمناسبات والاحتشام والإكسسوارات. المنتجات والأسعار تظل من كتالوج المحلات الفعلي. هذا الدليل يوجّه رد مودة ولا يدرّب الموديل تلقائيًا؛ لا يضيف استدعاءً منفصلًا، لكنه يضيف تعليمات قصيرة للسؤال المناسب.</p>
        {!items.length && <p className="rounded-xl border border-dashed border-line-strong p-5 text-center text-sm text-muted">الدليل فارغ؛ أضف قاعدة جديدة للبدء.</p>}
        {items.map((item, i) => <article key={item.id} className="rounded-2xl border border-line bg-secondary/20 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-semibold">{item.titleAr || `قاعدة جديدة ${i + 1}`}</span>
            <div className="flex shrink-0 items-center gap-1">
              <Button type="button" size="xs" variant="outline" disabled={i === 0} onClick={() => move(i, -1)} aria-label="تحريك لأعلى"><ArrowUp className="h-4 w-4" /></Button>
              <Button type="button" size="xs" variant="outline" disabled={i === items.length - 1} onClick={() => move(i, 1)} aria-label="تحريك لأسفل"><ArrowDown className="h-4 w-4" /></Button>
              <Button type="button" size="xs" variant="outline" onClick={() => setItems((current) => current.filter((_, j) => j !== i))} aria-label="حذف القاعدة"><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
          <details open={i === 0} className="mt-3"><summary className="cursor-pointer text-sm text-muted">تعديل القاعدة ومصادرها</summary><div className="mt-3 space-y-3">
            <Switch checked={item.active} onChange={(active) => patchItem(i, { active })} label="استخدم القاعدة في ردود مودة" />
            <label className="block"><span className="mb-1 block text-sm font-medium">عنوان القاعدة</span><Input value={item.titleAr} maxLength={100} onChange={(e) => patchItem(i, { titleAr: e.target.value })} placeholder="مثال: ألوان متناسقة لجامعة أو خروجة" /></label>
            <label className="block"><span className="mb-1 block text-sm font-medium">كلمات تدل على وقت استخدام القاعدة (افصل بينها بفاصلة)</span><Input value={item.tags.join('، ')} maxLength={800} onChange={(e) => patchItem(i, { tags: parseGuideTags(e.target.value) })} placeholder="مثال: جامعة، كاجوال، يومي، casual" /></label>
            <label className="block"><span className="mb-1 block text-sm font-medium">القاعدة العملية</span><Textarea rows={4} required maxLength={1800} value={item.rule} onChange={(e) => patchItem(i, { rule: e.target.value })} placeholder="اكتب طريقة التفكير، ومتى تنطبق، وكيف توازن بين ذوق العميل والمناسبة والراحة." /></label>
            <label className="block"><span className="mb-1 block text-sm font-medium">مثال مصري تطبيقي</span><Textarea rows={2} maxLength={1200} value={item.example} onChange={(e) => patchItem(i, { example: e.target.value })} placeholder="مثال اختياري يوضح القاعدة في موقف واقعي." /></label>
            <label className="block"><span className="mb-1 block text-sm font-medium">أخطاء أو تعميمات يجب تجنبها</span><Textarea rows={2} maxLength={800} value={item.avoid} onChange={(e) => patchItem(i, { avoid: e.target.value })} placeholder="مثال: لا تفترض ذوق العميل ولا تكرر القطعة التي يملكها." /></label>
            {!!Object.keys(data.sources || {}).length && <fieldset><legend className="mb-2 text-sm font-medium">المصادر التي تدعم القاعدة</legend><div className="grid gap-2 sm:grid-cols-2">{Object.entries(data.sources).map(([id, source]) => <label key={id} className="flex items-start gap-2 rounded-lg border border-line p-2.5 text-[12px]"><input type="checkbox" checked={item.sources.includes(id)} onChange={(e) => patchItem(i, { sources: e.target.checked ? [...item.sources, id] : item.sources.filter((x) => x !== id) })} className="mt-0.5" /><span><span className="block font-medium">{source.title}</span><a href={source.url} target="_blank" rel="noreferrer" className="mt-0.5 block break-all text-brand underline">فتح المصدر</a></span></label>)}</div></fieldset>}
          </div></details>
        </article>)}
        <div className="flex flex-wrap gap-2"><Button type="button" variant="outline" icon={Plus} onClick={add} disabled={items.length >= 24}>إضافة قاعدة</Button><Button type="button" icon={Sparkles} onClick={save} loading={busy} disabled={!dirty}>حفظ دليل التنسيق</Button><span className="self-center text-xs text-muted">{items.filter((item) => item.active).length} قاعدة مفعّلة من {items.length}</span></div>
        <div className="border-t border-line pt-3"><p className="mb-2 text-xs font-semibold text-muted">المراجع التي بُنيت عليها النسخة الأولية</p><ul className="space-y-1 text-xs text-muted">{Object.entries(data.sources || {}).map(([id, source]) => <li key={id}><a href={source.url} target="_blank" rel="noreferrer" className="text-brand underline">{source.title}</a></li>)}</ul></div>
      </div>
    </Panel>
  );
}

function AdminSecurityPanel({ security, reload }) {
  const toast = useToast();
  const [confirmEnable, setConfirmEnable] = useState(false);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  if (!security) return null;
  const setEnabled = async (enabled) => {
    setBusy(true);
    try {
      const result = await adminApi('/security/two-step', { method: 'PUT', body: { enabled, ...(enabled ? { code } : {}) } });
      adminSession.set(result.session || '');
      setConfirmEnable(false); setCode('');
      toast({ title: enabled ? 'اتفعّل تأكيد الدخول بخطوتين' : 'اتوقف تأكيد الدخول بخطوتين' });
      reload();
    } catch (x) { toast({ tone: 'error', title: x.code === 'bad_code' ? 'كود المصادقة غلط أو اتستخدم قبل كده' : x.message }); }
    setBusy(false);
  };
  return (
    <Panel title="أمان دخول الأدمن" subtitle="مفتاح الإدارة يظل مطلوبًا دائمًا. تقدر تدخل بالمفتاح وحده الآن، وتفعّل رمز تطبيق المصادقة عندما تكون جاهزًا." className="lg:col-span-3">
      <div className="space-y-3">
        <Switch checked={security.twoStepEnabled} onChange={(enabled) => {
          if (enabled) {
            if (!security.twoStepConfigured) toast({ tone: 'error', title: 'اضبط ADMIN_TOTP_SECRET في Railway أولًا' });
            else setConfirmEnable(true);
          } else { setConfirmEnable(false); setCode(''); setEnabled(false); }
        }} label="طلب رمز من تطبيق المصادقة عند دخول الأدمن" description={security.twoStepEnabled ? 'مفعّل: مفتاح الإدارة ورمز التطبيق مطلوبان.' : 'متوقف حاليًا: الدخول بمفتاح الإدارة فقط.'} />
        {!security.twoStepConfigured && <p className="text-sm text-muted">لتفعيله لاحقًا، جهّز ADMIN_TOTP_SECRET في Railway من أمر إعداد الأدمن، ثم ارجع هنا.</p>}
        {confirmEnable && !security.twoStepEnabled && <div className="flex flex-wrap items-end gap-2 rounded-xl border border-line-strong p-3">
          <label className="block"><span className="mb-1 block text-sm font-medium">اكتب كود المصادقة الحالي لتأكيد التفعيل</span><Input dir="ltr" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} className="text-start tracking-[0.3em]" /></label>
          <Button type="button" icon={ShieldCheck} loading={busy} disabled={code.length !== 6} onClick={() => setEnabled(true)}>تأكيد وتفعيل</Button>
          <Button type="button" variant="outline" onClick={() => { setConfirmEnable(false); setCode(''); }}>إلغاء</Button>
        </div>}
      </div>
    </Panel>
  );
}

const emptyTrainingForm = () => ({ userMessage: '', badResponse: '', correctedResponse: '', reason: '', topic: 'category', active: true });
const TRAINING_TOPICS = [
  ['category', 'نوع القطعة / ترشيح المنتج'], ['color', 'ألوان وتنسيق'], ['occasion', 'مناسبة'], ['modest', 'احتشام وطرحة'],
  ['fit', 'قصة ومقاس'], ['budget', 'ميزانية'], ['tone', 'طريقة الرد'], ['other', 'أخرى'],
];

function StylistTrainingPanel() {
  const toast = useToast();
  const { data, error, loading, reload } = useAdminApi('/stylist/training');
  const { data: feedbackData, error: feedbackError, reload: reloadFeedback } = useAdminApi('/stylist/feedback');
  const [form, setForm] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [sourceFeedbackId, setSourceFeedbackId] = useState(null);
  const [busy, setBusy] = useState(false);
  if (data && form === null) setForm(emptyTrainingForm());
  if (loading && !data) return <Panel title="تعليم مودة من التصحيحات"><Skeleton className="h-56 w-full" /></Panel>;
  if (error && !data) return <Panel title="تعليم مودة من التصحيحات"><ErrorState error={error} onRetry={reload} /></Panel>;
  if (!form) return null;
  const items = data?.items || [];
  const reset = () => { setEditingId(null); setSourceFeedbackId(null); setForm(emptyTrainingForm()); };
  const save = async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      if (sourceFeedbackId) await adminApi(`/stylist/feedback/${sourceFeedbackId}/train`, { method: 'POST', body: form });
      else await adminApi(editingId ? `/stylist/training/${editingId}` : '/stylist/training', { method: editingId ? 'PUT' : 'POST', body: form });
      toast({ title: sourceFeedbackId ? 'اتراجع الرد واتضاف التصحيح لمودة' : editingId ? 'اتحفظ التصحيح' : 'اتضاف المثال لمودة' }); reset(); reload(); reloadFeedback();
    } catch (x) { toast({ tone: 'error', title: x.message }); }
    setBusy(false);
  };
  const edit = (item) => {
    setEditingId(item.id);
    setSourceFeedbackId(null);
    setForm({ userMessage: item.user_message, badResponse: item.bad_response, correctedResponse: item.corrected_response, reason: item.reason, topic: item.topic, active: !!item.active });
    document.getElementById('stylist-training-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  const toggle = async (item) => {
    setBusy(true);
    try { await adminApi(`/stylist/training/${item.id}`, { method: 'PATCH', body: { active: !item.active } }); toast({ title: item.active ? 'مودة مش هتستخدم المثال ده' : 'مودة هتستخدم المثال ده في الحالات القريبة' }); reload(); }
    catch (x) { toast({ tone: 'error', title: x.message }); }
    setBusy(false);
  };
  const remove = async (item) => {
    if (!window.confirm('تمسح المثال ده نهائيًا؟')) return;
    setBusy(true);
    try { await adminApi(`/stylist/training/${item.id}`, { method: 'DELETE' }); if (editingId === item.id) reset(); toast({ title: 'اتمسح المثال' }); reload(); }
    catch (x) { toast({ tone: 'error', title: x.message }); }
    setBusy(false);
  };
  const trainFeedback = (item) => {
    setEditingId(null); setSourceFeedbackId(item.id);
    setForm({ ...emptyTrainingForm(), userMessage: item.user_message, badResponse: item.assistant_response, topic: 'other' });
    document.getElementById('stylist-training-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  const dismissFeedback = async (item) => {
    setBusy(true);
    try { await adminApi(`/stylist/feedback/${item.id}`, { method: 'PATCH', body: { status: 'dismissed' } }); toast({ title: 'اتشالت من قائمة المراجعة' }); reloadFeedback(); }
    catch (x) { toast({ tone: 'error', title: x.message }); }
    setBusy(false);
  };
  return (
    <Panel title="علّم مودة من تصحيحاتك" subtitle="اكتب السؤال، الرد الغلط، الرد الصح والسبب. من غير اسم أو رقم تليفون العميل. مودة تستفيد من الأمثلة القريبة بس؛ ده مش تدريب تلقائي للموديل." className="lg:col-span-3">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <form id="stylist-training-form" onSubmit={save} className="space-y-3 rounded-2xl border border-line bg-secondary/40 p-4">
          <div className="flex items-center justify-between gap-2"><h3 className="font-semibold">{sourceFeedbackId ? 'مراجعة بلاغ وتحويله لتصحيح' : editingId ? 'تعديل مثال' : 'مثال جديد'}</h3>{(editingId || sourceFeedbackId) && <Button type="button" size="xs" variant="outline" onClick={reset}>إلغاء التعديل</Button>}</div>
          <label className="block"><span className="mb-1 block text-sm font-medium">نوع الغلطة</span><Select value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })}>{TRAINING_TOPICS.map(([v, label]) => <option key={v} value={v}>{label}</option>)}</Select></label>
          <label className="block"><span className="mb-1 block text-sm font-medium">الزبون قال إيه؟</span><Textarea rows={2} required maxLength={700} value={form.userMessage} onChange={(e) => setForm({ ...form, userMessage: e.target.value })} placeholder="مثال: عايز كوتشي أبيض للمشي" /></label>
          <label className="block"><span className="mb-1 block text-sm font-medium">مودة ردت بإيه غلط؟</span><Textarea rows={2} required maxLength={1200} value={form.badResponse} onChange={(e) => setForm({ ...form, badResponse: e.target.value })} placeholder="الرد أو الترشيح الغلط" /></label>
          <label className="block"><span className="mb-1 block text-sm font-medium">الرد أو التصرف الصح</span><Textarea rows={3} required maxLength={1200} value={form.correctedResponse} onChange={(e) => setForm({ ...form, correctedResponse: e.target.value })} placeholder="اكتب الرد الصح أو نوع المنتجات اللي كان لازم ترشحها" /></label>
          <label className="block"><span className="mb-1 block text-sm font-medium">ليه ده هو الصح؟</span><Textarea rows={2} required maxLength={700} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="القاعدة اللي مودة تتعلمها من المثال" /></label>
          <div className="flex flex-wrap items-center justify-between gap-3"><Switch checked={form.active} onChange={(v) => setForm({ ...form, active: v })} label="استخدم المثال مع الأسئلة القريبة" /><Button type="submit" loading={busy} icon={editingId ? Pencil : sourceFeedbackId ? Sparkles : Plus}>{sourceFeedbackId ? 'اعتماد التصحيح' : editingId ? 'حفظ التصحيح' : 'إضافة المثال'}</Button></div>
        </form>
        <div>
          <div className="mb-5">
            <div className="mb-3 flex items-center justify-between gap-2"><h3 className="font-semibold">بلاغات من محادثات الزباين</h3><span className="text-sm text-muted">{feedbackData?.items?.length || 0} للمراجعة</span></div>
            {feedbackError && <p className="mb-2 text-sm text-sale">تعذر تحميل البلاغات: {feedbackError.message}</p>}
            {!feedbackData?.items?.length ? <p className="rounded-xl border border-dashed border-line-strong p-4 text-center text-sm text-muted">مفيش بلاغات جديدة. الزبون يقدر يضغط «الرد مش مناسب» تحت رد مودة.</p> : <ul className="max-h-[380px] space-y-3 overflow-y-auto pe-1">{feedbackData.items.map((item) => <li key={item.id} className="rounded-2xl border border-line bg-elevated p-3.5">
              <p className="text-xs text-muted">{fmtDateTime(item.created_at)}</p>
              <p className="mt-1 text-sm"><b>السؤال:</b> {item.user_message}</p>
              <p className="mt-1 text-sm"><b>رد مودة:</b> {item.assistant_response}</p>
              {!!item.products?.length && <p className="mt-1 text-xs text-muted"><b>المنتجات اللي ظهرت:</b> {item.products.map((p) => p.name_ar || p.name_en || `#${p.id}`).join('، ')}</p>}
              <p className="mt-1 text-xs text-muted">الصور نفسها مش محفوظة. راجع السؤال والرد قبل ما تعتمد تصحيح.</p>
              <div className="mt-2 flex flex-wrap gap-2"><Button size="xs" icon={Pencil} onClick={() => trainFeedback(item)}>اكتب التصحيح</Button><Button size="xs" variant="outline" loading={busy} onClick={() => dismissFeedback(item)}>تجاهل البلاغ</Button></div>
            </li>)}</ul>}
          </div>
          <div className="mb-3 flex items-center justify-between gap-2"><h3 className="font-semibold">أمثلة التصحيح المعتمدة</h3><span className="text-sm text-muted">{items.length} مثال · {items.filter((x) => x.active).length} مفعّل</span></div>
          {!items.length ? <p className="rounded-xl border border-dashed border-line-strong p-6 text-center text-sm text-muted">لسه مفيش أمثلة. أول تصحيح تضيفه هيظهر هنا.</p> : (
            <ul className="max-h-[680px] space-y-3 overflow-y-auto pe-1">
              {items.map((item) => <li key={item.id} className="rounded-2xl border border-line p-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2"><span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-brand">{TRAINING_TOPICS.find(([v]) => v === item.topic)?.[1] || item.topic}</span><span className={`text-xs font-medium ${item.active ? 'text-emerald-700' : 'text-muted'}`}>{item.active ? 'مفعّل' : 'متوقف'}</span></div>
                <p className="mt-2 text-sm"><b>السؤال:</b> {item.user_message}</p>
                <p className="mt-1 text-sm text-sale"><b>الرد الغلط:</b> {item.bad_response}</p>
                <p className="mt-1 text-sm text-emerald-800"><b>الرد الصح:</b> {item.corrected_response}</p>
                <p className="mt-1 text-xs text-muted"><b>القاعدة:</b> {item.reason}</p>
                <div className="mt-3 flex flex-wrap gap-2"><Button size="xs" variant="outline" icon={Pencil} onClick={() => edit(item)}>تعديل</Button><Button size="xs" variant="outline" icon={Power} loading={busy} onClick={() => toggle(item)}>{item.active ? 'إيقاف' : 'تفعيل'}</Button><Button size="xs" variant="outline" icon={Trash2} loading={busy} onClick={() => remove(item)}>حذف</Button></div>
              </li>)}
            </ul>
          )}
        </div>
      </div>
    </Panel>
  );
}

function BackupPanel({ data, reload }) {
  const toast = useToast();
  const [busy, setBusy] = useState('');
  const download = async () => {
    setBusy('dl');
    try {
      const res = await fetch('/api/admin/backup/db', { headers: { 'x-admin-key': adminKey.get(), 'x-admin-session': adminSession.get() } });
      if (!res.ok) throw new Error('تعذر تحميل النسخة');
      const a = document.createElement('a'); a.href = URL.createObjectURL(await res.blob()); a.download = `banha-outfit-${new Date().toISOString().slice(0, 10)}.db`; a.click(); URL.revokeObjectURL(a.href);
    } catch (x) { toast({ tone: 'error', title: x.message }); }
    setBusy('');
  };
  const run = async () => {
    setBusy('run');
    try { await adminApi('/backup/run', { method: 'POST', body: {} }); toast({ title: 'تم أخذ نسخة احتياطية' }); reload(); } catch (x) { toast({ tone: 'error', title: x.message }); }
    setBusy('');
  };
  const b = data.backup;
  return (
    <Panel title="النسخ الاحتياطي" subtitle="قاعدة البيانات (الطلبات والمنتجات والحسابات) والصور">
      <p className="text-sm text-muted">{data.backupDir ? (b ? `آخر نسخة: ${fmtDateTime(b.at.slice(0, 19).replace('T', ' '))} — ${(b.bytes / 1048576).toFixed(1)} ميجا، صور جديدة: ${b.media.copied}` : 'مفيش نسخة لسه — هتتاخد تلقائياً بعد تشغيل السيرفر بدقيقة.') : 'النسخ اليومي التلقائي مش مفعّل: اضبط BACKUP_DIR على مجلد على قرص دائم.'}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {data.backupDir && <Button size="sm" variant="outline" icon={DatabaseBackup} loading={busy === 'run'} onClick={run}>خد نسخة دلوقتي</Button>}
        <Button size="sm" variant="outline" icon={Download} loading={busy === 'dl'} onClick={download}>تحميل نسخة من قاعدة البيانات</Button>
      </div>
      <p className="mt-3 text-[12px] text-muted">احتفظ بنسخة على جهازك أو على Google Drive كل فترة، لأن نسخة على نفس السيرفر مش بتحميك لو السيرفر نفسه اتمسح.</p>
    </Panel>
  );
}

const fmtBytes = (n) => {
  if (!Number.isFinite(Number(n))) return 'غير متاح';
  const units = ['بايت', 'KB', 'MB', 'GB', 'TB'];
  let value = Number(n), i = 0;
  while (value >= 1024 && i < units.length - 1) { value /= 1024; i++; }
  return `${value.toFixed(i < 2 ? 0 : 1)} ${units[i]}`;
};

function ResourcePanel() {
  const { data, error, loading, reload } = useAdminApi('/resources');
  const disk = data?.disk;
  const database = data?.database;
  const r2 = data?.r2;
  const diskPercent = disk?.totalBytes ? Math.min(100, disk.usedBytes / disk.totalBytes * 100) : 0;
  const standardGB = (r2?.standardBytes || 0) / (1024 ** 3);
  const includedGB = 10;
  const headroomGB = Math.max(0, includedGB - standardGB);
  return (
    <Panel title="مساحة الاستضافة والتخزين" subtitle="تحديث يدوي أو تلقائي عند فتح الصفحة؛ قياسات R2 ممكن تتأخر قليلًا عن آخر رفع." className="lg:col-span-3">
      {error && !data ? <ErrorState error={error} onRetry={reload} /> : loading && !data ? <Skeleton className="h-36 w-full" /> : (
        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-2xl border border-line bg-secondary/30 p-4">
            <div className="mb-3 flex items-center gap-2"><HardDrive className="h-5 w-5 text-brand" /><h3 className="font-semibold">قرص السيرفر</h3></div>
            {disk?.totalBytes ? <>
              <p className="text-sm">المستخدم <b>{fmtBytes(disk.usedBytes)}</b> من <b>{fmtBytes(disk.totalBytes)}</b></p>
              <div className="my-3 h-2 overflow-hidden rounded-full bg-line"><div className={`h-full rounded-full ${diskPercent > 90 ? 'bg-sale' : 'bg-brand'}`} style={{ width: `${diskPercent}%` }} /></div>
              <p className="text-sm text-muted">المتاح: {fmtBytes(disk.freeBytes)} · {diskPercent.toFixed(1)}% مستخدم</p>
              <p className="mt-2 break-all text-xs text-muted" dir="ltr">{disk.path}</p>
              <p className="mt-2 text-xs text-muted">ده حجم نظام الملفات الموجود عليه ملف قاعدة البيانات. حد الخطة أو حجم Volume في Railway/Render راجعه في لوحة الاستضافة؛ ممكن يختلف عن الرقم هنا.</p>
              {diskPercent >= 85 && <p className="mt-3 flex items-center gap-2 rounded-xl bg-sale/10 px-3 py-2 text-sm font-medium text-sale"><AlertTriangle className="h-4 w-4 shrink-0" />المساحة قربت تمتلئ؛ راجع الملفات أو كبّر الـVolume.</p>}
            </> : <p className="text-sm text-muted">تعذر قراءة مساحة القرص{disk?.error ? `: ${disk.error}` : ' من السيرفر'}.</p>}
            <p className="mt-3 border-t border-line pt-3 text-sm text-muted">حجم قاعدة البيانات: <b className="text-fg">{database?.bytes != null ? fmtBytes(database.bytes) : 'غير متاح'}</b></p>
          </section>
          <section className="rounded-2xl border border-line bg-secondary/30 p-4">
            <div className="mb-3 flex items-center gap-2"><Database className="h-5 w-5 text-brand" /><h3 className="font-semibold">ذاكرة التطبيق</h3></div>
            <p className="text-sm">استهلاك العملية: <b>{fmtBytes(data?.memory?.rssBytes)}</b></p>
            <p className="mt-1 text-sm text-muted">ذاكرة JavaScript المستخدمة: {fmtBytes(data?.memory?.heapUsedBytes)} من {fmtBytes(data?.memory?.heapTotalBytes)}</p>
            <p className="mt-2 text-xs text-muted">ده استهلاك تطبيق Node نفسه، مش إجمالي حد الذاكرة أو الفاتورة في Railway. راجع تبويب Metrics في Railway للقياس الكامل.</p>
          </section>
          <section className="rounded-2xl border border-line bg-secondary/30 p-4">
            <div className="mb-3 flex items-center gap-2"><Cloud className="h-5 w-5 text-brand" /><h3 className="font-semibold">Cloudflare R2</h3></div>
            {r2?.standardBytes != null ? <>
              <p className="text-sm">Standard: <b>{fmtBytes(r2.standardBytes)}</b> · {r2.standardObjects.toLocaleString('ar-EG')} عنصر</p>
              {!!r2.infrequentAccessBytes && <p className="mt-1 text-sm">Infrequent Access: <b>{fmtBytes(r2.infrequentAccessBytes)}</b></p>}
              <div className="my-3 h-2 overflow-hidden rounded-full bg-line"><div className={`h-full rounded-full ${standardGB >= includedGB ? 'bg-sale' : 'bg-brand'}`} style={{ width: `${Math.min(100, standardGB / includedGB * 100)}%` }} /></div>
              <p className="text-sm text-muted">الاستخدام الحالي مقابل 10 GB-month المجانية: فرق تقديري {headroomGB.toFixed(2)} GB-month.</p>
              <p className="mt-2 text-xs text-muted">القياس يشمل كل الـbuckets في حساب Cloudflare، وممكن يتأخر. الـ10 GB-month حد مجاني للفوترة وليس حدًا يمنع التخزين؛ الفوترة تعتمد متوسط التخزين طوال الشهر، والزيادة قد تُحاسب.</p>
              <p className="mt-2 text-xs text-muted">آخر قياس: {r2.measuredAt ? fmtDateTime(r2.measuredAt.slice(0, 19).replace('T', ' ')) : '—'}</p>
            </> : <p className="text-sm text-muted">{r2?.error ? `تعذر جلب قياس R2: ${r2.error}` : 'قياس Cloudflare غير مفعّل. اضبط CF_R2_METRICS_TOKEN مع CF_ACCOUNT_ID (أو R2_ACCOUNT_ID) لعرضه.'}</p>}
          </section>
        </div>
      )}
      <div className="mt-3 flex items-center justify-between gap-3"><p className="text-xs text-muted">{data?.checkedAt ? `آخر فحص: ${fmtDateTime(data.checkedAt.slice(0, 19).replace('T', ' '))}` : ''}</p><Button size="xs" variant="outline" loading={loading} onClick={reload}>تحديث المساحة</Button></div>
    </Panel>
  );
}

export default function System() {
  const { data, error, loading, reload } = useAdminApi('/status');
  if (error && !data) return <ErrorState error={error} onRetry={reload} />;
  const required = (data?.checks || []).filter((c) => !c.optional);
  const bad = required.filter((c) => !c.ok);
  return (
    <div>
      <PageHeader title="النظام والأمان" subtitle="جاهزية الموقع للإنتاج" />
      {loading && !data ? <Skeleton className="h-64 w-full rounded-2xl" /> : (
        <div className="grid gap-4 lg:grid-cols-3">
          <Panel title="قائمة الجاهزية" className="lg:col-span-2" subtitle={bad.length ? `${bad.length} حاجة لازم تتظبط قبل الإنتاج` : 'كل الإعدادات الأساسية تمام'}>
            <ul className="space-y-3">
              {data.checks.map((c) => (
                <li key={c.id} className="flex items-start gap-3">
                  {c.ok ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /> : c.optional ? <Info className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" /> : <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-sale" />}
                  <div><p className="font-medium">{c.label}</p>{!c.ok && <p className="text-[13px] text-muted">{c.fix}</p>}</div>
                </li>
              ))}
            </ul>
          </Panel>
          <BackupPanel data={data} reload={reload} />
          <ResourcePanel />
          <VisualPanel />
          <AdminSecurityPanel security={data.security} reload={reload} />
          <StylistPanel />
          <StylistPromptsPanel />
          <StylistGuidePanel />
          <StylistTrainingPanel />
          <Panel title="السيرفر">
            <dl className="space-y-3 text-sm">
              {[['البيئة', data.env], ['Node', data.node], ['شغال من', uptime(data.uptimeSec)], ['واتساب API', data.whatsappConfigured ? 'متوصل' : 'غير متوصل'], ['قالب واتساب', data.template], ['التسجيل العام', data.registrationOpen ? 'مفتوح' : 'مقفول']].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3"><dt className="text-muted">{k}</dt><dd className="font-medium" dir="ltr">{v}</dd></div>
              ))}
            </dl>
          </Panel>
        </div>
      )}
    </div>
  );
}
