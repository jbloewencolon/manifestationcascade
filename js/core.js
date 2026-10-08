// Cascade core: clock state machine, i18n, audio engine, controller.
// Pure ES module; browser globals are only touched inside functions so compute()/fmt() are testable in Node.

export const HOUR = 3600000;
const DONE = 10 * 60000; // "complete" state lasts 10 min after the hour
const MED_WINDOW = 10 * 60000; // "I Meditated" appears for the last 10 min of the session

// DRAFT translations: every language needs fluent human review before launch (see tasks.md).
export const STRINGS = {
  en: { theme: "End the War", before: "Your session begins in", during: "Remaining in the hour", doneT: "The hour is complete", doneB: "What was held is now released into the world. Thank you. The cascade continues westward.", steps: ["At 7:07 pm your local time, find a quiet place and begin.", "Bring your attention to the theme: End the War.", "Breathe slowly. Let the heaviness settle, and turn it toward something lighter. Hold the intention for the full hour, or as long as you are able.", "When you finish, press I Meditated."], commit: "Commit to a Cascade", committed: "Committed to the next cascade", med: "I Meditated", medDone: "Recorded. Thank you.", privacy: "We count visits and meditations by time zone. Nothing else.", late: "You joined {m} minutes in. Begin now.", about: "About the practice", aboutBody: "A shared practice of collective intention and solidarity, held daily at 7:07 pm in every time zone. Like a slow alchemy, each place kindles its own flame at its own 7:07, and the intention passes around the planet as a wave. We promise no outcomes; we offer our attention, together.", safe: "Please practice somewhere safe, never while driving or operating machinery." , langAria: "Language", soundAria: "Sound" },
  es: { theme: "Que termine la guerra", before: "Tu sesión comienza en", during: "Queda de la hora", doneT: "La hora ha terminado", doneB: "Lo que se sostuvo ahora se libera al mundo. Gracias. La cascada continúa hacia el oeste.", steps: ["A las 19:07 de tu hora local, busca un lugar tranquilo y comienza.", "Lleva tu atención al tema: Que termine la guerra.", "Respira despacio. Deja que el peso se asiente y oriéntalo hacia algo más ligero. Sostén la intención durante toda la hora, o tanto como puedas.", "Al terminar, pulsa Medité."], commit: "Comprometerme con una cascada", committed: "Comprometido con la próxima cascada", med: "Medité", medDone: "Registrado. Gracias.", privacy: "Contamos visitas y meditaciones por zona horaria. Nada más.", late: "Te uniste a los {m} minutos. Comienza ahora.", about: "Sobre la práctica", aboutBody: "Una práctica compartida de intención colectiva y solidaridad, cada día a las 19:07 en cada zona horaria. Como una alquimia lenta, cada lugar enciende su propia llama a su propia hora, y la intención recorre el planeta como una ola. No prometemos resultados; ofrecemos nuestra atención, juntos.", safe: "Practica en un lugar seguro, nunca mientras conduces o manejas maquinaria." , langAria: "Idioma", soundAria: "Sonido" },
  fr: { theme: "Mettre fin à la guerre", before: "Votre séance commence dans", during: "Reste de l’heure", doneT: "L’heure est accomplie", doneB: "Ce qui a été porté est maintenant offert au monde. Merci. La cascade continue vers l’ouest.", steps: ["À 19 h 07, heure locale, trouvez un endroit calme et commencez.", "Portez votre attention sur le thème : Mettre fin à la guerre.", "Respirez lentement. Laissez la lourdeur se déposer et tournez-la vers quelque chose de plus léger. Gardez l’intention pendant toute l’heure, ou aussi longtemps que possible.", "Quand vous avez terminé, appuyez sur J’ai médité."], commit: "M’engager dans une cascade", committed: "Engagé pour la prochaine cascade", med: "J’ai médité", medDone: "Enregistré. Merci.", privacy: "Nous comptons les visites et les méditations par fuseau horaire. Rien d’autre.", late: "Vous avez rejoint après {m} minutes. Commencez maintenant.", about: "À propos", aboutBody: "Une pratique partagée d’intention collective et de solidarité, chaque jour à 19 h 07 dans chaque fuseau horaire. Comme une lente alchimie, chaque lieu allume sa propre flamme à sa propre heure, et l’intention fait le tour de la planète comme une vague. Nous ne promettons aucun résultat ; nous offrons notre attention, ensemble.", safe: "Pratiquez dans un lieu sûr, jamais en conduisant ni en utilisant une machine." , langAria: "Langue", soundAria: "Son" },
  ar: { theme: "أوقفوا الحرب", before: "تبدأ جلستك بعد", during: "المتبقي من الساعة", doneT: "اكتملت الساعة", doneB: "ما حُمل في القلب يُطلق الآن في العالم. شكرًا لك. يستمر الشلال نحو الغرب.", steps: ["في الساعة 7:07 مساءً بتوقيتك المحلي، اعثر على مكان هادئ وابدأ.", "وجّه انتباهك إلى الموضوع: أوقفوا الحرب.", "تنفّس ببطء. دع الثقل يستقر، ووجّهه نحو شيء أخفّ. احمل النية طوال الساعة، أو قدر ما تستطيع.", "عند الانتهاء، اضغط تأمّلتُ."], commit: "ألتزم بالشلال", committed: "ملتزم بالشلال القادم", med: "تأمّلتُ", medDone: "تم التسجيل. شكرًا.", privacy: "نحصي الزيارات وجلسات التأمل حسب المنطقة الزمنية. لا شيء غير ذلك.", late: "انضممت بعد {m} دقيقة. ابدأ الآن.", about: "عن الممارسة", aboutBody: "ممارسة مشتركة للنية الجماعية والتضامن، يوميًا في الساعة 7:07 مساءً في كل منطقة زمنية. وكأنها كيمياء بطيئة، يُشعل كل مكان شعلته في توقيته، وتنتقل النية حول الكوكب كموجة. لا نعد بنتائج؛ نقدّم انتباهنا معًا.", safe: "مارس التأمل في مكان آمن، وليس أثناء القيادة أو تشغيل الآلات." , langAria: "اللغة", soundAria: "الصوت" },
  he: { theme: "לסיים את המלחמה", before: "המפגש שלך מתחיל בעוד", during: "נותר מהשעה", doneT: "השעה הושלמה", doneB: "מה שהוחזק משתחרר כעת אל העולם. תודה. המפל ממשיך מערבה.", steps: ["בשעה 19:07 לפי שעון מקומי, מצאו מקום שקט והתחילו.", "הפנו את תשומת הלב לנושא: לסיים את המלחמה.", "נשמו לאט. תנו לכובד להתיישב, והפנו אותו אל משהו קל יותר. החזיקו את הכוונה לאורך כל השעה, או ככל שתוכלו.", "בסיום, לחצו על מדיטטתי."], commit: "להתחייב למפל", committed: "התחייבת למפל הבא", med: "מדיטטתי", medDone: "נרשם. תודה.", privacy: "אנחנו סופרים ביקורים ומדיטציות לפי אזור זמן. שום דבר אחר.", late: "הצטרפת אחרי {m} דקות. התחילו עכשיו.", about: "על התרגול", aboutBody: "תרגול משותף של כוונה קולקטיבית וסולידריות, מדי יום בשעה 19:07 בכל אזור זמן. כמו אלכימיה איטית, כל מקום מדליק את להבתו בשעתו, והכוונה עוברת סביב כדור הארץ כגל. איננו מבטיחים תוצאות; אנו מציעים את תשומת לבנו, יחד.", safe: "תרגלו במקום בטוח, לעולם לא בזמן נהיגה או הפעלת מכונות." , langAria: "שפה", soundAria: "צליל" },
  uk: { theme: "Зупинити війну", before: "Ваша сесія почнеться через", during: "Залишилось години", doneT: "Годину завершено", doneB: "Те, що ми тримали, тепер відпущено у світ. Дякуємо. Каскад рухається далі на захід.", steps: ["О 19:07 за місцевим часом знайдіть тихе місце й почніть.", "Зосередьтеся на темі: Зупинити війну.", "Дихайте повільно. Нехай важкість вляжеться, і спрямуйте її до чогось легшого. Тримайте намір усю годину або скільки зможете.", "Коли завершите, натисніть «Я медитував(ла)»."], commit: "Долучитися до каскаду", committed: "Ви долучилися до наступного каскаду", med: "Я медитував(ла)", medDone: "Записано. Дякуємо.", privacy: "Ми рахуємо відвідування й медитації за часовими поясами. Більше нічого.", late: "Ви приєдналися на {m}-й хвилині. Почніть зараз.", about: "Про практику", aboutBody: "Спільна практика колективного наміру й солідарності щодня о 19:07 у кожному часовому поясі. Мов повільна алхімія, кожне місце запалює власне полум’я у свій час, а намір обходить планету хвилею. Ми не обіцяємо результатів; ми разом дарюємо свою увагу.", safe: "Практикуйте в безпечному місці, ніколи за кермом і не поруч із небезпечними механізмами." , langAria: "Мова", soundAria: "Звук" },
  ru: { theme: "Остановить войну", before: "Ваша сессия начнётся через", during: "Осталось от часа", doneT: "Час завершён", doneB: "То, что мы держали, теперь отпущено в мир. Спасибо. Каскад движется дальше на запад.", steps: ["В 19:07 по местному времени найдите тихое место и начните.", "Сосредоточьтесь на теме: Остановить войну.", "Дышите медленно. Позвольте тяжести осесть и направьте её к чему-то более лёгкому. Держите намерение весь час или сколько сможете.", "Когда закончите, нажмите «Я медитировал(а)»."], commit: "Присоединиться к каскаду", committed: "Вы присоединились к следующему каскаду", med: "Я медитировал(а)", medDone: "Записано. Спасибо.", privacy: "Мы считаем посещения и медитации по часовым поясам. Больше ничего.", late: "Вы присоединились на {m}-й минуте. Начните сейчас.", about: "О практике", aboutBody: "Совместная практика коллективного намерения и солидарности, каждый день в 19:07 в каждом часовом поясе. Подобно медленной алхимии, каждое место зажигает свой огонь в своё время, и намерение обходит планету волной. Мы не обещаем результатов; мы вместе дарим своё внимание.", safe: "Практикуйте в безопасном месте, никогда за рулём и не работая с механизмами." , langAria: "Язык", soundAria: "Звук" },
  zh: { theme: "终结战争", before: "你的冥想将在以下时间后开始", during: "本小时剩余", doneT: "这一小时已圆满", doneB: "所守持的，此刻释放向世界。谢谢你。冥想之波继续向西流动。", steps: ["在当地时间晚上7:07，找一个安静的地方开始。", "将注意力放在主题上：终结战争。", "缓慢呼吸。让沉重慢慢沉淀，并将它转向更轻盈的方向。守持这份意念一整个小时，或尽你所能。", "结束后，请按“我已冥想”。"], commit: "承诺参与冥想之波", committed: "已承诺参与下一次", med: "我已冥想", medDone: "已记录。谢谢。", privacy: "我们只按时区统计访问和冥想次数，别无其他。", late: "你在第{m}分钟加入。现在开始吧。", about: "关于这项练习", aboutBody: "一项关于集体意念与团结的共同练习，每天在每个时区的晚上7:07举行。如同缓慢的炼金术，每个地方在自己的时刻点燃自己的火焰，意念因此如波浪般绕行地球。我们不承诺结果，只是一同献上我们的专注。", safe: "请在安全的地方练习，切勿在驾驶或操作机器时进行。" , langAria: "语言", soundAria: "声音" },
  hi: { theme: "युद्ध समाप्त करो", before: "आपका सत्र शुरू होने में", during: "घंटे में शेष", doneT: "घंटा पूर्ण हुआ", doneB: "जो थामा गया था, वह अब संसार में मुक्त होता है। धन्यवाद। यह लहर पश्चिम की ओर बढ़ती रहती है।", steps: ["अपने स्थानीय समय शाम 7:07 बजे, कोई शांत जगह ढूँढें और शुरू करें।", "अपना ध्यान विषय पर लाएँ: युद्ध समाप्त करो।", "धीरे-धीरे साँस लें। बोझ को ठहरने दें और उसे किसी हल्की चीज़ की ओर मोड़ें। पूरे घंटे, या जितना हो सके, संकल्प बनाए रखें।", "समाप्त होने पर, मैंने ध्यान किया दबाएँ।"], commit: "लहर से जुड़ने का संकल्प लें", committed: "अगली लहर के लिए संकल्पित", med: "मैंने ध्यान किया", medDone: "दर्ज हो गया। धन्यवाद।", privacy: "हम समय क्षेत्र के अनुसार केवल विज़िट और ध्यान गिनते हैं। और कुछ नहीं।", late: "आप {m} मिनट बाद जुड़े। अभी शुरू करें।", about: "इस अभ्यास के बारे में", aboutBody: "सामूहिक संकल्प और एकजुटता का साझा अभ्यास, हर दिन हर समय क्षेत्र में शाम 7:07 बजे। एक धीमी कीमिया की तरह, हर स्थान अपने समय पर अपनी लौ जलाता है, और संकल्प एक लहर की तरह पृथ्वी के चारों ओर घूमता है। हम परिणामों का वादा नहीं करते; हम साथ मिलकर अपना ध्यान अर्पित करते हैं।", safe: "कृपया सुरक्षित स्थान पर अभ्यास करें, गाड़ी चलाते या मशीन चलाते समय कभी नहीं।" , langAria: "भाषा", soundAria: "ध्वनि" },
  pt: { theme: "Pelo fim da guerra", before: "Sua sessão começa em", during: "Resta da hora", doneT: "A hora está completa", doneB: "O que foi sustentado agora é liberado no mundo. Obrigado. A cascata segue para o oeste.", steps: ["Às 19h07, no seu horário local, encontre um lugar tranquilo e comece.", "Leve sua atenção ao tema: Pelo fim da guerra.", "Respire devagar. Deixe o peso assentar e volte-o para algo mais leve. Sustente a intenção pela hora inteira, ou pelo tempo que puder.", "Ao terminar, toque em Eu meditei."], commit: "Comprometer-me com uma cascata", committed: "Comprometido com a próxima cascata", med: "Eu meditei", medDone: "Registrado. Obrigado.", privacy: "Contamos visitas e meditações por fuso horário. Nada mais.", late: "Você entrou aos {m} minutos. Comece agora.", about: "Sobre a prática", aboutBody: "Uma prática compartilhada de intenção coletiva e solidariedade, todos os dias às 19h07 em cada fuso horário. Como uma lenta alquimia, cada lugar acende a sua própria chama no seu próprio horário, e a intenção percorre o planeta como uma onda. Não prometemos resultados; oferecemos nossa atenção, juntos.", safe: "Pratique em um lugar seguro, nunca ao dirigir ou operar máquinas." , langAria: "Idioma", soundAria: "Som" },
};

export const LANGS = [["en", "English"], ["es", "Español"], ["fr", "Français"], ["ar", "العربية", "rtl"], ["he", "עברית", "rtl"], ["uk", "Українська"], ["ru", "Русский"], ["zh", "中文"], ["hi", "हिन्दी"], ["pt", "Português"]]
  .map(([code, name, dir]) => ({ code, name, dir: dir || "ltr" }));

const LANG_ALIAS = { iw: "he" };

function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable: degrade silently */ } }
const pad = (n) => String(n).padStart(2, "0");

export function fmt(ms, withHours) {
  const s = Math.ceil(Math.max(0, ms) / 1000);
  return withHours
    ? pad(Math.floor(s / 3600)) + ":" + pad(Math.floor(s % 3600 / 60)) + ":" + pad(s % 60)
    : pad(Math.floor(s / 60)) + ":" + pad(s % 60);
}

// Local 19:07 on the calendar day containing `ms`. The browser handles DST.
export function startOn(ms) { const d = new Date(ms); d.setHours(19, 7, 0, 0); return d.getTime(); }
function dayShift(ms, n) { const d = new Date(ms); d.setDate(d.getDate() + n); return startOn(d.getTime()); }
function key(ms) { const d = new Date(ms); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }

// Always derived from absolute timestamps, never from a decrementing counter.
export function compute(now) {
  const st = startOn(now);
  if (now < st) { const pe = dayShift(now, -1) + HOUR; return { state: "waiting", start: st, remaining: st - now, progress: (now - pe) / (st - pe) }; }
  if (now < st + HOUR) return { state: "active", start: st, remaining: st + HOUR - now, progress: (now - st) / HOUR };
  if (now < st + HOUR + DONE) return { state: "complete", start: st, remaining: 0, progress: 1 };
  const nx = dayShift(now, 1);
  return { state: "waiting", start: nx, remaining: nx - now, progress: (now - st - HOUR) / (nx - st - HOUR) };
}

// Order: saved choice, then browser languages, then English. (IP geolocation intentionally not used.)
function detectLang() {
  const saved = get("mc.lang");
  if (saved && STRINGS[saved]) return saved;
  const ls = navigator.languages || [navigator.language || "en"];
  for (const l of ls) {
    let c = (l || "").slice(0, 2).toLowerCase();
    c = LANG_ALIAS[c] || c;
    if (STRINGS[c]) return c;
  }
  return "en";
}

function tzName() { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"; } catch (e) { return "UTC"; } }

// PLACEHOLDER for the serverless endpoint (Phase 2): aggregates only, date | time zone | kind.
function record(kind, tz) {
  let agg = {};
  try { agg = JSON.parse(get("mc.counts") || "{}"); } catch (e) { agg = {}; }
  const k = key(Date.now()) + "|" + tz + "|" + kind;
  agg[k] = (agg[k] || 0) + 1;
  set("mc.counts", JSON.stringify(agg));
}

const hex = (h) => { h = h.replace("#", ""); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; };
export function mix(a, b, k, al) {
  const x = hex(a), y = hex(b);
  const c = x.map((v, i) => Math.round(v + (y[i] - v) * k));
  return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + (al == null ? 1 : al) + ")";
}

const timeFmt = {};
function startLabelFor(lang, ms) {
  try {
    timeFmt[lang] = timeFmt[lang] || new Intl.DateTimeFormat(lang, { hour: "numeric", minute: "2-digit" });
    return timeFmt[lang].format(new Date(ms));
  } catch (e) { return "7:07"; }
}

// Synthesised ambient audio (no audio files to ship or license). Starts only after a user gesture.
const Sound = {
  ctx: null, master: null, voice: null, bellT: null, pulseT: null, mode: null,
  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
    return true;
  },
  setOn(on) {
    if (on && !this.ensure()) return;
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setTargetAtTime(on ? 0.6 : 0, t, on ? 1.2 : 0.3);
  },
  setMode(mode, cfg) {
    if (!this.ctx || !cfg || this.mode === mode) return;
    this.clear();
    this.mode = mode;
    const m = cfg[mode];
    if (!m) return;
    const ctx = this.ctx, t = ctx.currentTime, g = ctx.createGain(), oscs = [], n = m.freqs.length, self = this;
    g.gain.value = 0;
    g.gain.setTargetAtTime(m.gain, t, 2);
    g.connect(this.master);
    m.freqs.forEach((f, i) => {
      const o = ctx.createOscillator(); o.type = m.type || "sine"; o.frequency.value = f; o.detune.value = i % 2 ? 5 : -5;
      const vg = ctx.createGain(); vg.gain.value = 0.7 / n;
      const l = ctx.createOscillator(); l.frequency.value = (m.lfo || 0.06) * (1 + i * 0.37);
      const lg = ctx.createGain(); lg.gain.value = 0.5 / n;
      l.connect(lg); lg.connect(vg.gain); o.connect(vg); vg.connect(g);
      o.start(); l.start(); oscs.push(o, l);
    });
    this.voice = { g, oscs };
    if (m.bell) {
      const strike = () => self.bell(m.bell.freq, m.bell.gain || 0.15);
      this.bellT = setInterval(strike, m.bell.every * 1000);
      setTimeout(strike, 2000);
    }
    if (m.pulse) this.pulseT = setInterval(() => self.thump(m.pulse.gain), 60000 / m.pulse.bpm);
  },
  clear() {
    clearInterval(this.bellT); clearInterval(this.pulseT); this.mode = null;
    if (this.voice && this.ctx) {
      const v = this.voice, t = this.ctx.currentTime;
      v.g.gain.cancelScheduledValues(t);
      v.g.gain.setTargetAtTime(0, t, 1);
      setTimeout(() => { v.oscs.forEach((o) => { try { o.stop(); } catch (e) { /* already stopped */ } }); v.g.disconnect(); }, 5000);
    }
    this.voice = null;
  },
  bell(f, gain) {
    const ctx = this.ctx; if (!ctx) return;
    const t = ctx.currentTime, self = this;
    [[1, 1], [2.76, 0.35], [5.4, 0.15]].forEach((p, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = f * p[0];
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(gain * p[1], t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 7 / (i + 1));
      o.connect(g); g.connect(self.master); o.start(t); o.stop(t + 8);
    });
  },
  thump(gain) {
    const ctx = this.ctx; if (!ctx) return;
    const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.value = 52;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t + 0.5);
  },
};

export class Controller {
  constructor(opts = {}) {
    this.opts = opts;
    this.lang = detectLang();
    this.sound = get("mc.sound") === "1";
    this.offset = 0;
    this.preview = "live";
    this.joined = {};
    this.subs = [];
    this.tz = tzName();
    this.last = null;
    this.wake = null;
    this.completeAt = null;
    this.setPreview(opts.preview, true);
    this.iv = setInterval(() => this.emit(), 250);
    this._vis = () => { if (document.visibilityState === "visible") { this.emit(); if (this.last === "active") this.lockScreen(true); } };
    document.addEventListener("visibilitychange", this._vis);
    if (get("mc.visit") !== key(Date.now())) { set("mc.visit", key(Date.now())); this.rec("visit"); }
    if (this.sound) {
      // Browsers block autoplay: resume the saved "sound on" choice at the first gesture.
      this._arm = () => {
        document.removeEventListener("pointerdown", this._arm, true);
        document.removeEventListener("keydown", this._arm, true);
        if (this.sound) this.applySound();
      };
      document.addEventListener("pointerdown", this._arm, true);
      document.addEventListener("keydown", this._arm, true);
    }
  }
  // Preview modes (?preview=...) fake the clock for design review and never record counts.
  rec(kind) { if (this.preview === "live") record(kind, this.tz); }
  on(fn) { this.subs.push(fn); return () => { const i = this.subs.indexOf(fn); if (i >= 0) this.subs.splice(i, 1); }; }
  now() { return Date.now() + this.offset; }
  setPreview(p, silent) {
    p = p || "live";
    if (p === this.preview && !silent) return;
    this.preview = p;
    this.joined = {};
    const real = Date.now(), st = startOn(real);
    const tg = { waiting: st - (2 * 3600 + 13 * 60 + 40) * 1000, active: st + 14 * 60000, activeEnd: st + HOUR - 6 * 60000, complete: st + HOUR + 1000 }[p];
    this.offset = tg == null ? 0 : tg - real;
    if (!silent) this.emit();
  }
  compute() {
    const now = this.now(), c = compute(now);
    if (c.state === "active") {
      if (this.joined[c.start] == null) this.joined[c.start] = now - c.start;
      c.joinedAt = this.joined[c.start];
    }
    c.now = now;
    return c;
  }
  emit() {
    const c = this.compute();
    if (c.state !== this.last) {
      if (c.state === "complete") this.completeAt = c.now;
      const first = this.last === null;
      this.last = c.state;
      if (this.sound) Sound.setMode(c.state === "waiting" ? "waiting" : "active", this.opts.audio);
      this.lockScreen(c.state === "active");
      this.changed = !first;
    } else this.changed = false;
    this.cur = this.snap(c);
    this.subs.forEach((f) => f(this.cur, this.changed));
  }
  lockScreen(on) {
    if (on && navigator.wakeLock && !this.wake) {
      navigator.wakeLock.request("screen").then((l) => { this.wake = l; l.addEventListener("release", () => { if (this.wake === l) this.wake = null; }); }).catch(() => {});
    } else if (!on && this.wake) {
      this.wake.release().catch(() => {});
      this.wake = null;
    }
  }
  setLang(c) { if (!STRINGS[c]) return; this.lang = c; set("mc.lang", c); this.emit(); }
  setAudio(cfg) { this.opts.audio = cfg; Sound.mode = null; if (this.sound) Sound.setMode(this.last === "waiting" ? "waiting" : "active", cfg); }
  toggleSound() { this.sound = !this.sound; set("mc.sound", this.sound ? "1" : "0"); this.applySound(); this.emit(); }
  applySound() {
    Sound.setOn(this.sound);
    if (this.sound) { Sound.mode = null; Sound.setMode(this.last === "waiting" ? "waiting" : "active", this.opts.audio); }
  }
  commit() { const c = this.compute(); set("mc.commit", key(c.start)); this.rec("commitment"); this.emit(); }
  meditate() { const c = this.compute(); if (get("mc.med") === key(c.start)) return; set("mc.med", key(c.start)); this.rec("meditation"); this.emit(); }
  destroy() {
    clearInterval(this.iv);
    document.removeEventListener("visibilitychange", this._vis);
    this.subs = [];
    Sound.clear(); Sound.setOn(false); this.lockScreen(false);
  }
  snap(c) {
    c = c || this.compute();
    const t = STRINGS[this.lang] || STRINGS.en;
    const L = LANGS.find((l) => l.code === this.lang) || LANGS[0];
    const startLabel = startLabelFor(this.lang, c.start);
    const off = -new Date(c.now).getTimezoneOffset();
    const utc = "UTC" + (off < 0 ? "−" : "+") + Math.floor(Math.abs(off) / 60) + (Math.abs(off) % 60 ? ":" + pad(Math.abs(off) % 60) : "");
    const lateMin = c.state === "active" && c.joinedAt > 60000 ? Math.floor(c.joinedAt / 60000) : 0;
    const medWin = (c.state === "active" && c.remaining <= MED_WINDOW) || c.state === "complete";
    const medDone = get("mc.med") === key(c.start), committed = get("mc.commit") === key(c.start), w = c.state === "waiting";
    let label, count, sub;
    if (w) { label = t.before; count = fmt(c.remaining, true); sub = startLabel + " · " + this.tz; }
    else if (c.state === "active") { label = t.during; count = fmt(c.remaining); sub = lateMin ? t.late.replace("{m}", lateMin) : t.steps[2]; }
    else { label = t.doneT; count = "00:00"; sub = t.doneB; }
    return {
      state: c.state, active: c.state !== "waiting", now: c.now, completeAt: this.completeAt,
      lang: this.lang, dir: L.dir, langName: L.name, theme: t.theme,
      countLabel: label, count, sub, steps: t.steps, privacy: t.privacy, safe: t.safe, langAria: t.langAria, soundAria: t.soundAria,
      about: t.about, aboutBody: t.aboutBody,
      commitLabel: t.commit, committedLabel: t.committed, medLabel: t.med, medDoneLabel: t.medDone,
      showCommit: w && !committed, showCommitted: w && committed, showMed: medWin && !medDone, showMedDone: medWin && medDone,
      showSteps: w, progress: Math.max(0, Math.min(1, c.progress)), tz: this.tz, utc, sound: this.sound,
    };
  }
}
