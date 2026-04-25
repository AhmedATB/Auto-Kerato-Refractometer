// === PROFESSOR DATABASE ===
const profDB = {
    'optics': { t: "البصريات الفيزيائية (Physical Optics)", d: "فرع من الفيزياء يدرس سلوك وخصائص الضوء وتفاعله مع المادة. في جهازنا، يدرس كيفية انكسار ضوء الأشعة تحت الحمراء عند مروره عبر قرنية وعدسة المريض." },
    'mechatronics': { t: "الميكاترونكس (Mechatronics)", d: "هندسة تجمع بين الميكانيكا، الإلكترونيات، وبرمجة الحاسب. الجهاز يتحرك ميكانيكيًا لضبط محاذاة العين، ويقرأ إلكترونيًا بالكاميرا، ويحلل برمجيًا بالخوارزميات. هذا هو جوهر الميكاترونكس!" },
    'objective_ref': { t: "الانكسار الموضوعي (Objective Refraction)", d: "هو قياس الضعف البصري دون الحاجة لأي إجابة من المريض. الجهاز يطلق الضوء، يقرأ الانعكاس، ويعطي الرقم. على النقيض من 'الانكسار الذاتي' حيث يسأل الطبيب: هل ترى هذا الحرف بوضوح؟" },
    'auto': { t: "الأتمتة (Automation)", d: "قدرة الجهاز على أداء مهامه آليًا دون تدخل بشري. الجهاز الحديث يجد بؤبؤ العين، يقترب منه، يأخذ القياس، وينتقل للعين الأخرى بضغطة زر واحدة." },
    'totally': { t: "الإلغاء التام للجهد", d: "كان فحص الشبكية اليدوي (Retinoscopy) يتطلب طبيبًا بمهارة استثنائية وجو غرفة مظلم، ويستغرق وقتًا طويلًا. الجهاز ألغى كل هذا تمامًا، ليصبح الفحص متاحًا في أي وقت وبدقة قياسية." },
    'instrument_myopia': { t: "التكيف الناجم عن الجهاز (Instrument Myopia)", d: "ميل المريض للتركيز على الهدف داخل الجهاز، مما يجعل العين تبدو أكثر قصراً للنظر مما هي عليه. ويحل بالتضبيب (Fogging)." },
    'iol_mode': { t: "وضع العدسات المزروعة (IOL Mode)", d: "وضع برمجي خاص يتم تفعيله للمرضى الذين أجروا عمليات زراعة عدسات داخل العين (Intraocular Lens) بسبب المياه البيضاء، وذلك لأن انعكاس الضوء من العدسة الصناعية يختلف عن الطبيعية." }
};

// === HISTORY DATABASE ===
const historyDB = {
    'scheiner': {
        year: "YEAR 1619", title: "مبدأ شاينر: البذرة الأولى",
        media: `<div class="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-800 to-black relative overflow-hidden">
                    <div class="w-32 h-32 rounded-full border-4 border-cyan-500 flex items-center justify-center relative animate-pulse shadow-[0_0_20px_#00f0ff]">
                        <div class="w-4 h-4 bg-red-500 rounded-full absolute left-4 shadow-[0_0_15px_red]"></div>
                        <div class="w-4 h-4 bg-red-500 rounded-full absolute right-4 shadow-[0_0_15px_red]"></div>
                    </div>
                    <p class="text-slate-400 mt-6 font-mono text-sm tracking-widest">[SIMULATION: DOUBLE PINHOLE]</p>
                </div>`,
        caption: "انقسام حزم الضوء يثبت وجود خطأ انكساري في العين.",
        content: `
            <div class="mb-6"><strong class="text-cyan-400 block mb-2 text-xl">العقدة التاريخية:</strong>في القرن الـ17، أراد كريستوف شاينر فهم كيفية تركيز العين للضوء بصورة دقيقة.</div>
            <div class="mb-6"><strong class="text-amber-400 block mb-2 text-xl">الاكتشاف الجوهري:</strong>صنع قرصًا بثقبين. إذا كانت العين سليمة، تتجمع الأشعة بنقطة واحدة. في حالة قصر/طول النظر، تسقط الأشعة بمكانين ويرى المريض "نقطتين".</div>
            <div class="bg-purple-900/20 p-5 rounded-xl border border-purple-500/50 shadow-inner">
                <strong class="text-purple-400 text-lg block mb-2">الربط بجهازنا (Auto-Refractor):</strong>
                الجهاز الحديث يسقط حزمتين من الـ IR، وتقوم الكاميرا بتصوير انزياح الطور (Phase Shift) وحسابه بالديوبتر آليًا بدل سؤال المريض.
            </div>`
    },
    'porterfield': {
        year: "YEAR 1759", title: "أبتوميتر بورترفيلد ومبدأ بادال",
        media: `<div class="w-full h-full flex flex-col items-center justify-center bg-black relative overflow-hidden">
                    <div class="w-full h-1 bg-cyan-500/30 absolute top-1/2"></div>
                    <div class="w-12 h-28 border-[3px] border-cyan-400 rounded-[50%] bg-cyan-900/30 backdrop-blur-md relative animate-[pulse_3s_infinite] shadow-[0_0_20px_#00f0ff]"></div>
                    <p class="text-slate-400 mt-10 font-mono text-sm tracking-widest">[OPTICAL RAIL: BADAL SYSTEM]</p>
                </div>`,
        caption: "تطبيق مبدأ بادال لتحريك الهدف بصرياً دون تغيير العدسات.",
        content: `
            <div class="mb-6"><strong class="text-cyan-400 block mb-2 text-xl">المشكلة الهندسية:</strong>لتغيير القوة الانكسارية قديماً، كان يجب تغيير العدسات الزجاجية باستمرار، مما يجعل الأجهزة ضخمة.</div>
            <div class="mb-6"><strong class="text-amber-400 block mb-2 text-xl">الابتكار (Badal Principle):</strong>استخدام عدسة متقاربة، وتغيير "القوة البصرية" بمجرد إزاحة الهدف للأمام أو للخلف على مسار مستقيم.</div>
            <div class="bg-purple-900/20 p-5 rounded-xl border border-purple-500/50 shadow-inner">
                <strong class="text-purple-400 text-lg block mb-2">التطبيق الميكاترونيكي اليوم:</strong>
                بدون مبدأ بادال، لم يكن لنظام التضبيب (Auto-Fogging) أن يوجد! المحركات الدقيقة (Stepper Motors) تحرك المنطاد لإرخاء عين المريض.
            </div>`
    },
    'helmholtz': {
        year: "YEAR 1851", title: "هيلمهولتز واختراع الكيراتوميتر",
        media: `<div class="w-full h-full flex flex-col items-center justify-center bg-black relative overflow-hidden">
                    <div class="w-36 h-36 rounded-full border-4 border-dashed border-green-500 animate-[spin_15s_linear_infinite] opacity-50"></div>
                    <div class="w-28 h-28 rounded-full border-4 border-green-400 absolute shadow-[0_0_25px_#39ff14]"></div>
                    <p class="text-green-400 mt-6 font-mono text-sm absolute bottom-4 tracking-widest">[CORNEAL REFLECTION]</p>
                </div>`,
        caption: "استخدام القرنية كمرآة محدبة لحساب نصف قطر التكور.",
        content: `
            <div class="mb-6"><strong class="text-cyan-400 block mb-2 text-xl">التحدي التشريحي:</strong>لمعالجة الاستجماتيزم، كان لا بد من قياس تشوه السطح الأمامي للقرنية.</div>
            <div class="mb-6"><strong class="text-amber-400 block mb-2 text-xl">الحل الفيزيائي:</strong>أدرك هيرمان فون هيلمهولتز أن القرنية تعمل كمرآة محدبة. بإسقاط أشكال مضيئة وقياس حجم انعكاسها، يُحسب نصف قطر التكور.</div>
            <div class="bg-purple-900/20 p-5 rounded-xl border border-purple-500/50 shadow-inner">
                <strong class="text-purple-400 text-lg block mb-2">تطور المنظومة:</strong>
                هذا الابتكار يعيش اليوم في أجهزتنا من خلال (حلقات بلاسيدو) والخوارزميات التي تلتقط آلاف النقاط.
            </div>`
    },
    'collins': {
        year: "YEAR 1937", title: "أول مقياس إلكتروني",
        media: `<div class="w-full h-full flex flex-col items-center justify-center bg-black relative overflow-hidden">
                    <div class="flex items-center gap-4 z-10">
                        <div class="w-8 h-8 bg-red-600 rounded-full animate-ping"></div>
                        <div class="h-1 w-24 bg-red-500 shadow-[0_0_15px_red]"></div>
                        <div class="w-16 h-16 border-2 border-red-500 flex items-center justify-center font-mono text-red-500">SENSOR</div>
                    </div>
                    <p class="text-red-500 mt-6 font-mono text-sm z-10 tracking-widest">[INFRARED ELECTRO-OPTICS]</p>
                </div>`,
        caption: "براءة اختراع جيفري كولينز.",
        content: `
            <div class="mb-6"><strong class="text-cyan-400 block mb-2 text-xl">الرؤية المستقبلية:</strong>قدم جيفري كولينز براءة اختراع لأول جهاز يعتمد على الدوائر الإلكترونية واستخدام "الأشعة تحت الحمراء" (IR) حتى لا يتقلص بؤبؤ العين أثناء الفحص.</div>
            <div class="bg-purple-900/20 p-5 rounded-xl border border-purple-500/50 shadow-inner">
                <strong class="text-purple-400 text-lg block mb-2">النقطة المفصلية:</strong>
                هي الأساس الذي بنيت عليه جميع أجهزة (Auto-Refractometer) الحديثة.
            </div>`
    },
    'nasa': {
        year: "THE 1960s", title: "أزمة ناسا وتطوير الـ Tracking",
        media: `<div class="w-full h-full flex flex-col items-center justify-center bg-black relative overflow-hidden">
                    <div class="w-48 h-48 border-2 border-green-500 rounded-full flex items-center justify-center relative shadow-[0_0_30px_rgba(57,255,20,0.2)]">
                        <div class="w-full h-1 bg-green-500 absolute animate-[spin_1.5s_linear_infinite]"></div>
                        <div class="w-12 h-12 bg-green-400/40 rounded-full animate-pulse"></div>
                    </div>
                    <p class="text-green-500 mt-6 font-mono text-sm z-10 tracking-widest">[DYNAMIC EYE TRACKING]</p>
                </div>`,
        caption: "الضرورة العسكرية تخلق تقنيات التتبع.",
        content: `
            <div class="mb-6"><strong class="text-cyan-400 block mb-2 text-xl">تهديد قاتل:</strong>ظاهرة "Empty Field Myopia" جعلت طياري ناسا غير قادرين على التركيز في الفضاء.</div>
            <div class="mb-6"><strong class="text-amber-400 block mb-2 text-xl">الحل العبقري:</strong>مولت ناسا ابتكار (Optometers) تعمل بالأشعة تحت الحمراء مع أنظمة تتبع حركة العين (Eye-tracking).</div>
            <div class="bg-purple-900/20 p-5 rounded-xl border border-purple-500/50 shadow-inner">
                <strong class="text-purple-400 text-lg block mb-2">ثمرة الفضاء في العيادات:</strong>
                هذه التقنيات العسكرية تم تصغيرها لتمنح أجهزتنا الحديثة قدرة التتبع الآلي (Auto-Alignment).
            </div>`
    },
    'wavefront': {
        year: "YEAR 2000+", title: "Shack-Hartmann: الخرائط الدقيقة",
        media: `<div class="w-full h-full flex flex-col items-center justify-center bg-black relative overflow-hidden perspective-1000">
                    <div class="grid grid-cols-6 gap-2 transform rotate-x-45 animate-pulse">
                        ${Array(36).fill('<div class="w-4 h-4 bg-cyan-500 rounded-full shadow-[0_0_12px_#00f0ff]"></div>').join('')}
                    </div>
                    <p class="text-cyan-400 mt-10 font-mono text-sm z-10 tracking-widest">[MICRO-LENSLET ARRAY]</p>
                </div>`,
        caption: "مصفوفة العدسات الدقيقة للتشوهات المعقدة.",
        content: `
            <div class="mb-6"><strong class="text-cyan-400 block mb-2 text-xl">من التلسكوبات إلى العيون:</strong>تقنية صُممت لعلماء الفلك لمراقبة النجوم، تم توجيهها نحو العين البشرية.</div>
            <div class="mb-6"><strong class="text-amber-400 block mb-2 text-xl">نقلة نوعية:</strong>تستخدم مصفوفة من العدسات المجهرية (Lenslets) لتقسيم الضوء وإنشاء خريطة ثلاثية الأبعاد للتشوهات.</div>
            <div class="bg-purple-900/20 p-5 rounded-xl border border-purple-500/50 shadow-inner">
                <strong class="text-purple-400 text-lg block mb-2">عهد ما قبل الليزك:</strong>
                الجهاز الآن يوفر "البصمة البصرية" للعين، لتوجيه روبوتات الليزر لإجراء عمليات (Custom LASIK).
            </div>`
    }
};

// === COMPONENTS DATABASE ===
const componentsDB = {
    'sld': { name: 'مصدر الأشعة (SLD Source)', desc: 'تستخدم الأجهزة الحديثة ثنائيات فائقة الإضاءة (Super Luminescent Diode) لتوفر شعاعًا أكثر حدة واختراقًا للوسائط المعتمة (مثل المياه البيضاء)، وتسمح بالقياس الدقيق من خلال بؤبؤ صغير جداً يصل قطره إلى 2.0 ملم فقط، وتكون بطول موجي يقارب 800-900 نانومتر (Infrared) لتجنب انزعاج المريض.', icon: '💡' },
    'mirror': { name: 'نظام المنشور الدوار (Rotary Prism)', desc: 'يعمل كمقسم أشعة (Beam Splitter). في أجهزة شركة Topcon، يعتمد النظام على "منشور دوار" يدور لامركزيًا لمسح منطقة أوسع من الشبكية وتقليل العيوب الناتجة عن قاع العين.', icon: '🪞' },
    'fog': { name: 'عدسات التضبيب (Auto-Fogging)', desc: 'لحل مشكلة "Instrument Myopia"، يتم عرض هدف تثبيت (مثل بالون هواء ساخن أو صورة منزل) ويقوم النظام الميكانيكي بتحريكه بصريًا إلى ما وراء نقطة التركيز، مما يجبر عضلات العين الهدبية على الاسترخاء والوصول لحالة السكون الانكساري قبل أخذ القراءة.', icon: '🌫️' },
    'ccd': { name: 'مستشعر الصور (CCD/CMOS)', desc: 'العين الإلكترونية للجهاز. تلتقط حلقة الضوء المنعكسة من قاع العين، وتحولها إلى إشارات رقمية. في الأجهزة الحديثة يوضع أمام المستشعر مصفوفة عدسات (Shack-Hartmann) تقيس انحراف جبهة الموجة رياضيًا:<div class="my-4 p-3 bg-black rounded shadow-inner text-center overflow-x-auto border border-cyan-800" dir="ltr">$$\\Delta W(x,y) = \\frac{\\partial W}{\\partial x}\\Delta x + \\frac{\\partial W}{\\partial y}\\Delta y$$</div>', icon: '📸' },
    'joy': { name: 'وحدة التحكم (Control Unit)', desc: 'واجهة المستخدم الميكانيكية واللوحة الأم. تتحكم في المحركات الدقيقة (Stepper Motors) في 3 اتجاهات (X, Y, Z). في الأجهزة الحديثة جداً، تدير هذه الوحدة محركات التتبع الآلي (Auto-Tracking) بالكامل بالاعتماد على تغذية راجعة من الكاميرا.', icon: '🕹️' }
};

// === PRINTOUT RECEIPT DATABASE ===
const receiptDataDB = {
    'meas': { t: "القياسات الفردية (Measurements)", d: "يأخذ 3 قراءات سريعة للعين لأنها تتحرك بشكل مجهري دائمًا، مما يضمن دقة إحصائية." },
    'meas_err': { t: "قراءة مع نسبة خطأ", d: "تم تخفيض وزن هذه القراءة (Reliability Index) لاحتمال رمشة المريض خلال هذا الجزء من الثانية." },
    'avg': { t: "المتوسط الحسابي (AVG)", d: "السطر الأهم! استخراج الرقم الأكثر استقرارًا الذي سيبنى عليه التشخيص الفعلي للمريض." },
    'se': { t: "المكافئ الكروي (S.E.)", d: "معادلة رياضية: SPH + (CYL/2). تُستخدم لتبسيط الوصفة إذا أراد المريض ارتداء عدسات لاصقة كروية." },
    'k1': { t: "انحناء القرنية المسطح (Flat K)", d: "الرقم 7.80mm يمثل نصف قطر الانحناء. كلما صغر الرقم، زادت قوة تحدب القرنية بالديوبتر." },
    'k2': { t: "انحناء القرنية المنحدر (Steep K)", d: "القياس المنحدر (الأكثر تقوسًا). الاختلاف في التقوس بين المحورين هو ما يخلق الاستجماتيزم القرني." },
    'cylk': { t: "الاستجماتيزم القرني (CYL)", d: "ناتج الطرح بين K2 و K1. يمثل التشوه الموجود في القرنية فقط بمعزل عن العدسة الداخلية." },
    'pd': { t: "المسافة الحدقية (PD)", d: "المسافة بالمليمتر بين مركز بؤبؤ العين اليمنى واليسرى لتنصيف عدسة النظارة بدقة." }
};

// === SCENARIOS DATABASE ===
const scenariosDB = [
    { icon: "👵", title: "مريض يعاني من المياه البيضاء (Cataract)", desc: "العدسة الداخلية للعين معتمة كالزجاج المصنفر. الحديثة تستخدم SLD قوي جدًا لاختراق العتامة، أو تنبه الطبيب عبر (Cataract Mode)." },
    { icon: "👶", title: "طفل رضيع يبكي ويتحرك", desc: "تم اختراع (Handheld Autorefractors) أجهزة محمولة باليد بحجم الكاميرا تصور عيني الطفل معًا من مسافة متر واحد في جزء من الثانية بالاعتماد على ذكاء اصطناعي." },
    { icon: "👁️", title: "القرنية المخروطية (Keratoconus)", desc: "القرنية مدببة. قراءات الـ Refraction تتغير بعنف مع كل ضغطة. الجهاز الحديث سيطلق جرس إنذار للطبيب ليقوم بتصوير طبوغرافي للعين." },
    { icon: "📱", title: "شاب مدمن للهواتف الذكية", desc: "عضلات العين متشنجة تمامًا. الجهاز سيعطي قراءة خاطئة تفيد بوجود 'قصر نظر' عالٍ. يحتاج الطبيب لوضع قطرة شالّة للعضلة (Cycloplegic)." },
    { icon: "🕶️", title: "التصوير الخاطئ في غرفة مشمسة", desc: "أشعة الشمس مليئة بالأشعة تحت الحمراء! الكاميرا ستصاب بالعمى (Noise) بسبب تداخل الأشعة. لهذا يجب وضع الجهاز في غرفة خافتة." },
    { icon: "🔪", title: "مريض بعد عملية الليزك (Post-LASIK)", desc: "الليزك يقوم بتسطيح القرنية. الخوارزميات القياسية تتوقع قرنية كروية، لذلك الأجهزة المتطورة تحتوي (Post-Refractive Mode)." }
];
