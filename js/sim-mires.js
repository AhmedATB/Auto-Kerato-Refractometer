// === MODULE: ADVANCED CORNEAL TOPOGRAPHY & MIRES SIMULATOR ===
// BME Premium Edition - Fixed Physics & Clinical Data

const simMires = {
    initialized: false, 
    canvas: document.getElementById('miresCanvas'), 
    ctx: null, 
    time: 0, animId: null, isRunning: false,
    showHeatmap: false, 
    
    init() { 
        this.ctx = this.canvas.getContext('2d'); 
        this.resize(); 
        window.addEventListener('resize', () => { if(this.isRunning) this.resize(); });
        this.initialized = true; 
        this.update(); // استدعاء التحديث فوراً لضبط البيانات
    },
    
    start() { 
        this.isRunning = true; 
        this.animate(); 
    },
    
    stop() { 
        this.isRunning = false; 
        cancelAnimationFrame(this.animId); 
    },
    
    resize() { 
        if(this.canvas.parentElement) {
            this.canvas.width = this.canvas.parentElement.clientWidth; 
            this.canvas.height = this.canvas.parentElement.clientHeight; 
        }
    },
    
    toggleHeatmap(state) {
        this.showHeatmap = state;
        const btnRings = document.getElementById('btn-rings');
        const btnHeat = document.getElementById('btn-heat');
        const heatScale = document.getElementById('heat-scale');
        
        if(state) {
            btnHeat.className = "bg-cyan-500 text-black px-4 py-2 rounded-lg text-xs md:text-sm font-black shadow-lg";
            btnRings.className = "bg-slate-800 text-slate-400 px-4 py-2 rounded-lg text-xs md:text-sm border border-slate-700 font-black";
            if(heatScale) heatScale.classList.remove('hidden');
        } else {
            btnRings.className = "bg-cyan-500 text-black px-4 py-2 rounded-lg text-xs md:text-sm font-black shadow-lg";
            btnHeat.className = "bg-slate-800 text-slate-400 px-4 py-2 rounded-lg text-xs md:text-sm border border-slate-700 font-black";
            if(heatScale) heatScale.classList.add('hidden');
        }
    },

    // تحديث البيانات السريرية والأرقام الجانبية
    update() {
        const type = document.getElementById('corneaSelect').value; 
        const analysisBox = document.getElementById('mire-analysis');
        const hudR1 = document.getElementById('hud-r1'); 
        const hudR2 = document.getElementById('hud-r2');
        const hudWarn = document.getElementById('hud-warning');
        
        if(!hudR1 || !hudR2 || !analysisBox) return; // حماية من أخطاء الـ DOM

        hudWarn.classList.add('hidden');

        // نصوص التحليل مصممة لتتغير مع كل حالة
        if(type === 'normal') {
            hudR1.innerText = "43.00D"; hudR1.className = "text-green-400";
            hudR2.innerText = "43.00D"; hudR2.className = "text-green-400";
            analysisBox.innerHTML = `
                <div class="mb-4"><span class="text-green-400 font-black text-xl">قرنية كروية (Normal)</span></div>
                <p class="text-slate-200 mb-4"><strong class="text-cyan-400">التحليل:</strong> الحلقات دائرية تماماً وبمسافات متساوية، مما يشير إلى انكسار موحد.</p>
                <div class="bg-blue-900/20 p-3 rounded-lg border border-blue-500/30">
                    <span class="text-blue-400 text-sm font-bold">النتيجة: لا يوجد استجماتيزم.</span>
                </div>`;
        }
        else if(type === 'astig_with') {
            hudR1.innerText = "42.50D"; hudR1.className = "text-white";
            hudR2.innerText = "45.00D"; hudR2.className = "text-amber-400 font-bold";
            analysisBox.innerHTML = `
                <div class="mb-4"><span class="text-amber-400 font-black text-xl">مع القاعدة (WTR)</span></div>
                <p class="text-slate-200 mb-4"><strong class="text-cyan-400">التحليل:</strong> انضغاط عمودي للحلقات بسبب زيادة تحدب المحور الرأسي (90°).</p>
                <div class="bg-amber-900/20 p-3 rounded-lg border border-amber-500/30">
                    <span class="text-amber-400 text-sm font-bold">الخريطة: نمط ربطة عنق عمودية حمراء.</span>
                </div>`;
        }
        else if(type === 'astig_against') {
            hudR1.innerText = "45.00D"; hudR1.className = "text-amber-400 font-bold";
            hudR2.innerText = "42.50D"; hudR2.className = "text-white";
            analysisBox.innerHTML = `
                <div class="mb-4"><span class="text-amber-400 font-black text-xl">ضد القاعدة (ATR)</span></div>
                <p class="text-slate-200 mb-4"><strong class="text-cyan-400">التحليل:</strong> انضغاط أفقي للحلقات، المحور الأفقي (180°) هو الأكثر تحدباً.</p>
                <div class="bg-amber-900/20 p-3 rounded-lg border border-amber-500/30">
                    <span class="text-amber-400 text-sm font-bold">الخريطة: نمط ربطة عنق أفقية حمراء.</span>
                </div>`;
        }
        else if(type === 'keratoconus') {
            hudR1.innerText = "52.00D"; hudR1.className = "text-red-500 font-black animate-pulse";
            hudR2.innerText = "58.50D"; hudR2.className = "text-red-500 font-black animate-pulse"; 
            hudWarn.classList.remove('hidden');
            analysisBox.innerHTML = `
                <div class="mb-4"><span class="text-red-500 font-black text-xl">القرنية المخروطية</span></div>
                <p class="text-slate-200 mb-4"><strong class="text-cyan-400">التحليل:</strong> تشوه حلقي شديد وانزياح القمة للأسفل مع تقارب فائق للحلقات.</p>
                <div class="bg-red-900/20 p-3 rounded-lg border border-red-500/30">
                    <span class="text-red-400 text-sm font-bold">الخريطة: بقعة حمراء (Hot Spot) سفلية.</span>
                </div>`;
        }
        else if(type === 'dry_eye') {
            hudR1.innerText = "--.--"; hudR1.className = "text-slate-500";
            hudR2.innerText = "--.--"; hudR2.className = "text-slate-500";
            analysisBox.innerHTML = `
                <div class="mb-4"><span class="text-blue-300 font-black text-xl">جفاف العين</span></div>
                <p class="text-slate-200 mb-4"><strong class="text-cyan-400">التحليل:</strong> تكسر في استمرارية الحلقات بسبب عدم استقرار الفيلم الدمعي.</p>
                <div class="bg-slate-800 p-3 rounded-lg border border-slate-600">
                    <span class="text-slate-400 text-sm font-bold">النتيجة: فشل في تحليل التضاريس.</span>
                </div>`;
        }
    },
    
    animate() {
        if(!this.isRunning) return;
        const c = this.ctx; const w = this.canvas.width; const h = this.canvas.height; 
        const type = document.getElementById('corneaSelect').value;
        this.time += 0.03; 
        
        const cx = (w/2); 
        const cy = (h/2); 

        c.fillStyle = '#02050f'; c.fillRect(0, 0, w, h);
        
        // 1. رسم الخريطة الحرارية (Heatmap)
        if (this.showHeatmap) {
            c.globalCompositeOperation = "screen";
            
            // قاعدة خضراء
            let grd = c.createRadialGradient(cx, cy, 0, cx, cy, 150);
            grd.addColorStop(0, "rgba(0, 255, 0, 0.3)");
            grd.addColorStop(1, "rgba(0, 0, 255, 0.1)");
            c.fillStyle = grd; c.beginPath(); c.arc(cx, cy, 150, 0, Math.PI*2); c.fill();
            
            if (type === 'astig_with' || type === 'astig_against') {
                c.save();
                c.translate(cx, cy);
                // في الحراري: With (90°) تعني عمودي، Against (180°) تعني أفقي
                if (type === 'astig_against') c.rotate(Math.PI / 2);
                
                let bowGrd = c.createRadialGradient(0, 0, 0, 0, 0, 100);
                bowGrd.addColorStop(0, "rgba(255, 0, 0, 0.8)");
                bowGrd.addColorStop(0.6, "rgba(255, 255, 0, 0.4)");
                bowGrd.addColorStop(1, "rgba(0, 0, 0, 0)");
                
                c.scale(0.4, 1.3); // شكل ربطة العنق
                c.fillStyle = bowGrd; c.beginPath(); c.arc(0, 0, 100, 0, Math.PI*2); c.fill();
                c.restore();
            }
            else if (type === 'keratoconus') {
                let coneGrd = c.createRadialGradient(cx, cy + 40, 0, cx, cy + 40, 60);
                coneGrd.addColorStop(0, "rgba(255, 0, 0, 0.9)");
                coneGrd.addColorStop(1, "rgba(0, 0, 0, 0)");
                c.fillStyle = coneGrd; c.beginPath(); c.arc(cx, cy + 40, 60, 0, Math.PI*2); c.fill();
            }
            c.globalCompositeOperation = "source-over";
        } 
        
        // 2. رسم حلقات بلاسيدو (Placido Rings)
        if(!this.showHeatmap || type === 'dry_eye') {
            for(let i=1; i<=8; i++) {
                let baseRadius = i * 20; 
                c.strokeStyle = `rgba(0, 240, 255, ${0.9 - (i*0.08)})`; 
                c.lineWidth = 2.5; 
                c.beginPath();
                
                for(let a=0; a<=Math.PI*2; a+=0.05) {
                    let r = baseRadius; 
                    
                    // في الرينغ: المحدب يعني حلقات أقرب للمركز (r أصغر)
                    if(type === 'astig_with') { 
                        // تقارب بالعمودي (90, 270) -> نستخدم cos(2a) بحيث يطرح عند 90 و 270
                        r = baseRadius * (1 - 0.15 * Math.cos(2 * a + Math.PI)); 
                    } 
                    else if(type === 'astig_against') { 
                        // تقارب بالأفقي (0, 180)
                        r = baseRadius * (1 - 0.15 * Math.cos(2 * a)); 
                    } 
                    else if(type === 'keratoconus') { 
                        if (a > 0 && a < Math.PI) { r *= (1 - 0.25 * Math.sin(a)); }
                    }
                    
                    let px = cx + r * Math.cos(a); 
                    let py = cy + r * Math.sin(a);
                    
                    if(type === 'dry_eye' && (Math.sin(a*10 + this.time*5) > 0.7)) {
                        c.moveTo(px, py); continue; 
                    }
                    
                    if(a===0) c.moveTo(px, py); else c.lineTo(px, py);
                }
                c.stroke();
            }
        }

        // ماركر السنتر
        c.strokeStyle = 'white'; c.lineWidth = 0.5;
        c.beginPath(); c.moveTo(cx-10, cy); c.lineTo(cx+10, cy); c.stroke();
        c.beginPath(); c.moveTo(cx, cy-10); c.lineTo(cx, cy+10); c.stroke();

        this.animId = requestAnimationFrame(this.animate.bind(this));
    }
};
