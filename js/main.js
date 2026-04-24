let currentActiveSim = null;

function nav(secId, e) {
    document.querySelectorAll('.content-sec').forEach(el => el.classList.add('hidden'));
    document.getElementById(secId).classList.remove('hidden');
    
    document.querySelectorAll('.nav-btn').forEach(btn => { 
        btn.classList.remove('active'); 
        btn.classList.add('text-slate-300'); 
    });
    if(e) {
        e.currentTarget.classList.add('active'); 
        e.currentTarget.classList.remove('text-slate-300');
    }

    if(currentActiveSim && currentActiveSim.stop) currentActiveSim.stop();

    if(secId === 'sec-sim-light') { if(!simLight.initialized) simLight.init(); simLight.start(); currentActiveSim = simLight; }
    if(secId === 'sec-sim-optics') { if(!simOptics.initialized) simOptics.init(); simOptics.start(); currentActiveSim = simOptics; }
    if(secId === 'sec-sim-kerato') { if(!simMires.initialized) simMires.init(); simMires.start(); currentActiveSim = simMires; }
    if(secId === 'sec-sim-ai') { if(!simAI.initialized) simAI.init(); simAI.start(); currentActiveSim = simAI; }
}

function showReceiptDesc(key) {
    const data = receiptDataDB[key];
    document.getElementById('receipt-explainer').innerHTML = `<h3 class="text-2xl font-bold text-cyan-400 mb-4">${data}</h3>`;
}

// تهيئة العناصر عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
    // توليد المكونات
    const compList = document.getElementById('component-list');
    const compDisplay = document.getElementById('component-display');
    componentsDB.forEach(comp => {
        const div = document.createElement('div');
        div.className = "bg-slate-800/80 p-4 rounded-xl border border-slate-700 hover:border-purple-500 cursor-pointer transition transform hover:-translate-x-2 backdrop-blur-sm";
        div.innerHTML = `<h4 class="font-bold text-white flex items-center"><span class="mr-2 text-xl">${comp.icon}</span> ${comp.name}</h4>`;
        div.onclick = () => {
            Array.from(compList.children).forEach(child => child.classList.replace('border-purple-500', 'border-slate-700'));
            div.classList.replace('border-slate-700', 'border-purple-500');
            compDisplay.innerHTML = `<div class="text-7xl mb-4 animate-pulse">${comp.icon}</div><h3 class="text-3xl font-black text-cyan-400 mb-4">${comp.name}</h3><p class="text-slate-300">${comp.desc}</p>`;
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
