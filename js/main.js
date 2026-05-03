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
// 4. نظام الإقلاع السينمائي (Cinematic Boot)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const bootLines = [
        "BME KERNEL v3.0 LOADED. SECURE BOOT INITIATED...",
        "MOUNTING OPTICAL SENSORS [CCD: OK, SLD: OK]...",
        "CALIBRATING STEPPER MOTORS (X: 0, Y: 0, Z: 0)...",
        "LOADING PLACIDO RING ALGORITHMS...",
        "ESTABLISHING NEURAL TRACKING LINK...",
        "SYSTEM DIAGNOSTICS: ALL SYSTEMS NOMINAL.",
        "LAUNCHING CLINICAL INTERFACE..."
    ];
    
    const bootText = document.getElementById('boot-text');
    const bootProgress = document.getElementById('boot-progress');
    const overlay = document.getElementById('loading-overlay');
    
    let currentLine = 0;
    
    function typeLine() {
        if (currentLine < bootLines.length && bootText) {
            bootText.innerHTML += `<div class="mb-1">> ${bootLines[currentLine]}</div>`;
            bootProgress.style.width = `${((currentLine + 1) / bootLines.length) * 100}%`;
            currentLine++;
            setTimeout(typeLine, 300 + Math.random() * 300); // سرعة إقلاع ديناميكية
        } else if (overlay) {
            // إنهاء الإقلاع وفتح الشاشة الرئيسية
            setTimeout(() => {
                overlay.style.opacity = '0';
                setTimeout(() => {
                    overlay.remove();
                    // تفعيل التاب الأول برمجياً بعد الإقلاع
                    const firstBtn = document.querySelector('.nav-btn');
                    if(firstBtn) firstBtn.click();
                }, 1000);
            }, 600);
        }
    }
    
    // بدء الإقلاع
    if(overlay) setTimeout(typeLine, 500);
    
    // التهيئة الصامتة للمحاكيات في الخلفية
    if(typeof simOptics !== 'undefined') simOptics.init();
    if(typeof simLight !== 'undefined') simLight.init();
    if(typeof simMires !== 'undefined') simMires.init();
    if(typeof simAI !== 'undefined') simAI.init();
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
// نظام التشريح الهندسي (Interactive Hotspots)
// ==========================================
const componentsData = {
    'sld': {
        icon: '💡', title: 'مصدر الانبعاث (SLD - 840nm)', color: 'cyan',
        eng: 'توليد حزمة ضوئية تحت حمراء (Near-IR). يتميز الـ SLD بأنه يجمع بين التوجيه الدقيق لليزر (Coherence) والأمان العالي لمصابيح الـ LED، مما يمنع تكوّن ضوضاء الشوشرة (Speckle Noise) على الصورة النهائية.',
        clin: 'الطول الموجي 840nm غير مرئي للعين البشرية، فلا يتسبب بتقلص بؤبؤ المريض بسبب الوهج المزعج، كما أنه قادر على اختراق عتامة المياه البيضاء (Cataract) بكفاءة عالية.'
    },
    'optics': {
        icon: '🔭', title: 'المسار البصري والمرايا (Optics)', color: 'amber',
        eng: 'مجموعة معقدة من المنشورات (Prisms) ومقسمات الأشعة (Beam Splitters). تحتوي على محرك خطي دقيق (Stepper Motor) يتحرك لسحب العدسة وإبعاد الهدف البصري إلى المالانهاية.',
        clin: 'هذا النظام الميكانيكي مسؤول عن عملية الـ (Auto-fogging). بدونه، سيقوم دماغ المريض بالتركيز على الجهاز القريب، مما يسبب تشنجاً في العضلة الهدبية وقراءة قصر نظر كاذب.'
    },
    'sensor': {
        icon: '📸', title: 'نظام الالتقاط (CCD Sensor)', color: 'purple',
        eng: 'مستشعر كاميرا عالي الحساسية مصمم خصيصاً لالتقاط الطيف تحت الأحمر (IR). يقوم بتحويل الفوتونات المرتدة من شبكية العين وتضاريس القرنية إلى إشارات كهربائية رقمية.',
        clin: 'دقة هذا الحساس تحدد قدرة الجهاز على القياس في ظروف الإضاءة الصعبة. يتم رفع كسب الحساس (Gain) إلكترونياً لالتقاط أضعف الإشارات العائدة من العيون المريضة.'
    },
    'dsp': {
        icon: '🧠', title: 'المعالج المركزي (DSP Engine)', color: 'green',
        eng: 'معالج إشارات رقمية (Digital Signal Processor). يستلم الصورة من الـ CCD، ويطبق خوارزميات كشف الحواف (Edge Detection) ومصفوفات فورير لحساب زوايا الانكسار بدقة المايكرون.',
        clin: 'هو المترجم الفوري. يحول التشوهات الفيزيائية لدوائر الضوء إلى أرقام طبية مفهومة (SPH, CYL, AXIS)، ويرسم الخرائط الحرارية (Heatmaps) لاكتشاف الأمراض كالقرنية المخروطية.'
    }
};

function showComponent(id, btnElement) {
    const data = componentsData[id];
    const panel = document.getElementById('comp-panel');
    
    // تصفير كل النقاط (إرجاعها للون الرصاصي)
    document.querySelectorAll('.hotspot-btn').forEach(btn => {
        btn.classList.add('opacity-60');
        btn.querySelector('span:nth-child(1)').className = 'absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-0 group-hover:opacity-30 group-hover:animate-ping transition-all';
        btn.querySelector('span:nth-child(2)').className = 'relative inline-flex rounded-full h-5 w-5 md:h-6 md:w-6 bg-slate-500 border-2 border-white shadow-[0_0_10px_#94a3b8] items-center justify-center text-[10px] text-white font-bold transition-all';
    });

    // تفعيل النقطة المضغوطة (إضاءتها حسب لونها)
    btnElement.classList.remove('opacity-60');
    const colorClasses = {
        'cyan': { ping: 'bg-cyan-400 opacity-30 animate-ping', core: 'bg-cyan-500 shadow-[0_0_15px_#00f0ff] text-black' },
        'amber': { ping: 'bg-amber-400 opacity-30 animate-ping', core: 'bg-amber-500 shadow-[0_0_15px_#f59e0b] text-black' },
        'purple': { ping: 'bg-purple-400 opacity-30 animate-ping', core: 'bg-purple-500 shadow-[0_0_15px_#a855f7] text-white' },
        'green': { ping: 'bg-green-400 opacity-30 animate-ping', core: 'bg-green-500 shadow-[0_0_15px_#22c55e] text-black' }
    };
    
    btnElement.querySelector('span:nth-child(1)').className = `absolute inline-flex h-full w-full rounded-full ${colorClasses[data.color].ping}`;
    btnElement.querySelector('span:nth-child(2)').className = `relative inline-flex rounded-full h-5 w-5 md:h-6 md:w-6 border-2 border-white items-center justify-center text-[10px] font-bold ${colorClasses[data.color].core}`;

    // تغيير محتوى اللوحة الجانبية مع تأثير تلاشي
    panel.style.opacity = 0;
    setTimeout(() => {
        document.getElementById('comp-icon').innerText = data.icon;
        document.getElementById('comp-title').innerText = data.title;
        document.getElementById('comp-title').className = `text-xl md:text-2xl font-black text-${data.color}-400`;
        
        // تغيير لون الأيقونة والخط الجانبي
        document.getElementById('comp-icon').className = `w-10 h-10 rounded-lg bg-${data.color}-950 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(var(--tw-colors-${data.color}-500),0.2)]`;
        const indicator = document.getElementById('comp-indicator');
        if(indicator) indicator.className = `absolute -left-4 top-0 w-1 h-full rounded-full hidden lg:block bg-${data.color}-500 shadow-[0_0_15px_var(--tw-colors-${data.color}-500)]`;

        document.getElementById('comp-eng').innerText = data.eng;
        document.getElementById('comp-clin').innerText = data.clin;
        
        panel.style.opacity = 1;
    }, 200);
}
