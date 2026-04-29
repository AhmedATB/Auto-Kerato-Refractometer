// === MODULE: ADVANCED OPTICS & RAY TRACING ENGINE (V3.0 PREMIUM) ===
// BME Clinical Physics Simulator

const simOptics = {
    initialized: false, 
    canvas: document.getElementById('opticsCanvas'), 
    ctx: null, 
    isRunning: false, 
    time: 0, animId: null,
    
    // ربط عناصر الـ DOM
    slider: document.getElementById('refractSlider'), 
    condition: document.getElementById('patientCondition'),
    correctionOn: false,

    init() { 
        this.ctx = this.canvas.getContext('2d'); 
        this.resize(); 
        window.addEventListener('resize', () => { if(this.isRunning) this.resize(); }); 
        
        // استماع للتغييرات الفورية
        this.slider.addEventListener('input', () => {
            // إيقاف التصحيح تلقائياً عند تغيير السلايدر للواقعية
            if(this.correctionOn) this.toggleCorrection();
        }); 
        this.condition.addEventListener('change', () => {
            if(this.correctionOn) this.toggleCorrection();
        });
        
        this.initialized = true; 
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
    
    // تصميم زر العدسة المتجاوب مع الـ Premium UI
    toggleCorrection() {
        this.correctionOn = !this.correctionOn;
        const btn = document.getElementById('btn-correction');
        
        if(this.correctionOn) {
            // حالة تفعيل العدسة (Glow Effect)
            btn.className = "w-full relative group overflow-hidden bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 font-bold py-3 md:py-3.5 rounded-xl border border-cyan-500/50 shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all flex items-center justify-center gap-2 md:gap-3 mb-5 md:mb-6 z-10 text-sm md:text-base";
            btn.innerHTML = `<span class="text-xl drop-shadow-[0_0_8px_rgba(0,240,255,0.8)] animate-pulse">✨</span> <span class="tracking-wide">إزالة العدسة التصحيحية</span>`;
        } else {
            // حالة إغلاق العدسة (Standby)
            btn.className = "w-full relative group overflow-hidden bg-slate-900 hover:bg-[#050b14] text-slate-300 font-bold py-3 md:py-3.5 rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 md:gap-3 mb-5 md:mb-6 z-10 shadow-lg text-sm md:text-base";
            btn.innerHTML = `<div class="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div><span class="text-xl drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">👓</span> <span class="tracking-wide">تطبيق عدسة تصحيحية</span>`;
        }
    },

    animate() {
        if(!this.isRunning) return;
        this.time += 0.08; 
        this.draw();
        this.animId = requestAnimationFrame(this.animate.bind(this));
    },

    draw() {
        const c = this.ctx; const w = this.canvas.width; const h = this.canvas.height;
        const val = parseFloat(this.slider.value); // من -8 إلى 8
        const cond = this.condition.value;
        
        // مسح الشاشة
        c.clearRect(0, 0, w, h);
        
        // 1. رسم شبكة هندسية خلفية (Blueprint Grid)
        c.strokeStyle = 'rgba(0, 240, 255, 0.03)'; c.lineWidth = 1; c.beginPath();
        for(let i=0; i<w; i+=25) { c.moveTo(i,0); c.lineTo(i,h); }
        for(let i=0; i<h; i+=25) { c.moveTo(0,i); c.lineTo(w,i); } c.stroke();

        // الإحداثيات الأساسية
        const cx = w * 0.35; // موضع مقدمة العين (القرنية)
        // تأثير الاهتزاز (Tremor) السريري
        const cy = h / 2 + (cond === 'shake' ? Math.sin(this.time * 20) * 2.5 + Math.cos(this.time * 15) * 1.5 : 0); 
        
        // ==========================================
        // 2. هندسة الطول المحوري والفيزياء (Optics Math)
        // ==========================================
        const baseAxialLength = w * 0.35; // طول العين المثالي
        // إذا كان السلايدر سالب (قصر نظر) -> العين تستطيل. موجب -> تقصر
        const currentAxialLength = baseAxialLength - (val * (w * 0.015)); 
        
        const retinaX = cx + currentAxialLength;
        const focalX_natural = cx + baseAxialLength; // البؤرة الطبيعية للقرنية
        
        let actualFocalX = focalX_natural;
        if(this.correctionOn && val !== 0) {
            actualFocalX = retinaX; // العدسة تجبر الضوء على السقوط على الشبكية تماماً
        }

        // ==========================================
        // 3. تحديث شاشة الـ DSP التلسكوبية (HUD)
        // ==========================================
        let noise = 0; let readingColor = '#00f0ff'; let desc = ""; let indColor = "bg-cyan-500";
        let displayVal = val;

        if (this.correctionOn && val !== 0) {
            readingColor = '#39ff14'; indColor = "bg-green-500";
            desc = `CORRECTION APPLIED. LENS POWER: ${val > 0 ? '+':''}${val.toFixed(2)}D. FOCUS RESTORED.`;
            displayVal = 0; 
        } else {
            if(cond === 'shake') { 
                noise = (Math.random() - 0.5) * 1.5; 
                readingColor = '#ffaa00'; indColor = "bg-amber-500";
                desc = "ERR: HIGH FREQUENCY TREMOR DETECTED. SIGNAL UNSTABLE."; 
            }
            else if(cond === 'cataract') { 
                noise = (Math.random() - 0.5) * 0.8; 
                readingColor = '#ef4444'; indColor = "bg-red-500";
                desc = "ERR: MEDIA OPACITY (CATARACT). SEVERE SCATTERING. LOW CONFIDENCE."; 
            }
            else {
                if(val === 0) { desc = "SYSTEM NOMINAL. PERFECT RETINAL FOCUS."; }
                else if(val < 0) { readingColor = '#ef4444'; indColor = "bg-red-500"; desc = `MYOPIA DETECTED. AXIAL ELONGATION. FOCUS IN FRONT OF RETINA.`; }
                else { readingColor = '#ef4444'; indColor = "bg-red-500"; desc = `HYPEROPIA DETECTED. AXIAL SHORTENING. FOCUS BEHIND RETINA.`; }
            }
        }
        
        let finalReading = (displayVal + noise).toFixed(2);
        const resEl = document.getElementById('optics-result');
        resEl.innerText = `SPH: ${finalReading > 0 && finalReading != 0 ? '+':''}${finalReading} D`;
        resEl.className = `text-2xl md:text-4xl font-mono font-black mb-1 md:mb-2 tracking-tighter transition-colors`;
        resEl.style.color = readingColor;
        resEl.style.textShadow = `0 0 15px ${readingColor}`;
        document.getElementById('optics-desc').innerText = desc;
        document.getElementById('dsp-indicator').className = `absolute top-0 left-0 w-1.5 h-full transition-colors duration-300 ${indColor}`;
        document.getElementById('dsp-status-dot').className = `w-1.5 h-1.5 md:w-2 md:h-2 rounded-full animate-pulse transition-colors ${indColor}`;

        // ==========================================
        // 4. رسم تشريح العين (Anatomy Rendering)
        // ==========================================
        
        // أ. مقلة العين (Sclera)
        c.lineWidth = 3; c.fillStyle = '#050a15'; c.strokeStyle = '#1e293b'; 
        c.beginPath(); 
        c.ellipse(cx + (currentAxialLength/2), cy, currentAxialLength/2, w*0.12, 0, 0, Math.PI*2); 
        c.fill(); c.stroke();
        
        // ب. توهج الشبكية (Retina Glow)
        c.shadowBlur = 20; c.shadowColor = '#ff003c'; c.strokeStyle = '#ef4444'; c.lineWidth = 4; 
        c.beginPath(); 
        c.arc(cx + (currentAxialLength/2), cy, currentAxialLength/2, -0.25, 0.25, false); 
        c.stroke(); c.shadowBlur = 0;

        // ج. القرنية (Cornea)
        c.strokeStyle = '#00f0ff'; c.lineWidth = 4; c.shadowBlur = 10; c.shadowColor = '#00f0ff'; 
        c.beginPath(); 
        c.arc(cx + 25, cy, 30, Math.PI - 0.9, Math.PI + 0.9, false); 
        c.stroke(); c.shadowBlur = 0;
        
        // د. العدسة البلورية الداخلية (Crystalline Lens)
        const innerLensX = cx + 20;
        if(cond === 'cataract') {
            // تأثير المياه البيضاء (تغيم واصفرار)
            const catGrd = c.createRadialGradient(innerLensX, cy, 0, innerLensX, cy, 25);
            catGrd.addColorStop(0, 'rgba(255, 240, 150, 0.95)');
            catGrd.addColorStop(1, 'rgba(200, 150, 100, 0.6)');
            c.fillStyle = catGrd;
            c.shadowBlur = 20; c.shadowColor = '#ffaa00';
        } else {
            c.fillStyle = 'rgba(0, 240, 255, 0.05)'; c.shadowBlur = 0;
        }
        c.strokeStyle = '#64748b'; c.lineWidth = 2; 
        c.beginPath(); c.ellipse(innerLensX, cy, 8, 25, 0, 0, Math.PI*2); c.fill(); c.stroke(); c.shadowBlur = 0;

        // ==========================================
        // 5. رسم العدسة التصحيحية (Glasses Lens)
        // ==========================================
        const glassesX = cx - (w*0.15);
        if(this.correctionOn && val !== 0) {
            c.fillStyle = 'rgba(0, 240, 255, 0.1)'; c.strokeStyle = '#00f0ff'; c.lineWidth = 3;
            c.shadowBlur = 15; c.shadowColor = '#00f0ff';
            c.beginPath();
            
            if(val < 0) {
                // عدسة مقعرة (Concave) - قصر نظر
                c.moveTo(glassesX - 5, cy - 35); c.lineTo(glassesX + 5, cy - 35);
                c.quadraticCurveTo(glassesX + 1, cy, glassesX + 5, cy + 35);
                c.lineTo(glassesX - 5, cy + 35);
                c.quadraticCurveTo(glassesX - 12, cy, glassesX - 5, cy - 35);
            } else {
                // عدسة محدبة (Convex) - طول نظر
                c.ellipse(glassesX, cy, 8, 35, 0, 0, Math.PI*2);
            }
            c.fill(); c.stroke(); c.shadowBlur = 0;
            
            // نص هندسي فوق العدسة
            c.fillStyle = '#00f0ff'; c.font = 'bold 12px monospace';
            c.fillText(`LENS: ${val > 0 ? '+':''}${val}D`, glassesX - 25, cy - 50);
        }

        // ==========================================
        // 6. محرك تتبع الأشعة (Quantum Ray Tracing)
        // ==========================================
        const beamHeight = 20;
        const rayColor = cond === 'cataract' ? 'rgba(255, 100, 100, 0.6)' : 'rgba(0, 240, 255, 0.8)';
        
        c.lineWidth = 2;
        // تأثير حركة فوتونات الضوء المستمرة
        c.setLineDash([15, 10]);
        c.lineDashOffset = -this.time * 25; 
        
        const drawRay = (startY) => {
            c.beginPath(); 
            c.moveTo(0, cy + startY); 
            
            if(this.correctionOn && val !== 0) {
                // انكسار الضوء عبر العدسة التصحيحية
                c.lineTo(glassesX, cy + startY);
                let bend = val < 0 ? startY * 1.3 : startY * 0.6; // مقعرة تشتت، محدبة تجمع
                c.lineTo(innerLensX, cy + bend);
                c.lineTo(actualFocalX, cy);
            } 
            else {
                // مسار الضوء الطبيعي
                c.lineTo(innerLensX, cy + startY);
                
                if(cond === 'cataract') {
                    // تشتت عشوائي بسبب المياه البيضاء (Scattering)
                    c.lineTo(retinaX, cy + startY + (Math.random()-0.5)*100); 
                } 
                else {
                    if(actualFocalX < retinaX) { 
                        // قصر نظر: البؤرة قبل الشبكية وتتشتت بعدها
                        c.lineTo(actualFocalX, cy); 
                        let slope = (cy - (cy + startY)) / (actualFocalX - innerLensX); 
                        let extY = cy + slope * (retinaX - actualFocalX); 
                        c.lineTo(retinaX, extY); 
                    } else { 
                        // طول نظر: الأشعة تضرب الشبكية قبل أن تتجمع
                        let slope = (cy - (cy + startY)) / (actualFocalX - innerLensX);
                        let retY = (cy + startY) + slope * (retinaX - innerLensX);
                        c.lineTo(retinaX, retY);
                        
                        // رسم المسار الوهمي خلف الشبكية بشفافية
                        c.stroke();
                        c.globalAlpha = 0.2; c.setLineDash([4, 4]);
                        c.beginPath(); c.moveTo(retinaX, retY); c.lineTo(actualFocalX, cy); 
                        c.stroke(); 
                        c.globalAlpha = 1.0; c.setLineDash([15, 10]);
                        c.beginPath(); 
                    }
                }
            }
            
            c.strokeStyle = rayColor; c.shadowBlur = 10; c.shadowColor = rayColor;
            c.stroke(); c.shadowBlur = 0;
        };

        // رسم 3 أشعة (علوي، سفلي، مركزي)
        drawRay(-beamHeight);
        drawRay(beamHeight);
        
        c.beginPath(); c.moveTo(0, cy); c.lineTo(cond === 'cataract' ? innerLensX : Math.min(retinaX, actualFocalX), cy); c.stroke();
        c.setLineDash([]); 

        // ==========================================
        // 7. المؤشرات السريرية للتركيز (Focus Indicators)
        // ==========================================
        if (cond !== 'cataract') {
            // رسم البؤرة الحقيقية (النقطة المتوهجة)
            c.shadowBlur = 20; c.shadowColor = '#fff'; c.fillStyle = '#fff'; 
            c.beginPath(); c.arc(actualFocalX, cy, 4, 0, Math.PI*2); c.fill();

            // رسم "دائرة التشتت" (Circle of Confusion) على الشبكية
            if(actualFocalX !== retinaX) {
                // كلما زاد البعد عن البؤرة، زاد التشتت (Blur)
                let blurRadius = Math.abs(retinaX - actualFocalX) * (beamHeight / (Math.abs(actualFocalX - innerLensX)));
                c.fillStyle = 'rgba(255, 0, 60, 0.5)'; c.shadowBlur = 25; c.shadowColor = '#ff003c';
                c.beginPath(); c.ellipse(retinaX, cy, 4, Math.min(blurRadius, w*0.15), 0, 0, Math.PI*2); c.fill();
            }
        }
    }
};
