let currentActiveSim = null;
 
function nav(secId, e) {
    // 1. إخفاء كل الأقسام
    document.querySelectorAll('.content-sec').forEach(el => el.classList.add('hidden'));
    
    // 2. إظهار القسم المطلوب
    const targetSec = document.getElementById(secId);
    if(targetSec) targetSec.classList.remove('hidden');
    
    // 3. تحديث تصميم الأزرار الجانبية
    document.querySelectorAll('.nav-btn').forEach(btn => { 
        btn.classList.remove('active'); 
        btn.classList.add('text-slate-300'); 
    });
    
    if(e && e.currentTarget) {
        e.currentTarget.classList.add('active'); 
        e.currentTarget.classList.remove('text-slate-300');
    }

    // 4. إيقاف المحاكي السابق لتوفير استهلاك المعالج
    if(currentActiveSim && currentActiveSim.stop) {
        currentActiveSim.stop();
    }

    // 5. تشغيل المحاكي الجديد المرتبط بالقسم
    if(secId === 'sec-sim-light' && typeof simLight !== 'undefined') { if(!simLight.initialized) simLight.init(); simLight.start(); currentActiveSim = simLight; }
    if(secId === 'sec-sim-optics' && typeof simOptics !== 'undefined') { if(!simOptics.initialized) simOptics.init(); simOptics.start(); currentActiveSim = simOptics; }
    if(secId === 'sec-sim-kerato' && typeof simMires !== 'undefined') { if(!simMires.initialized) simMires.init(); simMires.start(); currentActiveSim = simMires; }
    if(secId === 'sec-sim-ai' && typeof simAI !== 'undefined') { if(!simAI.initialized) simAI.init(); simAI.start(); currentActiveSim = simAI; }
}

// ==========================================
// MODAL FUNCTIONS (Professor & History)
// ==========================================
function openProf(key) {
    const data = profDB[key];
    if(data) {
        document.getElementById('prof-title').innerText = data.t;
        document.getElementById('prof-text').innerText = data.d;
        document.getElementById('prof-modal').style.opacity = '1';
        document.getElementById('prof-modal').classList.remove('pointer-events-none');
    }
}

function closeProf() { 
    document.getElementById('prof-modal').style.opacity = '0';
    setTimeout(() => document.getElementById('prof-modal').classList.add('pointer-events-none'), 300);
}

function openHistory(key) {
    const data = historyDB[key];
    if(data) {
        document.getElementById('history-year').innerText = data.year; 
        document.getElementById('history-title').innerText = data.title;
        document.getElementById('history-media').innerHTML = data.media; 
        document.getElementById('history-caption').innerText = data.caption;
        document.getElementById('history-content').innerHTML = data.content;
        
        const modal = document.getElementById('history-modal');
        modal.classList.remove('pointer-events-none');
        modal.style.opacity = '1';
    }
}

function closeHistory() {
    const modal = document.getElementById('history-modal');
    modal.style.opacity = '0';
    setTimeout(() => { 
        modal.classList.add('pointer-events-none'); 
        document.getElementById('history-media').innerHTML = ''; 
    }, 300);
}
function openComp(key) {
    const data = componentsDB[key];
    if(data) {
        document.getElementById('comp-modal-title').innerText = data.name;
        document.getElementById('comp-modal-desc').innerHTML = data.desc;
        document.getElementById('comp-modal-icon').innerText = data.icon;
        
        const modal = document.getElementById('comp-modal');
        modal.classList.remove('pointer-events-none');
        modal.style.opacity = '1';
        
        // إعادة معالجة المعادلات الرياضية (MathJax) إن وجدت
        if (window.MathJax) { MathJax.typesetPromise([document.getElementById('comp-modal-desc')]); }
    }
}

function closeComp() {
    const modal = document.getElementById('comp-modal');
    modal.style.opacity = '0';
    setTimeout(() => { modal.classList.add('pointer-events-none'); }, 300);
}

// ==========================================
// PRINTOUT RECEIPT FUNCTION
// ==========================================
function showReceiptDesc(key) {
    const data = receiptDataDB[key];
    const exp = document.getElementById('receipt-explainer');
    if(data && exp) {
        exp.innerHTML = `
            <div class="text-5xl mb-4 text-cyan-400 drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]">📊</div>
            <h3 class="text-3xl font-bold text-white mb-4 border-b border-slate-700 pb-2">${data.t}</h3>
            <p class="text-slate-300 text-lg leading-relaxed">${data.d}</p>
            <div class="mt-6 bg-black p-4 rounded text-sm text-cyan-500 font-mono border border-cyan-900 border-l-4 border-l-cyan-500 shadow-inner">
                [DSP CORE ENGAGED]: MATRIX CALCULATION COMPLETED IN < 0.08ms.
            </div>
        `;
    }
}
    
   // ==========================================
// INITIALIZATION (On Page Load)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    
    // 1. توليد الحالات السريرية (Scenarios)
    const scContainer = document.getElementById('scenarios-container');
    if(scContainer && typeof scenariosDB !== 'undefined') {
        scenariosDB.forEach(sc => {
            scContainer.innerHTML += `
                <div class="bg-slate-800/60 p-6 rounded-xl border border-slate-700 hover:border-cyan-500 hover:shadow-[0_0_20px_rgba(0,240,255,0.2)] transition duration-300 group backdrop-blur-sm">
                    <div class="flex items-center gap-4 mb-4">
                        <div class="text-4xl bg-black w-16 h-16 flex items-center justify-center rounded-full border border-cyan-900 group-hover:scale-110 group-hover:border-cyan-400 transition shadow-inner">${sc.icon}</div>
                        <h3 class="text-xl font-bold text-white group-hover:text-cyan-400 transition">${sc.title}</h3>
                    </div>
                    <p class="text-slate-300 text-sm leading-relaxed border-t border-slate-700 pt-4">${sc.desc}</p>
                </div>
            `;
        });
    }

    // 2. إخفاء شاشة التحميل وبدء القسم الأول
    setTimeout(() => {
        const loader = document.getElementById('loading-overlay');
        if(loader) loader.classList.add('hidden');
        
        nav('sec-intro', null);
        
        // تفعيل لون أول زر يدويًا عند التحميل
        const firstBtn = document.querySelector('.nav-btn');
        if(firstBtn) firstBtn.classList.add('active');
    }, 800);
});
// ==========================================
// KEYBOARD NAVIGATION (Space, ArrowUp, ArrowDown)
// ==========================================
document.addEventListener('keydown', function(event) {
    // التأكد من أن المستخدم لا يكتب داخل مربع نص (إذا وجد)
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.tagName === 'SELECT') {
        return; 
    }

    // المفاتيح المستهدفة
    const keys = ['Space', 'ArrowUp', 'ArrowDown'];
    
    // إذا كان المفتاح المضغوط من ضمن المفاتيح المستهدفة
    if (keys.includes(event.code)) {
        event.preventDefault(); // منع المتصفح من النزول للأسفل افتراضياً

        // جلب كل أزرار القائمة الجانبية
        const navBtns = Array.from(document.querySelectorAll('.nav-btn'));
        if (navBtns.length === 0) return;

        // إيجاد الزر المفعل حالياً
        const activeBtn = document.querySelector('.nav-btn.active');
        let currentIndex = navBtns.indexOf(activeBtn);
        
        let nextIndex = currentIndex;

        // تحديد التاب القادم بناءً على الزر المضغوط
        if (event.code === 'ArrowDown' || event.code === 'Space') {
            // الانتقال للتالي، وإذا وصلنا للنهاية نرجع للبداية (Loop)
            nextIndex = (currentIndex + 1) % navBtns.length;
        } else if (event.code === 'ArrowUp') {
            // الرجوع للسابق، وإذا كنا بالبداية نذهب للنهاية
            nextIndex = (currentIndex - 1 + navBtns.length) % navBtns.length;
        }

        // تفعيل التاب الجديد إذا اختلف عن الحالي
        if (nextIndex !== currentIndex) {
            navBtns[nextIndex].click(); // محاكاة ضغطة الماوس
            
            // عمل Scroll ناعم للقائمة الجانبية حتى يبقى الزر المفعل ظاهر أمامك
            navBtns[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
});
// ==========================================
// 1. CINEMATIC BOOT SEQUENCE (+1000 Aura)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const bootLines = [
        "KERNEL LOADED. INITIALIZING BME SECURE BOOT...",
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
            bootText.innerHTML += `<div>> ${bootLines[currentLine]}</div>`;
            bootProgress.style.width = `${((currentLine + 1) / bootLines.length) * 100}%`;
            currentLine++;
            setTimeout(typeLine, 400 + Math.random() * 400); // تأخير عشوائي لواقعية الآلة
        } else if (overlay) {
            setTimeout(() => {
                overlay.style.opacity = '0';
                setTimeout(() => overlay.remove(), 1000);
            }, 800);
        }
    }
    
    if(overlay) setTimeout(typeLine, 500);
});
