// Cascade core: clock state machine, i18n, audio engine, controller.
// Pure ES module; browser globals are only touched inside functions so compute()/fmt() are testable in Node.

export const HOUR = 3600000;
const DONE = 10 * 60000; // "complete" state lasts 10 min after the hour
const MED_WINDOW = 10 * 60000; // "I Meditated" appears for the last 10 min of the session

// DRAFT translations: every language needs fluent human review before launch (see tasks.md).
export const STRINGS = {
  en: { theme: "End the War", before: "Your session begins in", during: "Remaining in the hour", doneT: "The hour is complete", doneB: "What was held is now released into the world. Thank you. The cascade continues westward.", steps: ["At 7:07 pm your local time, find a quiet place and begin.", "Bring your attention to the theme: End the War.", "Breathe slowly. Let the heaviness settle, and turn it toward something lighter. Hold the intention for the full hour, or as long as you are able.", "When you finish, press I Meditated."], commit: "Commit to a Cascade", committed: "Committed to the next cascade", med: "I Meditated", medDone: "Recorded. Thank you.", privacy: "We count visits and meditations by time zone. Nothing else.", late: "You joined {m} minutes in. Begin now.", aboutTitle: "About the practice", story: ["For the first time in human history, we can communicate and coordinate across the whole planet at once. What if we pointed that power at making a better world? What if meditation could work like a collider for intention, bringing minds together at speed to see what new forms might emerge?", "Manifestation Cascade begins at 7:07 pm in every time zone. As each place reaches its own 7:07, the practice passes around the world like a wave, one time zone at a time.", "Our first manifestation is “{theme}”. Which war? All of them. We want every war on this planet to end. As you sit, let your heart and intuition lead your attention to the one that most needs you.", "When all wars have ended, we will begin the next cascade.", "We hold this intention with full conviction, and we invite you to hold it with us. Join us."], doTitle: "What you can do", doBody: "At 7:07 pm, wherever you are, join us for an hour of meditation to End the War. That is all. Come for one evening, or every evening, until the cascade of collective human energy has done its work.", calLabel: "Add to calendar", safe: "Please practice somewhere safe, never while driving or operating machinery." , langAria: "Language", soundAria: "Sound", motionAria: "Pause animation", skip: "Skip to content" },
  es: { theme: "Que termine la guerra", before: "Tu sesión comienza en", during: "Queda de la hora", doneT: "La hora ha terminado", doneB: "Lo que se sostuvo ahora se libera al mundo. Gracias. La cascada continúa hacia el oeste.", steps: ["A las 19:07 de tu hora local, busca un lugar tranquilo y comienza.", "Lleva tu atención al tema: Que termine la guerra.", "Respira despacio. Deja que el peso se asiente y oriéntalo hacia algo más ligero. Sostén la intención durante toda la hora, o tanto como puedas.", "Al terminar, pulsa Medité."], commit: "Comprometerme con una cascada", committed: "Comprometido con la próxima cascada", med: "Medité", medDone: "Registrado. Gracias.", privacy: "Contamos visitas y meditaciones por zona horaria. Nada más.", late: "Te uniste a los {m} minutos. Comienza ahora.", aboutTitle: "Sobre la práctica", story: ["Por primera vez en la historia de la humanidad podemos comunicarnos y coordinarnos en todo el planeta al mismo tiempo. ¿Y si dirigiéramos ese poder a crear un mundo mejor? ¿Y si la meditación pudiera funcionar como un colisionador de intención, uniendo mentes a gran velocidad para ver qué formas nuevas podrían surgir?", "Manifestation Cascade comienza a las 19:07 en cada zona horaria. A medida que cada lugar llega a su propio 19:07, la práctica recorre el mundo como una ola, una zona horaria a la vez.", "Nuestra primera manifestación es «{theme}». ¿Qué guerra? Todas. Queremos que termine toda guerra en este planeta. Mientras meditas, deja que tu corazón y tu intuición dirijan tu atención hacia la que más te necesita.", "Cuando todas las guerras hayan terminado, comenzaremos la siguiente cascada.", "Sostenemos esta intención con plena convicción y te invitamos a sostenerla con nosotros. Únete."], doTitle: "Qué puedes hacer", doBody: "A las 19:07, estés donde estés, únete a nosotros en una hora de meditación para que termine la guerra. Eso es todo. Ven una noche o todas las noches, hasta que la cascada de energía humana colectiva haya hecho su trabajo.", calLabel: "Añadir al calendario", safe: "Practica en un lugar seguro, nunca mientras conduces o manejas maquinaria." , langAria: "Idioma", soundAria: "Sonido", motionAria: "Pausar animación", skip: "Saltar al contenido" },
  fr: { theme: "Mettre fin à la guerre", before: "Votre séance commence dans", during: "Reste de l’heure", doneT: "L’heure est accomplie", doneB: "Ce qui a été porté est maintenant offert au monde. Merci. La cascade continue vers l’ouest.", steps: ["À 19 h 07, heure locale, trouvez un endroit calme et commencez.", "Portez votre attention sur le thème : Mettre fin à la guerre.", "Respirez lentement. Laissez la lourdeur se déposer et tournez-la vers quelque chose de plus léger. Gardez l’intention pendant toute l’heure, ou aussi longtemps que possible.", "Quand vous avez terminé, appuyez sur J’ai médité."], commit: "M’engager dans une cascade", committed: "Engagé pour la prochaine cascade", med: "J’ai médité", medDone: "Enregistré. Merci.", privacy: "Nous comptons les visites et les méditations par fuseau horaire. Rien d’autre.", late: "Vous avez rejoint après {m} minutes. Commencez maintenant.", aboutTitle: "À propos de la pratique", story: ["Pour la première fois de l’histoire humaine, nous pouvons communiquer et nous coordonner à l’échelle de toute la planète en même temps. Et si nous tournions ce pouvoir vers la création d’un monde meilleur ? Et si la méditation pouvait fonctionner comme un collisionneur d’intention, rassemblant les esprits à grande vitesse pour voir quelles formes nouvelles pourraient émerger ?", "Manifestation Cascade commence à 19 h 07 dans chaque fuseau horaire. À mesure que chaque lieu atteint son propre 19 h 07, la pratique fait le tour du monde comme une vague, un fuseau horaire après l’autre.", "Notre première manifestation est « {theme} ». Quelle guerre ? Toutes. Nous voulons que chaque guerre sur cette planète prenne fin. Pendant que vous méditez, laissez votre cœur et votre intuition guider votre attention vers celle qui a le plus besoin de vous.", "Quand toutes les guerres auront pris fin, nous commencerons la cascade suivante.", "Nous portons cette intention avec une pleine conviction et nous vous invitons à la porter avec nous. Rejoignez-nous."], doTitle: "Ce que vous pouvez faire", doBody: "À 19 h 07, où que vous soyez, rejoignez-nous pour une heure de méditation afin de mettre fin à la guerre. C’est tout. Venez un soir, ou tous les soirs, jusqu’à ce que la cascade d’énergie humaine collective ait accompli son œuvre.", calLabel: "Ajouter à l’agenda", safe: "Pratiquez dans un lieu sûr, jamais en conduisant ni en utilisant une machine." , langAria: "Langue", soundAria: "Son", motionAria: "Mettre l’animation en pause", skip: "Aller au contenu" },
  ar: { theme: "أوقفوا الحرب", before: "تبدأ جلستك بعد", during: "المتبقي من الساعة", doneT: "اكتملت الساعة", doneB: "ما حُمل في القلب يُطلق الآن في العالم. شكرًا لك. يستمر الشلال نحو الغرب.", steps: ["في الساعة 7:07 مساءً بتوقيتك المحلي، اعثر على مكان هادئ وابدأ.", "وجّه انتباهك إلى الموضوع: أوقفوا الحرب.", "تنفّس ببطء. دع الثقل يستقر، ووجّهه نحو شيء أخفّ. احمل النية طوال الساعة، أو قدر ما تستطيع.", "عند الانتهاء، اضغط تأمّلتُ."], commit: "ألتزم بالشلال", committed: "ملتزم بالشلال القادم", med: "تأمّلتُ", medDone: "تم التسجيل. شكرًا.", privacy: "نحصي الزيارات وجلسات التأمل حسب المنطقة الزمنية. لا شيء غير ذلك.", late: "انضممت بعد {m} دقيقة. ابدأ الآن.", aboutTitle: "عن الممارسة", story: ["للمرة الأولى في تاريخ البشرية، أصبح بإمكاننا التواصل والتنسيق عبر الكوكب كله في آنٍ واحد. فماذا لو وجّهنا هذه القوة نحو بناء عالم أفضل؟ وماذا لو عمل التأمل كمصادم للنوايا، يجمع العقول بسرعة لنرى أي أشكال جديدة قد تنبثق؟", "يبدأ شلال التجلّي (Manifestation Cascade) في الساعة 7:07 مساءً في كل منطقة زمنية. وعندما يبلغ كل مكان الساعة 7:07 بتوقيته، تنتقل الممارسة حول العالم كموجة، منطقة زمنية تلو الأخرى.", "تجلّينا الأول هو «{theme}». أي حرب؟ جميعها. نريد أن تنتهي كل حرب على هذا الكوكب. وأنت تتأمل، دع قلبك وحدسك يقودان انتباهك إلى الحرب التي تحتاجك أكثر.", "عندما تنتهي كل الحروب، سنبدأ الشلال التالي.", "نحمل هذه النية بقناعة كاملة، وندعوك لتحملها معنا. انضم إلينا."], doTitle: "ما يمكنك فعله", doBody: "في الساعة 7:07 مساءً، أينما كنت، انضم إلينا في ساعة من التأمل لإنهاء الحرب. هذا كل شيء. تعال مساءً واحدًا أو كل مساء، إلى أن يؤدي شلال الطاقة البشرية الجماعية عمله.", calLabel: "أضف إلى التقويم", safe: "مارس التأمل في مكان آمن، وليس أثناء القيادة أو تشغيل الآلات." , langAria: "اللغة", soundAria: "الصوت", motionAria: "إيقاف الحركة مؤقتًا", skip: "تخطَّ إلى المحتوى" },
  he: { theme: "לסיים את המלחמה", before: "המפגש שלך מתחיל בעוד", during: "נותר מהשעה", doneT: "השעה הושלמה", doneB: "מה שהוחזק משתחרר כעת אל העולם. תודה. המפל ממשיך מערבה.", steps: ["בשעה 19:07 לפי שעון מקומי, מצאו מקום שקט והתחילו.", "הפנו את תשומת הלב לנושא: לסיים את המלחמה.", "נשמו לאט. תנו לכובד להתיישב, והפנו אותו אל משהו קל יותר. החזיקו את הכוונה לאורך כל השעה, או ככל שתוכלו.", "בסיום, לחצו על מדיטטתי."], commit: "להתחייב למפל", committed: "התחייבת למפל הבא", med: "מדיטטתי", medDone: "נרשם. תודה.", privacy: "אנחנו סופרים ביקורים ומדיטציות לפי אזור זמן. שום דבר אחר.", late: "הצטרפת אחרי {m} דקות. התחילו עכשיו.", aboutTitle: "על התרגול", story: ["לראשונה בהיסטוריה האנושית, אנחנו יכולים לתקשר ולתאם פעולה על פני כל כדור הארץ בו־זמנית. מה אם נפנה את הכוח הזה ליצירת עולם טוב יותר? מה אם מדיטציה תוכל לפעול כמו מאיץ חלקיקים של כוונה, ותקרב מוחות במהירות כדי לראות אילו צורות חדשות עשויות להיווצר?", "מפל ההתגשמות (Manifestation Cascade) מתחיל בשעה 19:07 בכל אזור זמן. כשכל מקום מגיע ל־19:07 שלו, התרגול עובר סביב העולם כמו גל, אזור זמן אחר אזור זמן.", "ההתגשמות הראשונה שלנו היא «{theme}». איזו מלחמה? כולן. אנחנו רוצים שכל מלחמה על כדור הארץ תסתיים. בזמן שאתם יושבים, תנו ללב ולאינטואיציה שלכם להוביל את תשומת הלב אל המלחמה שהכי זקוקה לכם.", "כשכל המלחמות יסתיימו, נתחיל את המפל הבא.", "אנחנו מחזיקים בכוונה הזו בשכנוע מלא, ומזמינים אתכם להחזיק בה איתנו. הצטרפו אלינו."], doTitle: "מה אפשר לעשות", doBody: "בשעה 19:07, בכל מקום שבו אתם נמצאים, הצטרפו אלינו לשעה של מדיטציה לסיום המלחמה. זה הכול. אפשר לבוא ערב אחד או כל ערב, עד שמפל האנרגיה האנושית הקולקטיבית ישלים את עבודתו.", calLabel: "הוספה ליומן", safe: "תרגלו במקום בטוח, לעולם לא בזמן נהיגה או הפעלת מכונות." , langAria: "שפה", soundAria: "צליל", motionAria: "השהיית האנימציה", skip: "דלג לתוכן" },
  uk: { theme: "Зупинити війну", before: "Ваша сесія почнеться через", during: "Залишилось години", doneT: "Годину завершено", doneB: "Те, що ми тримали, тепер відпущено у світ. Дякуємо. Каскад рухається далі на захід.", steps: ["О 19:07 за місцевим часом знайдіть тихе місце й почніть.", "Зосередьтеся на темі: Зупинити війну.", "Дихайте повільно. Нехай важкість вляжеться, і спрямуйте її до чогось легшого. Тримайте намір усю годину або скільки зможете.", "Коли завершите, натисніть «Я медитував(ла)»."], commit: "Долучитися до каскаду", committed: "Ви долучилися до наступного каскаду", med: "Я медитував(ла)", medDone: "Записано. Дякуємо.", privacy: "Ми рахуємо відвідування й медитації за часовими поясами. Більше нічого.", late: "Ви приєдналися на {m}-й хвилині. Почніть зараз.", aboutTitle: "Про практику", story: ["Вперше в історії людства ми можемо спілкуватися й узгоджувати дії в масштабі всієї планети одночасно. А що, як спрямувати цю силу на створення кращого світу? Що, як медитація могла б діяти як колайдер наміру, швидко зводячи розуми разом, щоб побачити, які нові форми можуть виникнути?", "Manifestation Cascade починається о 19:07 у кожному часовому поясі. Коли кожне місце досягає власних 19:07, практика проходить світом, мов хвиля, один часовий пояс за одним.", "Наше перше втілення — «{theme}». Яка війна? Усі. Ми хочемо, щоб закінчилася кожна війна на цій планеті. Поки ви медитуєте, нехай серце й інтуїція спрямують вашу увагу до тієї, якій ви потрібніші за все.", "Коли всі війни закінчаться, ми розпочнемо наступний каскад.", "Ми тримаємо цей намір із повною переконаністю й запрошуємо вас тримати його разом із нами. Приєднуйтесь."], doTitle: "Що ви можете зробити", doBody: "О 19:07, де б ви не були, приєднуйтесь до години медитації, щоб зупинити війну. Це все. Приходьте на один вечір або щовечора, доки каскад колективної людської енергії не зробить свою справу.", calLabel: "Додати до календаря", safe: "Практикуйте в безпечному місці, ніколи за кермом і не поруч із небезпечними механізмами." , langAria: "Мова", soundAria: "Звук", motionAria: "Призупинити анімацію", skip: "Перейти до вмісту" },
  ru: { theme: "Остановить войну", before: "Ваша сессия начнётся через", during: "Осталось от часа", doneT: "Час завершён", doneB: "То, что мы держали, теперь отпущено в мир. Спасибо. Каскад движется дальше на запад.", steps: ["В 19:07 по местному времени найдите тихое место и начните.", "Сосредоточьтесь на теме: Остановить войну.", "Дышите медленно. Позвольте тяжести осесть и направьте её к чему-то более лёгкому. Держите намерение весь час или сколько сможете.", "Когда закончите, нажмите «Я медитировал(а)»."], commit: "Присоединиться к каскаду", committed: "Вы присоединились к следующему каскаду", med: "Я медитировал(а)", medDone: "Записано. Спасибо.", privacy: "Мы считаем посещения и медитации по часовым поясам. Больше ничего.", late: "Вы присоединились на {m}-й минуте. Начните сейчас.", aboutTitle: "О практике", story: ["Впервые в истории человечества мы можем общаться и согласовывать действия по всей планете одновременно. Что, если направить эту силу на создание лучшего мира? Что, если медитация сможет работать как коллайдер намерения, быстро соединяя умы, чтобы увидеть, какие новые формы могут возникнуть?", "Manifestation Cascade начинается в 19:07 в каждом часовом поясе. Когда каждое место достигает своих 19:07, практика проходит по миру волной, один часовой пояс за другим.", "Наше первое воплощение — «{theme}». Какая война? Все. Мы хотим, чтобы закончилась каждая война на этой планете. Пока вы медитируете, пусть сердце и интуиция направят ваше внимание к той, которой вы нужнее всего.", "Когда все войны закончатся, мы начнём следующий каскад.", "Мы держим это намерение с полной убеждённостью и приглашаем вас держать его вместе с нами. Присоединяйтесь."], doTitle: "Что вы можете сделать", doBody: "В 19:07, где бы вы ни были, присоединяйтесь к часу медитации, чтобы остановить войну. Это всё. Приходите на один вечер или каждый вечер, пока каскад коллективной человеческой энергии не сделает своё дело.", calLabel: "Добавить в календарь", safe: "Практикуйте в безопасном месте, никогда за рулём и не работая с механизмами." , langAria: "Язык", soundAria: "Звук", motionAria: "Приостановить анимацию", skip: "Перейти к содержимому" },
  zh: { theme: "终结战争", before: "你的冥想将在以下时间后开始", during: "本小时剩余", doneT: "这一小时已圆满", doneB: "所守持的，此刻释放向世界。谢谢你。冥想之波继续向西流动。", steps: ["在当地时间晚上7:07，找一个安静的地方开始。", "将注意力放在主题上：终结战争。", "缓慢呼吸。让沉重慢慢沉淀，并将它转向更轻盈的方向。守持这份意念一整个小时，或尽你所能。", "结束后，请按“我已冥想”。"], commit: "承诺参与冥想之波", committed: "已承诺参与下一次", med: "我已冥想", medDone: "已记录。谢谢。", privacy: "我们只按时区统计访问和冥想次数，别无其他。", late: "你在第{m}分钟加入。现在开始吧。", aboutTitle: "关于这项练习", story: ["在人类历史上，我们第一次能够在整个地球范围内同时沟通与协作。如果我们把这份力量用来创造更美好的世界呢？如果冥想能像对撞机一样作用于意念，让人心迅速汇聚，看看会涌现出怎样的新形态呢？", "Manifestation Cascade（显化之波）在每个时区的晚上7:07开始。当每个地方到达自己的7:07时，这项练习便如波浪般环绕世界，一个时区接着一个时区。", "我们的第一个显化是“{theme}”。哪一场战争？所有的战争。我们希望地球上的每一场战争都能结束。静坐时，让你的心和直觉引导你的专注，去往最需要你的那一场。", "当所有战争都结束后，我们将开始下一轮冥想之波。", "我们带着充分的信念守持这份意念，也邀请你与我们一同守持。加入我们。"], doTitle: "你可以做什么", doBody: "在晚上7:07，无论你身在何处，加入我们一起冥想一小时，终结战争。仅此而已。你可以只来一个晚上，也可以每晚都来，直到集体人类能量的冥想之波完成它的使命。", calLabel: "添加到日历", safe: "请在安全的地方练习，切勿在驾驶或操作机器时进行。" , langAria: "语言", soundAria: "声音", motionAria: "暂停动画", skip: "跳到内容" },
  hi: { theme: "युद्ध समाप्त करो", before: "आपका सत्र शुरू होने में", during: "घंटे में शेष", doneT: "घंटा पूर्ण हुआ", doneB: "जो थामा गया था, वह अब संसार में मुक्त होता है। धन्यवाद। यह लहर पश्चिम की ओर बढ़ती रहती है।", steps: ["अपने स्थानीय समय शाम 7:07 बजे, कोई शांत जगह ढूँढें और शुरू करें।", "अपना ध्यान विषय पर लाएँ: युद्ध समाप्त करो।", "धीरे-धीरे साँस लें। बोझ को ठहरने दें और उसे किसी हल्की चीज़ की ओर मोड़ें। पूरे घंटे, या जितना हो सके, संकल्प बनाए रखें।", "समाप्त होने पर, मैंने ध्यान किया दबाएँ।"], commit: "लहर से जुड़ने का संकल्प लें", committed: "अगली लहर के लिए संकल्पित", med: "मैंने ध्यान किया", medDone: "दर्ज हो गया। धन्यवाद।", privacy: "हम समय क्षेत्र के अनुसार केवल विज़िट और ध्यान गिनते हैं। और कुछ नहीं।", late: "आप {m} मिनट बाद जुड़े। अभी शुरू करें।", aboutTitle: "इस अभ्यास के बारे में", story: ["मानव इतिहास में पहली बार हम पूरी पृथ्वी पर एक साथ संवाद और समन्वय कर सकते हैं। क्या हो अगर हम इस शक्ति को एक बेहतर दुनिया बनाने की ओर मोड़ें? क्या हो अगर ध्यान संकल्प के लिए एक कोलाइडर की तरह काम करे, जो मनों को तेज़ी से एक साथ लाए ताकि देखा जा सके कि कौन-से नए रूप उभर सकते हैं?", "Manifestation Cascade हर समय क्षेत्र में शाम 7:07 बजे शुरू होता है। जैसे ही हर स्थान अपने 7:07 पर पहुँचता है, यह अभ्यास एक लहर की तरह दुनिया भर में घूमता है, एक-एक समय क्षेत्र करके।", "हमारा पहला संकल्प है «{theme}»। कौन-सा युद्ध? सभी। हम चाहते हैं कि इस पृथ्वी पर हर युद्ध समाप्त हो। ध्यान करते समय, अपने हृदय और अंतर्ज्ञान को अपना ध्यान उस युद्ध की ओर ले जाने दें जिसे आपकी सबसे अधिक आवश्यकता है।", "जब सभी युद्ध समाप्त हो जाएँगे, हम अगली लहर शुरू करेंगे।", "हम इस संकल्प को पूरे विश्वास के साथ थामे हैं, और आपको भी इसे हमारे साथ थामने के लिए आमंत्रित करते हैं। हमसे जुड़ें।"], doTitle: "आप क्या कर सकते हैं", doBody: "शाम 7:07 बजे, आप जहाँ भी हों, युद्ध समाप्त करने के लिए एक घंटे के ध्यान में हमारे साथ जुड़ें। बस इतना ही। आप एक शाम आ सकते हैं, या हर शाम, जब तक सामूहिक मानव ऊर्जा की यह लहर अपना काम पूरा न कर ले।", calLabel: "कैलेंडर में जोड़ें", safe: "कृपया सुरक्षित स्थान पर अभ्यास करें, गाड़ी चलाते या मशीन चलाते समय कभी नहीं।" , langAria: "भाषा", soundAria: "ध्वनि", motionAria: "एनिमेशन रोकें", skip: "सामग्री पर जाएँ" },
  pt: { theme: "Pelo fim da guerra", before: "Sua sessão começa em", during: "Resta da hora", doneT: "A hora está completa", doneB: "O que foi sustentado agora é liberado no mundo. Obrigado. A cascata segue para o oeste.", steps: ["Às 19h07, no seu horário local, encontre um lugar tranquilo e comece.", "Leve sua atenção ao tema: Pelo fim da guerra.", "Respire devagar. Deixe o peso assentar e volte-o para algo mais leve. Sustente a intenção pela hora inteira, ou pelo tempo que puder.", "Ao terminar, toque em Eu meditei."], commit: "Comprometer-me com uma cascata", committed: "Comprometido com a próxima cascata", med: "Eu meditei", medDone: "Registrado. Obrigado.", privacy: "Contamos visitas e meditações por fuso horário. Nada mais.", late: "Você entrou aos {m} minutos. Comece agora.", aboutTitle: "Sobre a prática", story: ["Pela primeira vez na história humana, podemos nos comunicar e nos coordenar em todo o planeta ao mesmo tempo. E se direcionássemos esse poder para criar um mundo melhor? E se a meditação pudesse funcionar como um colisor de intenção, reunindo mentes em alta velocidade para ver que novas formas poderiam surgir?", "Manifestation Cascade começa às 19h07 em cada fuso horário. À medida que cada lugar chega ao seu próprio 19h07, a prática percorre o mundo como uma onda, um fuso horário de cada vez.", "Nossa primeira manifestação é “{theme}”. Qual guerra? Todas. Queremos que toda guerra neste planeta termine. Enquanto você medita, deixe seu coração e sua intuição conduzirem sua atenção até aquela que mais precisa de você.", "Quando todas as guerras tiverem terminado, começaremos a próxima cascata.", "Mantemos esta intenção com plena convicção e convidamos você a mantê-la conosco. Junte-se a nós."], doTitle: "O que você pode fazer", doBody: "Às 19h07, onde quer que esteja, junte-se a nós em uma hora de meditação pelo fim da guerra. É só isso. Venha por uma noite ou todas as noites, até que a cascata de energia humana coletiva tenha feito o seu trabalho.", calLabel: "Adicionar ao calendário", safe: "Pratique em um lugar seguro, nunca ao dirigir ou operar máquinas." , langAria: "Idioma", soundAria: "Som", motionAria: "Pausar animação", skip: "Ir para o conteúdo" },
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
  ctx: null, master: null, voice: null, bellT: null, pulseT: null, firstT: null, mode: null,
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
      this.firstT = setTimeout(strike, 2000);
    }
    if (m.pulse) this.pulseT = setInterval(() => self.thump(m.pulse.gain), 60000 / m.pulse.bpm);
  },
  clear() {
    clearInterval(this.bellT); clearInterval(this.pulseT); clearTimeout(this.firstT); this.mode = null;
    if (this.voice && this.ctx) {
      const v = this.voice, t = this.ctx.currentTime;
      v.g.gain.cancelScheduledValues(t);
      v.g.gain.setTargetAtTime(0, t, 1);
      setTimeout(() => { v.oscs.forEach((o) => { try { o.stop(); } catch (e) { /* already stopped */ } }); v.g.disconnect(); }, 5000);
    }
    this.voice = null;
  },
  // Hard stop for backgrounding: when the page is not visible NOTHING may keep playing or scheduling.
  // Closing the context silences every oscillator and tail at once and frees the audio hardware;
  // it is rebuilt on return (see Controller.resumeSound).
  halt() {
    clearInterval(this.bellT); clearInterval(this.pulseT); clearTimeout(this.firstT);
    const c = this.ctx;
    this.ctx = null; this.master = null; this.voice = null; this.mode = null;
    if (c && c.state !== "closed") Promise.resolve().then(() => c.close()).catch(() => {});
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
    this.still = get("mc.still") === "1"; // user-chosen "pause animation" (WCAG 2.2.2)
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
    this._vis = () => {
      if (document.visibilityState === "visible") { this.emit(); if (this.last === "active") this.lockScreen(true); this.resumeSound(); }
      else this.pauseSound(); // user switched app / tab, locked the screen, etc.
    };
    this._hide = () => this.pauseSound();
    document.addEventListener("visibilitychange", this._vis);
    window.addEventListener("pagehide", this._hide);
    document.addEventListener("freeze", this._hide);
    if (get("mc.visit") !== key(Date.now())) { set("mc.visit", key(Date.now())); this.rec("visit"); }
    if (this.sound) this.armGesture(); // browsers block autoplay: resume the saved "sound on" choice at the first gesture
  }
  armGesture() {
    if (this._arm) return;
    this._arm = () => {
      document.removeEventListener("pointerdown", this._arm, true);
      document.removeEventListener("keydown", this._arm, true);
      this._arm = null;
      if (this.sound && document.visibilityState === "visible") this.applySound();
    };
    document.addEventListener("pointerdown", this._arm, true);
    document.addEventListener("keydown", this._arm, true);
  }
  pauseSound() { Sound.halt(); } // the saved preference (this.sound) is kept, so sound comes back with the page
  resumeSound() {
    if (!this.sound || document.visibilityState !== "visible") return;
    this.applySound();
    // Some mobile browsers refuse to start audio without a fresh tap: retry on the next gesture.
    setTimeout(() => { if (this.sound && (!Sound.ctx || Sound.ctx.state !== "running")) this.armGesture(); }, 400);
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
  toggleMotion() { this.still = !this.still; set("mc.still", this.still ? "1" : "0"); this.emit(); }
  toggleSound() { this.sound = !this.sound; set("mc.sound", this.sound ? "1" : "0"); this.applySound(); this.emit(); }
  applySound() {
    if (this.sound && document.visibilityState !== "visible") return;
    Sound.setOn(this.sound);
    if (this.sound) { Sound.mode = null; Sound.setMode(this.last === "waiting" ? "waiting" : "active", this.opts.audio); }
  }
  commit() { const c = this.compute(); set("mc.commit", key(c.start)); this.rec("commitment"); this.emit(); }
  meditate() { const c = this.compute(); if (get("mc.med") === key(c.start)) return; set("mc.med", key(c.start)); this.rec("meditation"); this.emit(); }
  destroy() {
    clearInterval(this.iv);
    document.removeEventListener("visibilitychange", this._vis);
    window.removeEventListener("pagehide", this._hide);
    document.removeEventListener("freeze", this._hide);
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
      countLabel: label, count, sub, steps: t.steps, privacy: t.privacy, safe: t.safe, langAria: t.langAria, soundAria: t.soundAria, motionAria: t.motionAria, skip: t.skip, motionOff: this.still,
      aboutTitle: t.aboutTitle, story: t.story.map((x) => x.replace("{theme}", t.theme)), doTitle: t.doTitle, doBody: t.doBody, calLabel: t.calLabel, start: c.start,
      commitLabel: t.commit, committedLabel: t.committed, medLabel: t.med, medDoneLabel: t.medDone,
      showCommit: w && !committed, showCommitted: w && committed, showMed: medWin && !medDone, showMedDone: medWin && medDone,
      showSteps: w, progress: Math.max(0, Math.min(1, c.progress)), tz: this.tz, utc, sound: this.sound,
    };
  }
}
