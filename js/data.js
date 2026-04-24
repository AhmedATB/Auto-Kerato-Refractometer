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
// === MODULE: HISTORY DB ===
const historyDB = {
    'scheiner': {
        year: "YEAR 1619", title: "مبدأ شاينر: البداية النظرية",
        media: `<div class="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-800 to-black relative overflow-hidden">
                    <div class="w-32 h-32 rounded-full border-4 border-cyan-500 flex items-center justify-center relative animate-pulse">
                        <div class="w-4 h-4 bg-red-500 rounded-full absolute left-4 shadow-[0_0_10px_red]"></div>
                        <div class="w-4 h-4 bg-red-500 rounded-full absolute right-4 shadow-[0_0_10px_red]"></div>
                    </div>
                    <p class="text-slate-400 mt-4 font-mono text-sm">[Simulation: Double Pinhole Disc]</p>
                </div>`,
        caption: "انقسام حزم الضوء عبر الفتحة المزدوجة.",
        content: `<div><strong class="text-cyan-400 block mb-2">كيف بدأت القصة؟</strong>
            في القرن السابع عشر، كان الفلكي والفيزيائي كريستوف شاينر مهووسًا بفهم كيفية تركيز العين للضوء. قام بصنع قرص معتم بسيط يحتوي على ثقبين صغيرين متقاربين جدًا.</div>
            
            <div><strong class="text-amber-400 block mb-2">التجربة والاكتشاف الجوهري:</strong>
            يطلب من الشخص النظر عبر الثقبين إلى مصدر ضوئي. إذا كانت عينه سليمة تمامًا، ستسقط الأشعة في نقطة واحدة على الشبكية ويرى ضوءًا واحدًا. أما إذا كان يعاني من قصر أو طول نظر، فلن تتركز الأشعة، وسيرى الضوء مزدوجًا (نقطتين)! تحريك الفتحات حتى تلتقي النقطتان يحدد القوة التصحيحية.</div>
            
            <div class="bg-purple-900/20 p-5 rounded-lg border border-purple-500/50 mt-6 shadow-inner">
                <strong class="text-purple-400 text-lg block mb-2">الربط بجهازنا (Auto-Refractor):</strong>
                الأجهزة الحديثة أخذت هذا المبدأ القديم وطبقته آليًا! الجهاز يسقط حزمتين من الأشعة تحت الحمراء، وبدلاً من سؤال المريض "هل ترى نقطة أم نقطتين؟"، تقوم الكاميرا (CCD) بتصوير الشبكية وحساب المسافة بين النقطتين رياضيًا وتحويلها إلى ديوبتر في أجزاء من الثانية.
            </div>`
    },
    'porterfield': {
        year: "YEAR 1759", title: "ويليام بورترفيلد: أول أبتوميتر",
        media: `<div class="w-full h-full flex flex-col items-center justify-center bg-black relative overflow-hidden">
                    <div class="w-full h-1 bg-cyan-500/50 absolute top-1/2"></div>
                    <div class="w-12 h-24 border-2 border-cyan-400 rounded-[50%] bg-cyan-900/30 backdrop-blur-sm relative animate-[pulse_3s_infinite]"></div>
                    <p class="text-slate-400 mt-8 font-mono text-sm">[Badal Principle Simulation]</p>
                </div>`,
        caption: "تطبيق مبدأ بادال لتحريك الهدف.",
        content: `<div><strong class="text-amber-400 block mb-2">الابتكار:</strong>قدم ويليام بورترفيلد مصطلح "الأبتوميتر" (Optometer)، وهو أول جهاز مصمم لتقييم حدود الرؤية البعيدة. اعتمد هذا الجهاز على مبدأ عدسة متقاربة واحدة توضع على مسافة البعد البؤري من العين.</div>
        
        <div><strong class="text-cyan-400 block mb-2">كيف يعمل؟</strong>يسمح هذا التكوين البصري بتغيير القوة البصرية المسلطة على العين بسلاسة من خلال إزاحة الهدف البصري فقط، دون الحاجة لتغيير العدسات، وهو المبدأ الذي نستخدمه اليوم لتضبيب عين المريض (Fogging) والذي يُعرف باسم (Badal Principle).</div>`
    },
    'helmholtz': {
        year: "YEAR 1851", title: "هيلمهولتز وقياس القرنية",
        media: `<div class="w-full h-full flex flex-col items-center justify-center bg-black relative overflow-hidden">
                    <div class="w-32 h-32 rounded-full border-2 border-dashed border-green-500 animate-[spin_10s_linear_infinite]"></div>
                    <div class="w-24 h-24 rounded-full border-2 border-green-400 absolute"></div>
                    <p class="text-green-400 mt-4 font-mono text-sm absolute bottom-4">[Keratometry Reflection]</p>
                </div>`,
        caption: "أول كيراتوميتر لتقييم الاستجماتيزم.",
        content: `<div><strong class="text-purple-400 block mb-2">ثورة السطح الأمامي:</strong>أحدث هيرمان فون هيلمهولتز تحولاً جذريًا في عام 1851 باختراع الكيراتوميتر اليدوي، الذي سمح للأطباء بقياس انحناء السطح الأمامي للقرنية بدقة عالية.</div>
        
        <div><strong class="text-cyan-400 block mb-2">أهمية هذا الابتكار:</strong>كان هذا القياس (والذي يركز تحديداً في المنطقة المركزية البالغة 3 ملم) حجر الزاوية في تشخيص الاستجماتيزم القرني، وفيما بعد أصبح الأساس الفيزيائي لتجهيز وملاءمة العدسات اللاصقة على العيون البشرية.</div>`
    },
    'nasa': {
        year: "THE 1960s", title: "أزمة ناسا وقصر النظر الفراغي",
        media: `<div class="w-full h-full flex flex-col items-center justify-center bg-black relative overflow-hidden">
                    <div class="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')]"></div>
                    <div class="w-40 h-40 border-2 border-green-500 rounded-full flex items-center justify-center relative">
                        <div class="w-full h-1 bg-green-500 absolute animate-[spin_2s_linear_infinite]"></div>
                        <div class="w-8 h-8 bg-green-400/50 rounded-full animate-ping"></div>
                    </div>
                    <p class="text-green-500 mt-4 font-mono text-sm z-10">[RADAR: Tracking Eye Movement]</p>
                </div>`,
        caption: "التتبع الآلي والتكيف اللحظي للطيارين.",
        content: `<div><strong class="text-cyan-400 block mb-2">قصر نظر المجال الفارغ:</strong>خلال الحرب الباردة وبرنامج الفضاء، اكتشفت (NASA) والجيش الأمريكي مشكلة خطيرة تُسمى "Empty Field Myopia". عندما ينظر الطيار في سماء زرقاء فارغة لا تحتوي على تفاصيل، تفقد العين قدرتها على التركيز وتسترخي العضلة وتصاب بقصر نظر مؤقت، مما يمنعهم من رؤية الطائرات المعادية البعيدة!</div>
        
        <div><strong class="text-amber-400 block mb-2">الحل التكنولوجي من ناسا:</strong>احتاجت ناسا لطريقة تراقب تركيز عين الطيار آليًا وبشكل مستمر دون أن تسأله. فقامت بتمويل تطوير أوائل أجهزة "الأوبتومتر" (Optometers) التي تستخدم الأشعة تحت الحمراء لقياس الانكسار ديناميكيًا وحركة العين.</div>
        
        <div class="bg-purple-900/20 p-5 rounded-lg border border-purple-500/50 mt-6 shadow-inner">
                <strong class="text-purple-400 text-lg block mb-2">كيف وصلنا لليوم؟</strong>
                بفضل تطور المعالجات الدقيقة (Microprocessors)، تم ضغط تلك التكنولوجيا العسكرية الفضائية الهائلة إلى شريحة صغيرة توضع داخل جهاز الـ Auto-Refractor المكتبي الذي نراه اليوم في كل عيادة.
        </div>`
    },
    'wavefront': {
        year: "YEAR 2000+", title: "Shack-Hartmann: ثورة التضاريس",
        media: `<div class="w-full h-full flex flex-col items-center justify-center bg-black relative overflow-hidden perspective-1000">
                    <div class="grid grid-cols-5 gap-1 transform rotate-x-45 animate-pulse">
                        ${Array(25).fill('<div class="w-6 h-6 bg-cyan-500/80 rounded-full shadow-[0_0_10px_#00f0ff]"></div>').join('')}
                    </div>
                    <p class="text-cyan-400 mt-8 font-mono text-sm z-10">[Lenslet Array Matrix]</p>
                </div>`,
        caption: "مصفوفة العدسات الدقيقة للتشوهات المعقدة.",
        content: `<div><strong class="text-purple-400 block mb-2">من التلسكوبات إلى العيون:</strong>تقنية (Shack-Hartmann) لم تُخترع للطب، بل صُممت لعلماء الفلك لمراقبة النجوم وإلغاء التشويش الناتج عن الغلاف الجوي الأرضي (Adaptive Optics).</div>
        
        <div><strong class="text-cyan-400 block mb-2">نقلة نوعية في القياس:</strong>في أواخر التسعينيات، أدرك مهندسو الطب الحيوي إمكانية استخدام هذه التقنية للعين. بدلاً من قياس "قصر أو طول النظر" فقط، تقوم هذه التقنية بتقسيم الضوء المرتد من الشبكية إلى مئات النقاط عبر مصفوفة من العدسات المجهرية (Lenslets)، مما يسمح برسم خريطة ثلاثية الأبعاد لاكتشاف التشوهات البصرية المعقدة (Higher-Order Aberrations).</div>`
    }
};
