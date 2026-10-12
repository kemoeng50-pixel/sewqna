/**
 * Practical styling playbook for Moda. These are adaptable rules of thumb, not
 * universal rules about bodies or taste. The examples are original Egyptian
 * Arabic examples written for this catalogue.
 *
 * The guide is distilled from fashion-school curricula and Egyptian retail and
 * designer perspectives. Its recommendations are flexible options, not rules.
 */
export const STYLE_GUIDE_SOURCES = {
  ual_personal: {
    title: 'UAL / London College of Fashion — Personal Styling',
    url: 'https://www.arts.ac.uk/subjects/fashion-styling-and-make-up/short-courses/personal-styling/personal-styling-short-course-lcf',
  },
  fit_consulting: {
    title: 'FIT — Foundations in Professional Image Consulting',
    url: 'https://www.fitnyc.edu/academics/academic-divisions/ccps/noncredit/image-consulting.php',
  },
  ual_intermediate: {
    title: 'UAL / London College of Fashion — Personal Styling Intermediate',
    url: 'https://www.arts.ac.uk/subjects/fashion-styling-and-make-up/short-courses/personal-styling/personal-styling-intermediate-short-course-lcf',
  },
  ahram_modest: {
    title: 'Ahram Online — Egyptian modest fashion and local retail',
    url: 'https://english.ahram.org.eg/UI/Front/Inner.aspx?NewsContentID=550607',
  },
  scene_designer: {
    title: 'Scene Styled — Egyptian couturier on personal expression and modest design',
    url: 'https://scenenow.com/Styled/Egyptian-Couturier-By-Hana-El-Morshedy-Reveals-the-Soul-Not-the-Skin',
  },
};

export const DEFAULT_STYLE_GUIDE = [
  {
    id: 'client-brief', titleAr: 'ابدئي بذوق الشخص واحتياجه',
    tags: ['ستايل شخصي', 'ذوق', 'مناسبة', 'ميزانية', 'راحة', 'شخصيتي', 'ستايل', 'personal style', 'client', 'occasion', 'budget'],
    rule: 'حددي من كلام العميل المناسبة، والراحة المطلوبة، والميزانية، والستايل الذي يحبه، والقطعة الموجودة عنده. اختاري تنسيقًا يعبر عن ذوقه بدل فرض قاعدة واحدة. اسألي سؤالًا واحدًا فقط لو تفصيلة ناقصة ستغيّر الترشيح فعلًا.',
    example: 'لو العميل قال «عايز حاجة بسيطة للجامعة»، اختاري قطعًا مريحة وسهلة الحركة وألوانًا يفضلها، واسألي عن الميزانية فقط إذا كانت ستحدد المتاح.',
    avoid: 'ما تفترضيهوش رسمي أو جريء أو محب للألوان من غير ما يقول؛ وما تحوّليش كل سؤال لاستجواب.',
    sources: ['ual_personal', 'fit_consulting', 'scene_designer'], active: true,
  },
  {
    id: 'style-directions', titleAr: 'اختاري الستايل المطلوب وعبّري عنه بوضوح',
    tags: ['كاجوال', 'كلاسيك', 'كلاسيكي', 'سمارت كاجوال', 'رسمي', 'رياضي', 'streetwear', 'casual', 'classic', 'smart casual', 'sporty', 'ستايل'],
    rule: 'ترجمي الستايل الذي يطلبه العميل إلى قطع فعلية: الكاجوال يميل لراحة الحركة وقطع يومية؛ الكلاسيك لقصّات مرتبة وألوان هادئة؛ السمارت كاجوال يجمع قطعة مرتبة بأخرى يومية؛ والرياضي يقدّم الوظيفة والراحة. اعتبريها اتجاهات مرنة واسمحي بمزجها حسب الشخص والمناسبة.',
    example: 'لوك جامعة سمارت كاجوال: بنطلون مستقيم وقميص مرتب وجاكيت خفيف؛ لو العميل يفضّل الكاجوال، بدّلي الجاكيت بطبقة أريح وحذاء يومي.',
    avoid: 'ما تساويش بين الستايل ولبس زي موحد، وما تدّعيش أن خيارًا بعينه هو الموضة الحالية من غير مصدر حديث.',
    sources: ['fit_consulting', 'ual_intermediate'], active: true,
  },
  {
    id: 'shape-fit', titleAr: 'وازني القصّات والراحة من غير أحكام على الجسم',
    tags: ['قصة', 'قَصّة', 'مقاس', 'واسع', 'ضيق', 'طويل', 'قصير', 'fit', 'silhouette', 'proportion'],
    rule: 'وازني حجم القطع وطولها: لو البنطلون واسع، ممكن توازنيه بأعلى أهدأ أو أقصر؛ والطبقة المفتوحة قد تضيف خطًا طوليًا. هذه اختيارات شكلية فقط؛ ابدئي بقَصّة ومقاس يفضلهما العميل، ولا تستنتجي شكل جسمه أو تنتقديه. استخدمي جدول مقاسات المنتج عند إعطاء نصيحة مقاس.',
    example: 'بنطلون واسع مريح مع قميص أبسط أو طبقة مفتوحة؛ لو العميل يحب اللوك الواسع بالكامل، حافظي على اختياره ونسّقيه بدل محاولة تغييره.',
    avoid: 'ما تصفيش جسم العميل بأنه محتاج يتخبّى أو يتصلّح، وما تخمّنيش المقاس من صورة أو طول ووزن فقط.',
    sources: ['ual_personal', 'fit_consulting'], active: true,
  },
  {
    id: 'color-story', titleAr: 'اعملي حكاية ألوان مفهومة',
    tags: ['لون', 'ألوان', 'كحلي', 'أبيض', 'أسود', 'بيج', 'سماوي', 'أخضر', 'تنسيق', 'color', 'palette', 'يلبق'],
    rule: 'ابدئي بالألوان التي يحبها العميل. كوّني مجموعة ألوان بسيطة: درجات قريبة من لون واحد، أو لونين هادئين مع لون بارز، أو تباين واضح ومتوازن. تكرار لون صغير في الحذاء أو الحقيبة يربط اللوك، لكن التطابق الكامل ليس شرطًا.',
    example: 'مع قميص سماوي يملكه العميل: بنطلون كحلي أو بيج وكوتشي أبيض؛ السماوي والأبيض يفتحان اللوك والكحلي يثبّته.',
    avoid: 'ما تقولييش إن لونًا لا يليق مطلقًا أو تخمّني ألوان البشرة من محادثة نصية. قدّميها كتفضيلات واختيارات، مش قوانين.',
    sources: ['ual_personal', 'fit_consulting', 'ual_intermediate'], active: true,
  },
  {
    id: 'occasion-dresscode', titleAr: 'خلي المناسبة ودرجة رسميتها تقود الاختيار',
    tags: ['خطوبة', 'فرح', 'كتب كتاب', 'مناسبة', 'جامعة', 'شغل', 'خروجة', 'رسمي', 'wedding', 'engagement', 'work', 'graduation'],
    rule: 'طابقي اللوك مع المناسبة والمكان والوقت ودرجة الرسمية. المناسبات الرسمية تحتاج عادةً قصّات مرتبة وحذاء أشيك؛ الجامعة والمشاوير تحتاج راحة وعملية. لو اسم المناسبة لا يوضح مستوى الرسمية وكان سيغيّر المنتجات، اسألي باختصار.',
    example: 'لحضور خطوبة: بدلة كحلي بقميص فاتح وحذاء أنيق؛ لو العميل قال إن المكان بسيط والجو مريح، اقترحي جاكيتًا خفيفًا وبنطلون قماش بدل الرسمية الكاملة.',
    avoid: 'ما تلبّسيش كل مناسبة بدلة أو فستان سهرة، وما تخلطيش حذاءً رياضيًا بإطلالة رسمية إلا إذا العميل يطلب ذلك بوضوح.',
    sources: ['ual_personal', 'ual_intermediate', 'fit_consulting'], active: true,
  },
  {
    id: 'modest-dressing', titleAr: 'خلي الاحتشام جزءًا من التصميم من البداية',
    tags: ['حجاب', 'محجبة', 'طرحة', 'محتشم', 'كم طويل', 'تغطية', 'modest', 'hijab', 'scarf'],
    rule: 'عندما يطلب العميل تغطية أو ستايلًا محتشمًا، اختاري القطع والطبقات المناسبة من البداية، مع توازن الأطوال والحركة والطقس. اسألي عن مستوى التغطية أو طريقة الطرحة فقط إذا كان ذلك مؤثرًا في الاختيار. الاحتشام ممكن يكون أنيقًا ومعبرًا عن الشخصية.',
    example: 'بنطلون واسع كحلي وقميص طويل أبيض وطرحة طوبي هادئ؛ اختاري طبقات خفيفة ومريحة بدل إضافة قطع كثيرة فوق بعضها.',
    avoid: 'ما تفترضيهوش محجبة من نفسه، وما تقدميش ملابس عادية على أنها محتشمة لمجرد إضافة طبقات غير مريحة.',
    sources: ['ahram_modest', 'scene_designer'], active: true,
  },
  {
    id: 'wardrobe-anchor', titleAr: 'نسّقي حول القطعة التي يملكها العميل',
    tags: ['عندي', 'معايا', 'موجود عندي', 'ألبس مع', 'يلبق مع', 'يتماشى', 'خزانة', 'wardrobe', 'goes with', 'pair with'],
    rule: 'سمّي القطعة التي يملكها العميل ولونها أولًا، واعتبريها محور اللوك. اقترحي القطع الناقصة فقط، ولا تبحثي عن القطعة الموجودة أو تكرريها. لو وصف القطعة ناقصًا لكن يمكن البدء بافتراض معقول، اذكري الافتراض باختصار.',
    example: '«عندي قميص سماوي» يعني لا تبحثي عن قميص؛ ابحثي عن بنطلون وحذاء مناسبين فقط، أو عن الحذاء وحده إذا طلبه.',
    avoid: 'ما تضيفيش القطعة التي يملكها للسلة، وما تحوّليش طلب قطعة واحدة إلى طقم كامل.',
    sources: ['ual_personal', 'ual_intermediate', 'fit_consulting'], active: true,
  },
  {
    id: 'finish-and-accessories', titleAr: 'اختاري اللمسة الأخيرة حسب اللوك',
    tags: ['شنطة', 'اكسسوار', 'إكسسوار', 'حزام', 'ساعة', 'حلق', 'لمسة', 'finish', 'accessory', 'bag'],
    rule: 'اختاري الإكسسوارات والحذاء بعد تحديد القطعة المحورية ودرجة الرسمية. لو في اللوك نقشة أو لون قوي، خففي باقي التفاصيل؛ ولو اللوك هادئ، تكفي لمسة واحدة. التناسق لا يعني أن تكون كل القطع بنفس اللون.',
    example: 'مع فستان منقوش اختاري شنطة وحذاء بلون هادئ؛ مع طقم بسيط ممكن شنطة بلون طوبي أو حزام بلون متكرر في الحذاء.',
    avoid: 'ما تزحميش الإطلالة بتفاصيل كثيرة، وما تضيفيش إكسسوارًا لا يتوفر في المتجر أو خارج طلب العميل.',
    sources: ['fit_consulting', 'ual_intermediate'], active: true,
  },
];

const CORE = `Styling playbook (adapt these ideas to this shopper; they are options, not laws):
- Start with the real brief: wearer, where/when they will wear it, dress code, budget, comfort, coverage and what they already own. Use what they told you. Ask only for a missing detail that would change the recommendation; otherwise state a sensible assumption briefly.
- Build in this order: choose one anchor piece; balance its volume and visual weight; settle on a simple colour story; add useful texture; finish with shoes/bag/accessories appropriate to the activity. Make the result comfortable to move and sit in.
- Easy colour plans: two neutrals plus one accent; tonal shades of one colour with different textures; or two neighbouring colours with a neutral. A small repeated colour detail can tie shoes, bag or scarf together. Exact colour matching is optional; contrast can look more intentional.
- Balance proportions through garment length and volume (for example, a relaxed wide-leg trouser with a neater top, or a longer open layer over a simpler base). These are styling options, not body corrections. Never assume a body shape or imply that a body needs fixing.
- Make the occasion visible in the outfit: formal events call for cleaner tailoring and dressier shoes; daily/work looks need comfort and repeatability; casual looks can use relaxed layers and practical footwear. Do not dress every request as a special occasion.
- When styling an owned item, keep it as the anchor and suggest only the missing pieces. Echo one colour or texture once elsewhere, then add a calm contrast. Do not search for the item they already own.
- Edit the look: one focal point is usually enough. If a print, bright colour or statement accessory leads, keep the rest quieter. Mention a practical finishing detail (shoe formality, bag size, layer, or accessory) only when it helps.
- Treat every shopper's taste as individual. Offer a bolder or quieter alternative when useful; don't present one palette, cut, hijab style or trend as universally flattering.`;

const TOPICS = [
  {
    re: /كحجاب|محجب|حجاب|طرحه|طرحة|محتشم|تغط|كم طويل|رقبه|رقبة|modest|hijab|scarf/,
    text: `Modest styling: ask what level of coverage and scarf style the shopper prefers only if it matters. Build coverage into the silhouette from the start rather than treating it as an afterthought. Keep layers light enough for the weather, use an open layer to create a vertical line when desired, and avoid bulky stacking. Example: بنطلون واسع كحلي + قميص طويل أوفرسايز أبيض + طرحة بلون طوبي هادي + كوتشي بسيط. This is one option, not a uniform.`,
  },
  {
    re: /عندي|معايا|موجود عندي|البس مع|يلبق مع|ينفع مع|يتماشى|ستايل.*صوره|صوره.*لبس|صورة.*لبس|wardrobe|goes with|pair with/,
    text: `Wardrobe matching: name the owned garment and its colour/cut first, keep it unchanged, then add no more than two or three missing pieces. Explain the colour bridge and the formality match. Example: مع قميص سماوي، بنطلون بيج أو كحلي وكوتشي أبيض؛ لو المناسبة أشيك، بدّل الكوتشي بحذاء جلد بني.`,
  },
  {
    re: /فرح|خطوبه|خطوبة|كتب كتاب|كتبكتاب|مناسبه|مناسبة|شغل|جامعه|جامعة|خروجه|خروجة|عيد|رمضان|wedding|engagement|work|graduation|occasion/,
    text: `Occasion styling: first match the dress code and time of day, then choose the anchor garment and shoe formality. Wedding guest: polished but do not compete with the couple; work: comfortable, repeatable and neat; casual outing: relaxed but intentional. Ask about dress code only when the event name is not enough. Example: لخطوبة، بدلة كحلي بقميص أوف وايت وحذاء بني أشيك من كوتشي رياضي؛ لو المكان بسيط، جاكيت خفيف وبنطلون قماش يوازنوا الرسمية.`,
  },
  {
    re: /لون|الوان|ألوان|يلبق|بشره|بشرة|كحلي|بيج|اسود|أسود|ابيض|أبيض|color|colour|palette/,
    text: `Colour advice: use colours the shopper likes first. Offer one clear palette and explain contrast (soft vs. high contrast) in everyday terms. Example: الكحلي مع البيج هادي وكلاسيك؛ لو عايز لمسة أجرأ، زوّد طوبي أو أخضر زيتوني في قطعة واحدة. Never infer skin undertone from a text-only chat or claim a colour is forbidden.`,
  },
  {
    re: /اختار|اختارلي|انهي|أنهي|احسن|أحسن|مين فيهم|الصورتين|قارن|compare|which one|choose/,
    text: `Decision help: compare the actual options against the stated occasion, comfort, versatility and budget. Give one verdict first, then one or two concrete reasons. Do not hide behind “both are nice”; mention the runner-up's advantage only if it helps.`,
  },
  {
    re: /شنطه|شنطة|حقيبه|حقيبة|اكسسوار|إكسسوار|حزام|حلق|ساعه|ساعة|accessor|bag|belt/,
    text: `Accessories: let the outfit's focal point lead. For a patterned or bright outfit, use a simpler bag and jewellery; for a quiet outfit, one accessory can add personality. Match accessory scale and shoe formality to the activity. Coordinating does not require every item to be the same colour.`,
  },
  {
    re: /مقاس|واسع|ضيق|طويل|قصير|طول|قصه|قصة|fit|size|proportion|silhouette/,
    text: `Fit and proportion: ask which fit the shopper likes (relaxed, regular or close) if unknown and important. Suggest garment proportions as choices, never diagnose or criticize a body. Product size advice must use the actual product's size chart; don't guess a size from height/weight alone.`,
  },
];

const normalize = (value) => String(value || '').toLowerCase().replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/[ًٌٍَُِّْ]/g, '').trim();
export function stylistKnowledgeFor(query = '', guide = DEFAULT_STYLE_GUIDE) {
  const text = normalize(query);
  const selected = TOPICS.filter(({ re }) => re.test(text)).map(({ text: advice }) => advice);
  const words = new Set(text.split(/[^\p{L}\p{N}]+/u).filter((word) => word.length > 1));
  const curated = (Array.isArray(guide) ? guide : []).filter((item) => item?.active !== false).map((item) => {
    const tags = Array.isArray(item.tags) ? item.tags : [];
    const score = tags.reduce((sum, raw) => {
      const tag = normalize(raw);
      if (!tag) return sum;
      if (tag.includes(' ') && text.includes(tag)) return sum + 2;
      if (words.has(tag) || [...words].some((word) => word.length >= 4 && tag.length >= 4 && (word.startsWith(tag) || tag.startsWith(word)))) return sum + 1;
      return sum;
    }, 0);
    return { item, score };
  }).filter(({ score }) => score > 0).sort((a, b) => b.score - a.score).slice(0, 2)
    .map(({ item }) => `قاعدة معتمدة — ${item.titleAr}: ${item.rule}${item.example ? ` مثال تطبيقي: ${item.example}` : ''}${item.avoid ? ` تجنبي: ${item.avoid}` : ''}`);
  return `${CORE}${selected.length ? `\nRelevant playbook notes:\n${selected.join('\n')}` : ''}${curated.length ? `\n\nAdmin-approved fashion guide (use only relevant entries as adaptable advice, not universal rules):\n${curated.join('\n')}` : ''}`;
}
