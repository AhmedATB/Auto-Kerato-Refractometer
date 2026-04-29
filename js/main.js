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
