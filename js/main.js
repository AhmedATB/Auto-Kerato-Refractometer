// ==========================================
// AR/AK CLINICAL SYSTEM - MASTER CONTROLLER
// BME (Biomedical Engineering) Edition v3.0
// ==========================================

let currentActiveSim = null;

// ==========================================
// 1. نظام التنقل الذكي (Smart Navigation & Canvas Fix)
// ==========================================
function nav(secId, e) {
    if (e) e.preventDefault();
    
    // 1. إخفاء كل الأقسام وتصفية الأزرار
    document.querySelectorAll('.content-sec').forEach(el => {
        el.classList.add('hidden');
        el.classList.remove('fade-in');
    });
    
    document.querySelectorAll('.nav-btn').forEach(btn => { 
        btn.classList.remove('active', 'text-white', 'bg-slate-800/50'); 
        btn.classList.add('text-slate-300'); 
    });
    
    // 2. إظهار القسم المطلوب مع تأثير انتقال ناعم
    const targetSec = document.getElementById(secId);
    if(targetSec) {
        targetSec.classList.remove('hidden');
        // خدعة برمجية لإعادة تفعيل الأنيميشن
        void targetSec.offsetWidth; 
        targetSec.classList.add('fade-in');
    }
    
    // 3. تفعيل الزر المضغوط (للموبايل واللابتوب)
    if(e && e.currentTarget) {
        e.currentTarget.classList.add('active', 'text-white', 'bg-slate-800/50'); 
        e.currentTarget.classList.remove('text-slate-300');
    }

    // 4. إدارة الذاكرة: إيقاف المحاكي السابق لتوفير استهلاك المعالج (CPU)
    if(currentActiveSim && currentActiveSim.stop) {
        currentActiveSim.stop();
    }

    // 5. إيقاظ المحاكي الجديد وتصحيح أبعاده (Canvas 0x0 Bug Fix)
    setTimeout(() => {
        window.dispatchEvent(new Event('resize')); // إجبار المتصفح على حساب الأبعاد
        
        if(secId === 'sec-sim-light' && typeof simLight !== 'undefined') { 
            if(!simLight.initialized) simLight.init(); 
            simLight.resize(); simLight.start(); currentActiveSim = simLight; 
        }
        if(secId === 'sec-sim-optics' && typeof simOptics !== 'undefined') { 
            if(!simOptics.initialized) simOptics.init(); 
            simOptics.resize(); simOptics.start(); currentActiveSim = simOptics; 
        }
        if(secId === 'sec-sim-kerato' && typeof simMires !== 'undefined') { 
            if(!simMires.initialized) simMires.init(); 
            simMires.resize(); simMires.start(); currentActiveSim = simMires; 
        }
        if(secId === 'sec-sim-ai' && typeof simAI !== 'undefined') { 
            if(!simAI.initialized) simAI.init(); 
            simAI.resize(); simAI.start(); currentActiveSim = simAI; 
        }
    }, 50);
}

// ==========================================
// 2. النوافذ الهندسية المنبثقة (Aura Modals Fixed)
// ==========================================
let typingInterval;

function openComp(id) {
    const modal = document.getElementById('comp-modal');
    const title = document.getElementById('comp-modal-title');
    const desc = document.getElementById('comp-modal-desc');
    const icon = document.getElementById('comp-modal-icon');
    
    // قاعدة بيانات القطع الهندسية (مع الفيزياء الطبية العميقة)
    const data = {
        'sld': { 
            t: 'SLD Source (840nm)', 
            i: '💡', 
            d: '<span class="text-cyan-400 font-bold">الوظيفة:</span> مصدر ضوء فائق النقاء يخترق المياه البيضاء (Cataract).<br><br><span class="text-amber-400 font-bold">الآلية الفيزيائية (Projection):</span><br>يُسقط حلقة ضوئية دقيقة (Ring Target) على شبكية المريض. هذه النقطة المضيئة على الشبكية ستعمل الآن كـ "مصدر ضوء ثانوي" يرتد عائداً نحو الجهاز للقياس.' 
        },
        'fog': { 
            t: 'Auto-Fogging System', 
            i: '🌫️', 
            d: '<span class="text-cyan-400 font-bold">الوظيفة:</span> منع قصر النظر الكاذب (Instrument Myopia).<br><br><span class="text-amber-400 font-bold">الآلية الفسيولوجية (Relaxation):</span><br>نظام ميكانيكي دقيق يدفع الهدف البصري لجعله ضبابياً (Optical Infinity). هذا يكسر استجابة الدماغ للتركيز، مما يُرخي العضلة الهدبية للعين تماماً قبل أخذ القياس.' 
        },
        'ccd': { 
            t: 'CCD Sensor & DSP', 
            i: '📸', 
            d: '<span class="text-cyan-400 font-bold">الوظيفة:</span> حساس الكاميرا والعقل المدبر للجهاز.<br><br><span class="text-amber-400 font-bold">الآلية الفيزيائية (Vergence Analysis):</span><br>يحلل الضوء المرتد من الشبكية؛ إذا كانت العين طبيعية تخرج الأشعة <span class="text-white font-bold">"متوازية"</span>. في قصر النظر تخرج <span class="text-red-400 font-bold">"متجمعة"</span>، وفي طول النظر تخرج <span class="text-red-400 font-bold">"متشتتة"</span>. الـ DSP يقيس زاوية الانحراف ويحولها فورياً إلى قيمة ديوبتر (Diopter).' 
        }
    };
    
    if(data[id]) {
        title.innerText = data[id].t;
        icon.innerText = data[id].i;
        desc.innerHTML = ''; // تصفير النص
        
        modal.classList.remove('opacity-0', 'pointer-events-none');
        clearInterval(typingInterval); // إيقاف أي طباعة سابقة
        
        // تجهيز هيكل العرض (الطباعة + الشرح)
        let terminalText = "> ANALYZING COMPONENT DATA...";
        let i = 0;
        
        desc.innerHTML = `
            <div id="type-cursor" class="text-cyan-500 font-mono text-sm tracking-widest mb-4 h-5"></div>
            <div id="comp-details" class="opacity-0 transition-opacity duration-700 text-slate-300 leading-relaxed border-l-2 border-slate-700 pl-4"></div>
        `;
        
        const cursor = document.getElementById('type-cursor');
        const details = document.getElementById('comp-details');
        
        // تأثير الطباعة لجملة التحليل فقط
        typingInterval = setInterval(() => {
            cursor.innerHTML += terminalText.charAt(i);
            i++;
            if (i >= terminalText.length) {
                clearInterval(typingInterval);
                
                // إضافة وميض بسيط للمؤشر
                cursor.innerHTML += '<span class="animate-pulse">_</span>';
                
                // بعد انتهاء الطباعة، نظهر الشرح العلمي المنسق بتأثير Fade-in
                details.innerHTML = data[id].d;
                setTimeout(() => {
                    details.classList.remove('opacity-0');
                }, 50);
            }
        }, 25); // سرعة الطباعة
    }
}

function closeComp() {
    clearInterval(typingInterval);
    const modal = document.getElementById('comp-modal');
    modal.classList.add('opacity-0', 'pointer-events-none');
}
// ==========================================
// 3. التحكم بالكيبورد (Presentation Mode)
// ==========================================
document.addEventListener('keydown', function(event) {
    // تجاهل الكيبورد إذا كان الدكتور يكتب في مربع نص أو قائمة منسدلة
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT') return; 

    const keys = ['Space', 'ArrowDown', 'ArrowUp'];
    
    if (keys.includes(event.code)) {
        event.preventDefault(); // منع نزول الشاشة
        const navBtns = Array.from(document.querySelectorAll('.nav-btn'));
        if (navBtns.length === 0) return;

        const activeBtn = document.querySelector('.nav-btn.active');
        let currentIndex = navBtns.indexOf(activeBtn);
        let nextIndex = currentIndex;

        if (event.code === 'ArrowDown' || event.code === 'Space') {
            nextIndex = (currentIndex + 1) % navBtns.length;
        } else if (event.code === 'ArrowUp') {
            nextIndex = (currentIndex - 1 + navBtns.length) % navBtns.length;
        }

        if (nextIndex !== currentIndex) {
            navBtns[nextIndex].click(); // محاكاة ضغطة الماوس
            navBtns[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
});

// ==========================================
// شاشة الإقلاع والتحميل (Boot Sequence)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('loading-overlay');
    const bootText = document.getElementById('boot-text');
    const bootProgress = document.getElementById('boot-progress');

    if (overlay && bootText && bootProgress) {
        const bootSequence = [
            "INITIALIZING BME KERNEL...",
            "LOADING DSP ALGORITHMS...",
            "CALIBRATING OPTICAL SENSORS...",
            "SYSTEM READY."
        ];

        let step = 0;
        
        // تغيير النص وزيادة شريط التحميل كل 400 ملي ثانية
        const bootInterval = setInterval(() => {
            if (step < bootSequence.length) {
                bootText.innerText = bootSequence[step];
                bootProgress.style.width = `${(step + 1) * 25}%`;
                step++;
            } else {
                clearInterval(bootInterval);
                // إخفاء الشاشة بسلاسة
                overlay.style.opacity = '0';
                setTimeout(() => {
                    overlay.style.display = 'none';
                }, 1000); // 1000ms هي مدة الـ duration-1000 بالـ HTML
            }
        }, 400); // سرعة التحميل (تقدر تقللها اذا تريدها اسرع)
    }
});
// ==========================================
// نظام عرض التشريح الهندسي (Hardware Anatomy)
// ==========================================
const anatomyData = {
    'emitter': {
        icon: '💡',
        title: 'مصدر الانبعاث (SLD - 840nm)',
        color: 'text-cyan-400',
        eng: 'توليد حزمة ضوئية تحت حمراء (Near-IR). يتميز الـ SLD بأنه يجمع بين التوجيه الدقيق لليزر (Coherence) والأمان العالي لمصابيح الـ LED، مما يمنع تكوّن ضوضاء الشوشرة (Speckle Noise) على الصورة النهائية.',
        clin: 'الطول الموجي 840nm غير مرئي للعين البشرية، فلا يتسبب بتقلص بؤبؤ المريض (Miosis) بسبب الوهج المزعج، كما أنه قادر على اختراق عتامة المياه البيضاء (Cataract) بكفاءة عالية جداً.'
    },
    'optics': {
        icon: '🔭',
        title: 'المسار البصري والتضبيب (Optical Pathway)',
        color: 'text-amber-400',
        eng: 'مجموعة معقدة من المنشورات (Prisms) ومقسمات الأشعة (Beam Splitters). تحتوي على محرك خطي دقيق (Stepper Motor) يتحرك لسحب العدسة وإبعاد الهدف البصري (صورة المنطاد) إلى المالانهاية.',
        clin: 'هذا النظام الميكانيكي مسؤول عن عملية الـ (Auto-fogging). بدونه، سيقوم دماغ المريض بالتركيز على الجهاز القريب، مما يسبب تشنجاً في العضلة الهدبية وقراءة قصر نظر كاذب (Instrument Myopia).'
    },
    'sensor': {
        icon: '📸',
        title: 'نظام الالتقاط (CCD Image Sensor)',
        color: 'text-purple-400',
        eng: 'مستشعر كاميرا عالي الحساسية مصمم خصيصاً لالتقاط الطيف تحت الأحمر (IR). يقوم بتحويل الفوتونات المرتدة من شبكية العين وتضاريس القرنية إلى إشارات كهربائية رقمية.',
        clin: 'دقة هذا الحساس تحدد قدرة الجهاز على القياس في ظروف الإضاءة الصعبة. في (Cataract Mode)، يتم رفع كسب الحساس (Gain) إلكترونياً لالتقاط أضعف الإشارات العائدة من العيون المريضة.'
    },
    'dsp': {
        icon: '🧠',
        title: 'العقل المدبر (DSP & Microprocessor)',
        color: 'text-green-400',
        eng: 'معالج إشارات رقمية (Digital Signal Processor). يستلم الصورة من الـ CCD، ويطبق خوارزميات كشف الحواف (Edge Detection) ومصفوفات فورير (FFT) لحساب زوايا الانكسار وتتبع البؤبؤ بدقة المايكرون.',
        clin: 'هو المترجم الفوري. يحول التشوهات الفيزيائية لدوائر الضوء إلى أرقام طبية مفهومة (SPH, CYL, AXIS)، ويرسم الخرائط الحرارية (Heatmaps) لاكتشاف الأمراض المعقدة كالقرنية المخروطية.'
    }
};

function showAnatomy(id) {
    const contentDiv = document.getElementById('anatomy-content');
    const btns = document.querySelectorAll('.anatomy-btn');
    
    // تصفير الأزرار (إرجاعها للون الرصاصي الباهت)
    btns.forEach(btn => {
        btn.classList.remove('active-anatomy');
        btn.classList.add('opacity-50');
        const iconDiv = btn.querySelector('div');
        iconDiv.className = 'w-14 h-14 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform z-10';
        btn.querySelector('span').classList.replace('text-white', 'text-slate-300');
    });

    // تفعيل الزر المضغوط (إضاءة باللون السماوي)
    const activeBtn = Array.from(btns).find(b => b.getAttribute('onclick').includes(id));
    if(activeBtn) {
        activeBtn.classList.remove('opacity-50');
        activeBtn.classList.add('active-anatomy');
        const activeIcon = activeBtn.querySelector('div');
        activeIcon.className = 'w-14 h-14 rounded-full bg-cyan-950 border-2 border-cyan-500 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(0,240,255,0.4)] z-10';
        activeBtn.querySelector('span').classList.replace('text-slate-300', 'text-white');
    }

    // تأثير اختفاء وظهور للمحتوى
    contentDiv.classList.remove('fade-in');
    contentDiv.style.opacity = 0;
    
    setTimeout(() => {
        const data = anatomyData[id];
        contentDiv.innerHTML = `
            <div class="flex items-center gap-3 mb-4">
                <span class="text-3xl">${data.icon}</span>
                <h3 class="text-2xl font-black ${data.color}">${data.title}</h3>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 class="text-white font-bold mb-2 border-b border-slate-700 pb-1">الوظيفة الهندسية (Engineering)</h4>
                    <p class="text-slate-300 text-sm leading-relaxed">${data.eng}</p>
                </div>
                <div>
                    <h4 class="text-white font-bold mb-2 border-b border-slate-700 pb-1">الميزة السريرية (Clinical)</h4>
                    <p class="text-slate-300 text-sm leading-relaxed flex items-start gap-2">
                        <span class="text-green-400">✓</span>
                        ${data.clin}
                    </p>
                </div>
            </div>
        `;
        contentDiv.style.opacity = 1;
        contentDiv.classList.add('fade-in');
    }, 150);
}

// ==========================================
// 1. بيانات نظام مكونات الجهاز (Dark Theme)
// ==========================================
const componentsData = {
    'sld': {
        icon: '💡', title: 'مصدر الانبعاث (SLD)', color: 'cyan', stage: 'Stage 1: Signal Generation',
        eng: 'توليد حزمة ضوئية تحت حمراء (Near-IR). يتميز الـ SLD بأنه يجمع بين التوجيه الدقيق لليزر والأمان العالي لمصابيح الـ LED، مما يمنع تكوّن ضوضاء الشوشرة على الصورة النهائية.',
        clin: 'الطول الموجي 840nm غير مرئي للعين، فلا يتسبب بتقلص بؤبؤ المريض بسبب الوهج المزعج، ويخترق عتامة المياه البيضاء بكفاءة.'
    },
    'optics': {
        icon: '🔭', title: 'المسار البصري (Optics)', color: 'amber', stage: 'Stage 2: Light Modulation',
        eng: 'مجموعة معقدة من المنشورات ومقسمات الأشعة. تحتوي على محرك خطي دقيق يتحرك ميكانيكياً لسحب العدسة وإبعاد الهدف البصري إلى المالانهاية.',
        clin: 'مسؤول عن الـ (Auto-fogging). بدونه سيركز دماغ المريض على الجهاز القريب، مما يسبب تشنجاً في العضلة الهدبية وقراءة قصر نظر كاذب.'
    },
    'sensor': {
        icon: '📸', title: 'الالتقاط (CCD Sensor)', color: 'purple', stage: 'Stage 3: Data Acquisition',
        eng: 'مستشعر كاميرا عالي الحساسية مصمم خصيصاً لالتقاط الطيف تحت الأحمر (IR). يقوم بتحويل الفوتونات المرتدة من العين إلى إشارات رقمية.',
        clin: 'يتم رفع كسب الحساس (Gain) إلكترونياً لالتقاط أضعف الإشارات العائدة من العيون المريضة بالماء الأبيض.'
    },
    'dsp': {
        icon: '🧠', title: 'المعالج (DSP Engine)', color: 'green', stage: 'Stage 4: Signal Processing',
        eng: 'معالج إشارات رقمية. يستلم الصورة ويطبق خوارزميات كشف الحواف ومصفوفات فورير لحساب زوايا الانكسار بدقة المايكرون.',
        clin: 'المترجم الفوري للمنظومة. يحول التشوهات الفيزيائية إلى أرقام طبية (SPH, CYL) ويرسم الخرائط الحرارية.'
    }
};

// ==========================================
// 2. محرك التقديم (Presentation Engine) 🚀
// ==========================================
let presentationStep = 0; // 0=خارجي, 1=SLD, 2=Optics, 3=Sensor, 4=DSP

function switchComponentView(viewType) {
    const internalView = document.getElementById('view-internal');
    const externalView = document.getElementById('view-external');
    const btnInternal = document.getElementById('tab-internal');
    const btnExternal = document.getElementById('tab-external');

    if(viewType === 'external') {
        presentationStep = 0; // تصفير العداد
        btnExternal.className = "px-8 py-3 rounded-xl font-black text-base md:text-xl transition-all bg-cyan-600 text-black shadow-[0_0_20px_rgba(0,240,255,0.5)]";
        btnInternal.className = "px-8 py-3 rounded-xl font-black text-base md:text-xl transition-all text-slate-400 hover:text-white bg-transparent";
        internalView.style.opacity = 0;
        setTimeout(() => {
            internalView.classList.replace('flex', 'hidden');
            externalView.classList.replace('hidden', 'flex');
            setTimeout(() => externalView.style.opacity = 1, 50);
        }, 300);
    } else {
        presentationStep = 1; // بدأنا بالداخلي
        btnInternal.className = "px-8 py-3 rounded-xl font-black text-base md:text-xl transition-all bg-cyan-600 text-black shadow-[0_0_20px_rgba(0,240,255,0.5)]";
        btnExternal.className = "px-8 py-3 rounded-xl font-black text-base md:text-xl transition-all text-slate-400 hover:text-white bg-transparent";
        externalView.style.opacity = 0;
        setTimeout(() => {
            externalView.classList.replace('flex', 'hidden');
            internalView.classList.replace('hidden', 'flex');
            setTimeout(() => internalView.style.opacity = 1, 50);
        }, 300);
    }
}

function showComponent(id, btnElement) {
    // تحديث الخطوة برمجياً إذا تم الضغط بالماوس
    if(id === 'sld') presentationStep = 1;
    if(id === 'optics') presentationStep = 2;
    if(id === 'sensor') presentationStep = 3;
    if(id === 'dsp') presentationStep = 4;

    const data = componentsData[id];
    const panel = document.getElementById('comp-panel');
    
    document.querySelectorAll('.module-btn').forEach(btn => {
        btn.className = 'module-btn relative z-50 cursor-pointer w-full text-right bg-slate-900 border-2 border-slate-700 p-5 md:p-6 rounded-3xl flex items-center gap-5 transition-all group opacity-70 hover:opacity-100';
        btn.querySelector('div:first-child').className = 'w-16 h-16 rounded-2xl bg-slate-950 border-2 border-slate-700 flex items-center justify-center text-3xl shrink-0 transition-all';
        btn.querySelector('h3').className = 'text-slate-300 group-hover:text-white font-black text-lg md:text-xl transition-all';
        btn.querySelector('div.font-mono').className = 'text-xs md:text-sm font-mono text-slate-400 tracking-widest mb-1 uppercase transition-all';
    });

    const colorClasses = {
        'cyan': 'bg-cyan-950/50 border-cyan-500 shadow-[inset_-6px_0_0_#00f0ff] opacity-100',
        'amber': 'bg-amber-950/50 border-amber-500 shadow-[inset_-6px_0_0_#f59e0b] opacity-100',
        'purple': 'bg-purple-950/50 border-purple-500 shadow-[inset_-6px_0_0_#a855f7] opacity-100',
        'green': 'bg-green-950/50 border-green-500 shadow-[inset_-6px_0_0_#22c55e] opacity-100'
    };
    
    btnElement.className = `module-btn relative z-50 cursor-pointer w-full text-right p-5 md:p-6 rounded-3xl flex items-center gap-5 transition-all group border-2 ${colorClasses[data.color]}`;
    btnElement.querySelector('div:first-child').className = `w-16 h-16 rounded-2xl bg-[#02050f] border-2 border-${data.color}-500 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(var(--tw-colors-${data.color}-500),0.4)] shrink-0`;
    btnElement.querySelector('h3').className = 'text-white font-black text-lg md:text-xl';
    btnElement.querySelector('div.font-mono').className = `text-xs md:text-sm font-mono text-${data.color}-400 font-bold tracking-widest mb-1 uppercase`;

    panel.style.opacity = 0;
    setTimeout(() => {
        document.getElementById('comp-icon').innerText = data.icon;
        document.getElementById('comp-title').innerText = data.title;
        document.getElementById('comp-stage').innerText = data.stage;
        document.getElementById('comp-icon').className = `w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-${data.color}-950 border-2 border-${data.color}-500 flex items-center justify-center text-4xl md:text-5xl shadow-[0_0_30px_rgba(var(--tw-colors-${data.color}-500),0.4)] shrink-0 transition-all`;
        
        const indicator = document.getElementById('comp-indicator');
        if(indicator) indicator.className = `absolute -right-5 top-0 w-1.5 h-full rounded-full hidden lg:block bg-${data.color}-500 shadow-[0_0_20px_rgba(var(--tw-colors-${data.color}-500),1)] transition-all`;
        document.getElementById('comp-glow').className = `absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-${data.color}-900/30 via-transparent to-transparent pointer-events-none`;
        document.getElementById('comp-title').className = `text-3xl md:text-4xl font-black text-${data.color}-400 mb-2`;
        document.getElementById('comp-eng').innerText = data.eng;
        document.getElementById('comp-clin').innerText = data.clin;
        panel.style.opacity = 1;
    }, 200);
}

// ==========================================
// 3. نظام التنقل الذكي للكيبورد (The Magic) 
// ==========================================
document.addEventListener('keydown', function(event) {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT') return; 

    const keys = ['Space', 'ArrowDown', 'ArrowUp'];
    if (keys.includes(event.code)) {
        event.preventDefault(); 

        // 🌟 السحر هنا: التحكم بالسلايد الداخلي لقسم مكونات الجهاز 🌟
        const componentsSection = document.getElementById('sec-components');
        if (componentsSection && componentsSection.classList.contains('block') && (event.code === 'Space' || event.code === 'ArrowDown')) {
            presentationStep++;

            if (presentationStep === 1) {
                switchComponentView('internal');
                setTimeout(() => { document.getElementById('btn-sld').click(); }, 350);
                return; // أوقف الكود هنا حتى لا يعبر للتاب التالي
            } 
            else if (presentationStep === 2) {
                document.getElementById('btn-optics').click();
                return;
            } 
            else if (presentationStep === 3) {
                document.getElementById('btn-sensor').click();
                return;
            } 
            else if (presentationStep === 4) {
                document.getElementById('btn-dsp').click();
                return;
            } 
            else if (presentationStep >= 5) {
                presentationStep = 0; // انتهى الشرح، صفر العداد واسمح للكود بالانتقال للتاب التالي
            }
        }

        // 🌟 التنقل العادي بين التابات 🌟
        const navBtns = Array.from(document.querySelectorAll('.nav-btn'));
        if (navBtns.length === 0) return;

        const activeBtn = document.querySelector('.nav-btn.active');
        let currentIndex = navBtns.indexOf(activeBtn);
        let nextIndex = currentIndex;

        if (event.code === 'ArrowDown' || event.code === 'Space') {
            nextIndex = (currentIndex + 1) % navBtns.length;
        } else if (event.code === 'ArrowUp') {
            nextIndex = (currentIndex - 1 + navBtns.length) % navBtns.length;
            presentationStep = 0; // تصفير العداد للضمان عند الرجوع للخلف
        }

        if (nextIndex !== currentIndex) {
            navBtns[nextIndex].click(); 
            navBtns[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
});

// ==========================================
// شاشة الإقلاع والتحميل (Boot Sequence)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('loading-overlay');
    const bootText = document.getElementById('boot-text');
    const bootProgress = document.getElementById('boot-progress');

    if (overlay && bootText && bootProgress) {
        const bootSequence = [
            "INITIALIZING BME KERNEL...",
            "LOADING DSP ALGORITHMS...",
            "CALIBRATING OPTICAL SENSORS...",
            "SYSTEM READY."
        ];

        let step = 0;
        const bootInterval = setInterval(() => {
            if (step < bootSequence.length) {
                bootText.innerText = bootSequence[step];
                bootProgress.style.width = `${(step + 1) * 25}%`;
                step++;
            } else {
                clearInterval(bootInterval);
                overlay.style.opacity = '0';
                setTimeout(() => {
                    overlay.style.display = 'none';
                }, 1000); 
            }
        }, 400); 
    }
});
