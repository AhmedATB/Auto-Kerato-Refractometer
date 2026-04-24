const profDB = {
    'optics': { t: "البصريات الفيزيائية", d: "دراسة سلوك الضوء. الجهاز يدرس كيفية انكسار الـ IR عبر القرنية." },
    'mechatronics': { t: "الميكاترونكس", d: "هندسة تجمع الميكانيكا، الإلكترونيات، والبرمجة معاً (Control Systems)." },
    'objective_ref': { t: "الانكسار الموضوعي", d: "قياس الضعف دون الاعتماد على جواب المريض (عكس الـ Subjective)." },
    'auto': { t: "الأتمتة", d: "الأداء عبر خوارزميات التتبع الآلي دون تدخل يدوي." },
};

const componentsDB = [
    { id: 'sld', name: '1. مصدر الأشعة (SLD Source)', desc: 'تستخدم الأجهزة الحديثة ثنائيات فائقة الإضاءة لتوفر شعاعًا أكثر حدة واختراقًا للوسائط المعتمة (مثل المياه البيضاء)، وتكون بطول موجي يقارب 800-900 نانومتر (Infrared) لتجنب انزعاج المريض.', icon: '💡' },
    { id: 'mirror', name: '2. نظام المنشور الدوار (Rotary Prism)', desc: 'يعتمد النظام على "منشور دوار" يدور لامركزيًا لمسح منطقة أوسع من الشبكية وتقليل العيوب الناتجة عن قاع العين.', icon: '🪞' },
    { id: 'fog', name: '3. عدسات التضبيب (Auto-Fogging)', desc: 'لحل مشكلة "Instrument Myopia"، يتم عرض هدف تثبيت وتحريكه بصريًا إلى ما وراء نقطة التركيز، مما يجبر عضلات العين الهدبية على الاسترخاء.', icon: '🌫️' },
    { id: 'ccd', name: '4. مستشعر الصور وحساس التتبع', desc: 'تستخدم أنظمة التتبع الآلي 3D حساسات CCD لاكتشاف البؤبؤ في الأبعاد (X, Y, Z) وضبط الجهاز تلقائيًا.', icon: '📸' },
    { id: 'joy', name: '5. عصا التحكم (Joystick)', desc: 'واجهة المستخدم الميكانيكية للطبيب. تتحرك في 3 اتجاهات، وتم استبدالها في الأجهزة الحديثة بشاشات لمس تدير المحركات.', icon: '🕹️' }
];

const receiptDataDB = {
    'meas': { t: "القياسات الفردية (Measurements)", d: "يقوم الجهاز بأخذ 3 قراءات سريعة جدًا للعين الواحدة. لماذا؟ لأن العين البشرية تتحرك بشكل مجهري دائمًا (Micro-saccades)، وقد يتغير التركيز أو ترمش العين. أخذ عدة قراءات يضمن دقة إحصائية لتشخيص الخطأ الانكساري." },
    'meas_err': { t: "قراءة مع نسبة خطأ", d: "لاحظ كيف أن هذه القراءة تختلف قليلًا عن البقية، وتم تظليلها أو تجاهلها. الجهاز ذكي بما يكفي لمعرفة أن المريض رمش أو تحرك خلال هذا الجزء من الثانية، فقام بتخفيض وزن هذه القراءة (Reliability Index)." },
    'avg': { t: "المتوسط الحسابي (Average - AVG)", d: "هذا هو السطر الأهم للطبيب! يقوم المعالج الدقيق بجمع القراءات الصالحة وقسمتها رياضيًا لاستخراج الرقم الأكثر استقرارًا وموثوقية الذي سيبنى عليه التشخيص الفعلي للمريض." },
    'se': { t: "المكافئ الكروي (Spherical Equivalent)", d: "معادلة رياضية بسيطة: SPH + (CYL/2). تُستخدم لتبسيط الوصفة إذا أراد المريض ارتداء عدسات لاصقة كروية عادية لا تصحح الاستجماتيزم، أو تُستخدم في الأبحاث لتقييم الضعف العام للرؤية." },
    'k1': { t: "انحناء القرنية (R1 / Flat K)", d: "القياس المسطح لمنحنى القرنية (مثل سطح الملعقة من الخلف). الرقم 7.80mm يمثل نصف قطر الانحناء. كلما صغر الرقم بالمليمتر، زادت قوة تحدب القرنية (يعبر عنه بالديوبتر 43.25D)." },
    'k2': { t: "انحناء القرنية (R2 / Steep K)", d: "القياس المنحدر (الأكثر تقوسًا). يتم قياسه في زاوية عمودية على K1 (لاحظ الـ AX 90 مقابل 180). هذا الاختلاف في التقوس بين المحورين هو ما يخلق الاستجماتيزم القرني في العين." },
    'cylk': { t: "الاستجماتيزم القرني (Corneal CYL)", d: "هو ببساطة ناتج الطرح بين K2 و K1. يخبرنا هذا الرقم بمقدار التشوه الموجود <span class='text-amber-400 font-bold'>في القرنية فقط</span>. إذا كان هذا الرقم مختلفًا عن الـ CYL الكلي، فهذا يعني أن المشكلة في عدسة العين الداخلية!" },
    'pd': { t: "المسافة الحدقية (Pupillary Distance)", d: "المسافة بالمليمتر بين مركز بؤبؤ العين اليمنى واليسرى. معلومة حيوية لفني البصريات (Optician) لكي يقوم بوضع مركز عدسة النظارة البلاستيكية تمامًا أمام بؤبؤك، وإلا ستصاب بصداع وحول!" }
};
// === MODULE: HISTORY DB (EPIC NARRATIVE) ===
const historyDB = {
    'scheiner': {
        year: "YEAR 1619", title: "مبدأ شاينر: البذرة الأولى للانكسار الموضوعي",
        media: `<div class="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-800 to-black relative overflow-hidden">
                    <div class="w-32 h-32 rounded-full border-4 border-cyan-500 flex items-center justify-center relative animate-pulse shadow-[0_0_20px_#00f0ff]">
                        <div class="w-4 h-4 bg-red-500 rounded-full absolute left-4 shadow-[0_0_15px_red]"></div>
                        <div class="w-4 h-4 bg-red-500 rounded-full absolute right-4 shadow-[0_0_15px_red]"></div>
                    </div>
                    <p class="text-slate-400 mt-6 font-mono text-sm tracking-widest">[SIMULATION: DOUBLE PINHOLE PHASE SHIFT]</p>
                </div>`,
        caption: "انقسام حزم الضوء يثبت وجود خطأ انكساري في العين.",
        content: `
            <div class="mb-6"><strong class="text-cyan-400 block mb-2 text-xl">العقدة التاريخية:</strong>
            في القرن السابع عشر، لم تكن هناك طريقة علمية لقياس "مدى سوء" رؤية الشخص سوى التجربة والخطأ. أراد الفلكي كريستوف شاينر فهم كيفية تركيز العين للضوء بصورة دقيقة.</div>
            
            <div class="mb-6"><strong class="text-amber-400 block mb-2 text-xl">التجربة والاكتشاف الجوهري:</strong>
            صنع شاينر قرصًا معتمًا يحتوي على ثقبين صغيرين متقاربين جدًا. عندما ينظر المريض عبرهما إلى مصدر ضوئي نقطي: إذا كانت عينه سليمة، تتجمع الأشعة في نقطة واحدة على الشبكية. أما إذا كان يعاني من قصر/طول نظر، فستسقط الأشعة في مكانين مختلفين، وسيرى المريض "نقطتين".</div>
            
            <div class="bg-purple-900/20 p-5 rounded-xl border border-purple-500/50 shadow-inner">
                <strong class="text-purple-400 text-lg block mb-2">الربط الهندسي بـ Auto-Refractor:</strong>
                هذا المبدأ البدائي هو حرفيًا ما يفعله الجهاز اليوم! الجهاز يسقط حزمتين منفصلتين من الأشعة تحت الحمراء، وبدلاً من سؤال المريض "هل ترى نقطتين؟"، تقوم المستشعرات الإلكترونية بتصوير انزياح الطور (Phase Shift) وحسابه بالديوبتر في أجزاء من الثانية.
            </div>`
    },
    'porterfield': {
        year: "YEAR 1759", title: "أبتوميتر ويليام بورترفيلد ومبدأ بادال",
        media: `<div class="w-full h-full flex flex-col items-center justify-center bg-black relative overflow-hidden">
                    <div class="w-full h-1 bg-cyan-500/30 absolute top-1/2"></div>
                    <div class="w-12 h-28 border-[3px] border-cyan-400 rounded-[50%] bg-cyan-900/30 backdrop-blur-md relative animate-[pulse_3s_infinite] shadow-[0_0_20px_#00f0ff]"></div>
                    <p class="text-slate-400 mt-10 font-mono text-sm tracking-widest">[OPTICAL RAIL: BADAL LENS SYSTEM]</p>
                </div>`,
        caption: "تطبيق مبدأ بادال لتحريك الهدف بصرياً دون تغيير العدسات.",
        content: `
            <div class="mb-6"><strong class="text-cyan-400 block mb-2 text-xl">المشكلة الهندسية:</strong>
            في الفحوصات القديمة، لتغيير القوة الانكسارية، كان يجب تغيير العدسات الزجاجية باستمرار أمام عين المريض، مما يجعل الأجهزة ضخمة، ميكانيكية، ومزعجة.</div>
            
            <div class="mb-6"><strong class="text-amber-400 block mb-2 text-xl">الابتكار (Badal Principle):</strong>
            استخدم بورترفيلد (ومن بعده بادال) عدسة متقاربة (Positive Lens) توضع على مسافة تعادل بعدها البؤري من العين. العبقرية هنا أنك تستطيع تغيير "القوة البصرية" المسلطة على العين بسلاسة متناهية بمجرد إزاحة الهدف البصري (Target) للأمام أو للخلف على مسار مستقيم.</div>
            
            <div class="bg-purple-900/20 p-5 rounded-xl border border-purple-500/50 shadow-inner">
                <strong class="text-purple-400 text-lg block mb-2">التطبيق الميكاترونيكي اليوم:</strong>
                بدون مبدأ بادال، لم يكن لنظام التضبيب (Auto-Fogging) أن يوجد! المحركات الدقيقة (Stepper Motors) داخل جهازنا تقوم بتحريك صورة "المنطاد" على مسار بصري محسوب بدقة لإرخاء عين المريض قبل القياس.
            </div>`
    },
    'helmholtz': {
        year: "YEAR 1851", title: "هيلمهولتز واختراع الكيراتوميتر",
        media: `<div class="w-full h-full flex flex-col items-center justify-center bg-black relative overflow-hidden">
                    <div class="w-36 h-36 rounded-full border-4 border-dashed border-green-500 animate-[spin_15s_linear_infinite] opacity-50"></div>
                    <div class="w-28 h-28 rounded-full border-4 border-green-400 absolute shadow-[0_0_25px_#39ff14]"></div>
                    <p class="text-green-400 mt-6 font-mono text-sm absolute bottom-4 tracking-widest">[CORNEAL REFLECTION ANALYSIS]</p>
                </div>`,
        caption: "استخدام القرنية كمرآة محدبة لحساب نصف قطر التكور.",
        content: `
            <div class="mb-6"><strong class="text-cyan-400 block mb-2 text-xl">التحدي التشريحي:</strong>
            لم يكن قصر وطول النظر هما المشكلة الوحيدة، بل "الاستجماتيزم" (اللابؤرية). لمعالجته، كان لا بد من إيجاد طريقة لقياس تشوه السطح الأمامي للقرنية (Cornea)، والتي تعتبر أقوى عدسة في العين.</div>
            
            <div class="mb-6"><strong class="text-amber-400 block mb-2 text-xl">الحل الفيزيائي:</strong>
            أدرك هيرمان فون هيلمهولتز أن القرنية تعمل كـ "مرآة محدبة". إذا قمنا بإسقاط أشكال مضيئة بحجم معروف عليها، وقسنا حجم الانعكاس، يمكننا حساب نصف قطر التكور (Radius of Curvature) بدقة بالغة.</div>
            
            <div class="bg-purple-900/20 p-5 rounded-xl border border-purple-500/50 shadow-inner">
                <strong class="text-purple-400 text-lg block mb-2">تطور المنظومة:</strong>
                ابتكار هيلمهولتز قفز إلى بُعد جديد في الأجهزة الأوتوماتيكية اليوم باستخدام (حلقات بلاسيدو)، حيث تقوم الخوارزميات بالتقاط آلاف النقاط من الانعكاس لتحليل المنطقة المركزية (3 ملم) بدقة كافية لتجهيز العدسات اللاصقة المعقدة.
            </div>`
    },
    'collins': {
        year: "YEAR 1937", title: "جيفري كولينز: براءة اختراع المقياس الإلكتروني",
        media: `<div class="w-full h-full flex flex-col items-center justify-center bg-black relative overflow-hidden">
                    <div class="w-full h-full absolute opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                    <div class="flex items-center gap-4 z-10">
                        <div class="w-8 h-8 bg-red-600 rounded-full animate-ping"></div>
                        <div class="h-1 w-24 bg-red-500 shadow-[0_0_15px_red]"></div>
                        <div class="w-16 h-16 border-2 border-red-500 flex items-center justify-center font-mono text-red-500">SENSOR</div>
                    </div>
                    <p class="text-red-500 mt-6 font-mono text-sm z-10 tracking-widest">[INFRARED ELECTRO-OPTICS]</p>
                </div>`,
        caption: "الانتقال من الميكانيكا البصرية إلى الإلكترونيات.",
        content: `
            <div class="mb-6"><strong class="text-cyan-400 block mb-2 text-xl">عصر الإلكترونيات البصرية:</strong>
            قبل عام 1937، كانت جميع أجهزة قياس النظر يدوية وتعتمد على ملاحظة الطبيب وتفاعل المريض. كانت عملية بطيئة ومعرضة للخطأ البشري بشكل كبير.</div>
            
            <div class="mb-6"><strong class="text-amber-400 block mb-2 text-xl">الرؤية المستقبلية:</strong>
            قدم "جيفري كولينز" براءة اختراع لأول تصور لجهاز قياس انكسار يعتمد على الدوائر الإلكترونية. الأهم من ذلك، اقترح استخدام "الأشعة تحت الحمراء" (Infrared) بدلًا من الضوء المرئي حتى لا ينزعج المريض أو يتقلص بؤبؤ عينه أثناء الفحص.</div>
            
            <div class="bg-purple-900/20 p-5 rounded-xl border border-purple-500/50 shadow-inner">
                <strong class="text-purple-400 text-lg block mb-2">النقطة المفصلية:</strong>
                رغم أن التكنولوجيا في الثلاثينيات لم تكن متقدمة بما يكفي لصناعة الجهاز بكفاءة، إلا أن هذه الفكرة هي الأساس الذي بنيت عليه جميع أجهزة (Auto-Refractometer) الحديثة التي تستخدم ثنائيات الـ IR.
            </div>`
    },
    'nasa': {
        year: "THE 1960s", title: "وكالة ناسا: أزمة الطيارين وتطوير الـ Tracking",
        media: `<div class="w-full h-full flex flex-col items-center justify-center bg-black relative overflow-hidden">
                    <div class="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')]"></div>
                    <div class="w-48 h-48 border-2 border-green-500 rounded-full flex items-center justify-center relative shadow-[0_0_30px_rgba(57,255,20,0.2)]">
                        <div class="w-full h-1 bg-green-500 absolute animate-[spin_1.5s_linear_infinite]"></div>
                        <div class="w-12 h-12 bg-green-400/40 rounded-full animate-pulse"></div>
                    </div>
                    <p class="text-green-500 mt-6 font-mono text-sm z-10 tracking-widest">[DYNAMIC EYE TRACKING SYSTEM]</p>
                </div>`,
        caption: "الضرورة العسكرية تخلق تقنيات التتبع المتقدمة.",
        content: `
            <div class="mb-6"><strong class="text-cyan-400 block mb-2 text-xl">تهديد قاتل في السماء (Empty Field Myopia):</strong>
            خلال سباق الفضاء والحرب الباردة، واجهت (NASA) والجيش الأمريكي ظاهرة مرعبة: عندما يطير الطيار في سماء زرقاء فارغة لا تحتوي على تفاصيل للتركيز عليها، ترتخي عدسة العين وتصاب بقصر نظر مؤقت، مما يمنعهم من رؤية الطائرات أو المخاطر البعيدة!</div>
            
            <div class="mb-6"><strong class="text-amber-400 block mb-2 text-xl">تمويل الحل العبقري:</strong>
            احتاجت ناسا لابتكار قادر على قياس تكيف عين الطيار (Accommodation) بشكل مستمر، ديناميكي، وبدون تدخله. فمولت أبحاثًا لابتكار أوائل الـ (Optometers) التي تعمل بالأشعة تحت الحمراء مع أنظمة تتبع حركة العين (Eye-tracking).</div>
            
            <div class="bg-purple-900/20 p-5 rounded-xl border border-purple-500/50 shadow-inner">
                <strong class="text-purple-400 text-lg block mb-2">ثمرة الفضاء في العيادات:</strong>
                هذه الأجهزة العسكرية كانت بحجم خزانة! لكن بفضل تصغير الشرائح الإلكترونية (Microprocessors)، انتقلت هذه التقنيات المعقدة للعيادات، لتمنح أجهزتنا الحديثة قدرة التتبع الآلي 3D وتعويض حركة رأس المريض بالملي ثانية.
            </div>`
    },
    'wavefront': {
        year: "YEAR 2000+", title: "Shack-Hartmann: الانتقال من الأرقام إلى الخرائط",
        media: `<div class="w-full h-full flex flex-col items-center justify-center bg-black relative overflow-hidden perspective-1000">
                    <div class="grid grid-cols-6 gap-2 transform rotate-x-45 animate-pulse">
                        ${Array(36).fill('<div class="w-4 h-4 bg-cyan-500 rounded-full shadow-[0_0_12px_#00f0ff]"></div>').join('')}
                    </div>
                    <p class="text-cyan-400 mt-10 font-mono text-sm z-10 tracking-widest">[MICRO-LENSLET ARRAY MATRIX]</p>
                </div>`,
        caption: "تقسيم جبهة الموجة لاستخراج التشوهات البصرية المتقدمة.",
        content: `
            <div class="mb-6"><strong class="text-cyan-400 block mb-2 text-xl">تكنولوجيا الفضاء لطب العيون:</strong>
            تم ابتكار تقنية (Shack-Hartmann) أصلاً لعلماء الفلك لمراقبة النجوم عبر الغلاف الجوي المضطرب (Adaptive Optics). في العقد الأول من الألفية، قام مهندسو البصريات الطبية بتوجيه هذه التكنولوجيا الدقيقة نحو العين البشرية.</div>
            
            <div class="mb-6"><strong class="text-amber-400 block mb-2 text-xl">نقلة نوعية في القياس:</strong>
            القياسات القديمة كانت تخرج برقمين فقط (قصر/طول، واستجماتيزم). أما هذه التقنية فتستخدم مصفوفة من العدسات المجهرية (Lenslets) لتقسيم الضوء المرتد من الشبكية إلى مئات النقاط الفردية، وحساب انزياح كل نقطة لإنشاء خريطة ثلاثية الأبعاد للتشوهات.</div>
            
            <div class="bg-purple-900/20 p-5 rounded-xl border border-purple-500/50 shadow-inner">
                <strong class="text-purple-400 text-lg block mb-2">عهد ما قبل عمليات الليزك:</strong>
                بفضل هذا الابتكار، لم يعد جهاز Auto-Refractor أداة فحص أولية فقط، بل أصبح الجهاز الذي يوفر "البصمة البصرية" للعين، والتي تُغذي لاحقًا روبوتات الليزر لإجراء عمليات (Custom LASIK) فائقة الدقة لعلاج الانحرافات المعقدة.
            </div>`
    }
};
