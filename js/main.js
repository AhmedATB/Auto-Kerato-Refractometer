let currentActiveSim = null;

function nav(secId, e) {
    // إخفاء كل الأقسام
    document.querySelectorAll('.content-sec').forEach(el => el.classList.add('hidden'));
    document.getElementById(secId).classList.remove('hidden');
    
    // تحديث الأزرار
    document.querySelectorAll('.nav-btn').forEach(btn => { 
        btn.classList.remove('active'); 
        btn.classList.add('text-slate-300'); 
    });
    
    if(e) {
        e.currentTarget.classList.add('active'); 
        e.currentTarget.classList.remove('text-slate-300');
    }

    // إيقاف المحاكي السابق لتوفير استهلاك المعالج
    if(currentActiveSim && currentActiveSim.stop) currentActiveSim.stop();

    // تشغيل المحاكي الجديد المرتبط بالقسم
    if(secId === 'sec-sim-light') { if(!simLight.initialized) simLight.init(); simLight.start(); currentActiveSim = simLight; }
    if(secId === 'sec-sim-optics') { if(!simOptics.initialized) simOptics.init(); simOptics.start(); currentActiveSim = simOptics; }
    if(secId === 'sec-sim-kerato') { if(!simMires.initialized) simMires.init(); simMires.start(); currentActiveSim = simMires; }
    if(secId === 'sec-sim-ai') { if(!simAI.initialized) simAI.init(); simAI.start(); currentActiveSim = simAI; }
}

// دالة عرض الوصل الطبي (تم إرجاع التصميم الفخم المفقود)
function showReceiptDesc(key) {
    const data = receiptDataDB[key];
    const exp = document.getElementById('receipt-explainer');
    
    exp.innerHTML = `
        <div class="text-5xl mb-4 text-cyan-400 drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]">📊</div>
        <h3 class="text-3xl font-bold text-white mb-4 border-b border-slate-700 pb-2">${data.t}</h3>
        <p class="text-slate-300 text-lg leading-relaxed">${data.d}</p>
        <div class="mt-6 bg-black p-4 rounded text-sm text-cyan-500 font-mono border border-cyan-900 border-l-4 border-l-cyan-500 shadow-inner">
            [DSP CORE ENGAGED]: MATRIX CALCULATION COMPLETED IN < 0.08ms.
        </div>
    `;
}

// تهيئة العناصر عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
    
    const compList = document.getElementById('component-list');
    const compDisplay = document.getElementById('component-display');
    
    // توليد المكونات (تم إرجاع التصميم الفخم وتفعيل MathJax)
    componentsDB.forEach(comp => {
        const div = document.createElement('div');
        div.className = "bg-slate-800/80 p-4 rounded-xl border border-slate-700 hover:border-purple-500 cursor-pointer transition transform hover:-translate-x-2 backdrop-blur-sm";
        div.innerHTML = `<h4 class="font-bold text-white flex items-center"><span class="mr-2 text-xl drop-shadow-[0_0_8px_rgba(157,0,255,0.8)]">${comp.icon}</span> ${comp.name}</h4>`;
        
        div.onclick = () => {
            Array.from(compList.children).forEach(child => child.classList.replace('border-purple-500', 'border-slate-700'));
            div.classList.replace('border-slate-700', 'border-purple-500');
            
            compDisplay.innerHTML = `
                <div class="text-7xl mb-4 animate-pulse drop-shadow-[0_0_20px_rgba(0,240,255,0.8)]">${comp.icon}</div>
                <h3 class="text-3xl font-black text-cyan-400 mb-4 border-b border-cyan-900 pb-2 inline-block">${comp.name}</h3>
                <p class="text-slate-300 text-lg leading-relaxed max-w-lg mx-auto bg-black/60 p-6 rounded-xl border border-slate-800 shadow-inner">${comp.desc}</p>
                <div class="mt-6 text-sm text-cyan-500 font-mono bg-cyan-900/10 p-2 rounded w-fit mx-auto border border-cyan-500/30">MODULE STATUS: ACTIVE & CALIBRATED</div>
            `;
            
            // إعادة تشغيل مكتبة المعادلات الرياضية برمجياً بعد الحقن
            if (window.MathJax) { MathJax.typesetPromise([compDisplay]); }
        };
        
        compList.appendChild(div);
    });

    // إخفاء شاشة التحميل وبدء القسم الأول
    setTimeout(() => {
        document.getElementById('loading-overlay').classList.add('hidden');
        nav('sec-intro', null);
        document.querySelector('.nav-btn').classList.add('active'); // تفعيل أول زر
    }, 800);
});
