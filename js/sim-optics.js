// === MODULE: ADVANCED OPTICS SIMULATOR (V3.1 FIXED GEOMETRY) ===
const simOptics = {
    initialized: false, 
    canvas: document.getElementById('opticsCanvas'), 
    ctx: null, 
    isRunning: false, 
    time: 0,
    slider: document.getElementById('refractSlider'), 
    condition: document.getElementById('patientCondition'),
    correctionOn: false,

    init() { 
        this.ctx = this.canvas.getContext('2d'); 
        this.resize(); 
        window.addEventListener('resize', () => { if(this.isRunning) this.resize(); }); 
        this.slider.addEventListener('input', () => this.draw()); 
        this.condition.addEventListener('change', () => this.draw());
        this.initialized = true; 
    },
    start() { this.isRunning = true; this.animate(); },
    stop() { this.isRunning = false; cancelAnimationFrame(this.animId); },
    resize() { 
        if(this.canvas.parentElement) {
            this.canvas.width = this.canvas.parentElement.clientWidth; 
            this.canvas.height = this.canvas.parentElement.clientHeight; 
            this.draw(); // تحديث الرسم فورا بعد تغيير الحجم
        }
    },
    
    toggleCorrection() {
        this.correctionOn = !this.correctionOn;
        const btn = document.getElementById('btn-correction');
        if(this.correctionOn) {
            btn.className = "w-full bg-cyan-900/40 hover:bg-cyan-800/60 text-cyan-400 font-bold py-3 rounded-lg border border-cyan-500 shadow-[0_0_15px_rgba(0,240,255,0.3)] transition flex items-center justify-center gap-2 mb-6";
            btn.innerHTML = `<span class="text-xl">✨</span> <span>إزالة العدسة التصحيحية</span>`;
        } else {
            btn.className = "w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-lg border border-slate-600 transition flex items-center justify-center gap-2 mb-6";
            btn.innerHTML = `<span class="text-xl">👓</span> <span>تطبيق عدسة تصحيحية (Correction)</span>`;
        }
    },

    animate() {
        if(!this.isRunning) return;
        this.time += 0.15; 
        this.draw();
        this.animId = requestAnimationFrame(this.animate.bind(this));
    },

    draw() {
        const c = this.ctx; const w = this.canvas.width; const h = this.canvas.height;
        const val = parseFloat(this.slider.value); // -8 to 8
        const cond = this.condition.value;
        
        c.fillStyle = '#02040a'; c.fillRect(0, 0, w, h);
        
        // رسم شبكة القياس الخلفية
        c.strokeStyle = 'rgba(30, 41, 59, 0.4)'; c.lineWidth = 1; c.beginPath();
        for(let i=0; i<w; i+=30) { c.moveTo(i,0); c.lineTo(i,h); }
        for(let i=0; i<h; i+=30) { c.moveTo(0,i); c.lineTo(w,i); } c.stroke();

        // الإحداثيات الأساسية
        const cx = 180; // موضع مقدمة العين (ثابت)
        const cy = h / 2 + (cond === 'shake' ? Math.sin(this.time * 3) * 3 : 0); // اهتزاز
        
        // ==========================================
        // 1. هندسة الطول المحوري (Fixed Eye Geometry)
        // ==========================================
        const baseAxialLength = 160;
        // تقليل معامل التمدد حتى لا يتشوه شكل العين بشكل بشع
        const currentAxialLength = baseAxialLength - (val * 4); 
        const retinaX = cx + currentAxialLength;
        const focalX_natural = cx + baseAxialLength; 
        
        let actualFocalX = focalX_natural;
        if(this.correctionOn) {
            actualFocalX = retinaX; // العدسة تجبر الضوء على السقوط على الشبكية
        }

        // ==========================================
        // 2. تحديث شاشة الـ DSP
        // ==========================================
        let noise = 0; let readingColor = '#00f0ff'; let desc = ""; let indColor = "bg-cyan-500";
        let displayVal = val;

        if (this.correctionOn) {
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
                readingColor = '#ff003c'; indColor = "bg-red-500";
                desc = "ERR: MEDIA OPACITY (CATARACT). SEVERE SCATTERING. LOW CONFIDENCE."; 
            }
            else {
                if(val === 0) desc = "SYSTEM NOMINAL. PERFECT RETINAL FOCUS.";
                else if(val < 0) { readingColor = '#ff003c'; indColor = "bg-red-500"; desc = `MYOPIA DETECTED. AXIAL ELONGATION. FOCUS IN FRONT OF RETINA.`; }
                else { readingColor = '#ff003c'; indColor = "bg-red-500"; desc = `HYPEROPIA DETECTED. AXIAL SHORTENING. FOCUS BEHIND RETINA.`; }
            }
        }
        
        let finalReading = (displayVal + noise).toFixed(2);
        const resEl = document.getElementById('optics-result');
        resEl.innerText = `SPH: ${finalReading > 0 && finalReading != 0 ? '+':''}${finalReading} D`;
        resEl.style.color = readingColor;
        resEl.style.textShadow = `0 0 15px ${readingColor}`;
        document.getElementById('optics-desc').innerText = desc;
        document.getElementById('dsp-indicator').className = `absolute top-0 left-0 w-1 h-full ${indColor}`;

        // ==========================================
        // 3. رسم تشريح العين (Perfect Scaling)
        // ==========================================
        
        // رسم مقلة العين (Sclera)
        c.lineWidth = 3; c.fillStyle = '#050a15'; c.strokeStyle = '#1e293b'; 
        c.beginPath(); 
        // الارتفاع (Radius Y) ثابت على 85 حتى لا تنضغط العين بشكل غريب
        c.ellipse(cx + (currentAxialLength/2), cy, currentAxialLength/2, 85, 0, 0, Math.PI*2); 
        c.fill(); c.stroke();
        
        // رسم توهج الشبكية (Retina Glow)
        c.shadowBlur = 20; c.shadowColor = '#ff003c'; c.strokeStyle = '#ef4444'; c.lineWidth = 4; 
        c.beginPath(); 
        c.arc(cx + (currentAxialLength/2), cy, currentAxialLength/2, -0.2, 0.2, false); 
        c.stroke(); c.shadowBlur = 0;

        // رسم القرنية الأمامية (Cornea) ثابتة ولا تنفصل
        c.strokeStyle = '#00f0ff'; c.lineWidth = 4; c.shadowBlur = 10; c.shadowColor = '#00f0ff'; 
        c.beginPath(); 
        c.arc(cx + 35, cy, 40, Math.PI - 0.9, Math.PI + 0.9, false); 
        c.stroke(); c.shadowBlur = 0;
        
        // رسم العدسة البلورية الداخلية (Crystalline Lens)
        const innerLensX = cx + 25;
        if(cond === 'cataract') {
            const catGrd = c.createRadialGradient(innerLensX, cy, 2, innerLensX, cy, 20);
            catGrd.addColorStop(0, 'rgba(255, 240, 200, 0.9)');
            catGrd.addColorStop(1, 'rgba(200, 180, 150, 0.4)');
            c.fillStyle = catGrd;
            c.shadowBlur = 15; c.shadowColor = '#ffaa00';
        } else {
            c.fillStyle = 'rgba(255,255,255,0.05)'; c.shadowBlur = 0;
        }
        c.strokeStyle = '#64748b'; c.lineWidth = 2; 
        c.beginPath(); c.ellipse(innerLensX, cy, 10, 35, 0, 0, Math.PI*2); c.fill(); c.stroke(); c.shadowBlur = 0;

        // ==========================================
        // 4. رسم العدسة التصحيحية (Glasses)
        // ==========================================
        const glassesX = cx - 60;
        if(this.correctionOn && val !== 0) {
            c.fillStyle = 'rgba(0, 240, 255, 0.1)'; c.strokeStyle = '#00f0ff'; c.lineWidth = 2;
            c.shadowBlur = 10; c.shadowColor = '#00f0ff';
            c.beginPath();
            
            if(val < 0) {
                // عدسة مقعرة (Concave) لقصر النظر
                c.moveTo(glassesX - 5, cy - 45); c.lineTo(glassesX + 5, cy - 45);
                c.quadraticCurveTo(glassesX + 1, cy, glassesX + 5, cy + 45);
                c.lineTo(glassesX - 5, cy + 45);
                c.quadraticCurveTo(glassesX - 12, cy, glassesX - 5, cy - 45);
            } else {
                // عدسة محدبة (Convex) لطول النظر
                c.ellipse(glassesX, cy, 9, 45, 0, 0, Math.PI*2);
            }
            c.fill(); c.stroke(); c.shadowBlur = 0;
            
            // تصحيح النص برمجياً بشكل نهائي
            c.fillStyle = '#00f0ff'; c.font = 'bold 11px monospace';
            c.fillText(`LENS: ${val > 0 ? '+':''}${val}D`, glassesX - 25, cy - 60);
        }

        // ==========================================
        // 5. تتبع الأشعة الديناميكي (Ray Tracing)
        // ==========================================
        const beamHeight = 25;
        const rayColor = cond === 'cataract' ? 'rgba(255, 100, 100, 0.6)' : 'rgba(0, 240, 255, 0.8)';
        
        c.lineWidth = 2;
        c.setLineDash([12, 8]);
        c.lineDashOffset = -this.time * 20; 
        
        const drawRay = (startY) => {
            c.beginPath(); 
            c.moveTo(0, cy + startY); 
            
            if(this.correctionOn && val !== 0) {
                // انكسار العدسة التصحيحية
                c.lineTo(glassesX, cy + startY);
                let bend = val < 0 ? startY * 1.3 : startY * 0.6; // تشتيت أو تجميع
                c.lineTo(innerLensX, cy + bend);
                c.lineTo(actualFocalX, cy);
            } 
            else {
                // بدون تصحيح
                c.lineTo(innerLensX, cy + startY);
                
                if(cond === 'cataract') {
                    // تشتت المياه البيضاء
                    c.lineTo(retinaX, cy + startY + (Math.random()-0.5)*80); 
                } 
                else {
                    if(actualFocalX < retinaX) { // قصر نظر
                        c.lineTo(actualFocalX, cy); 
                        let slope = (cy - (cy + startY)) / (actualFocalX - innerLensX); 
                        let extY = cy + slope * (retinaX - actualFocalX); 
                        c.lineTo(retinaX, extY); 
                    } else { // طول نظر أو مثالي
                        let slope = (cy - (cy + startY)) / (actualFocalX - innerLensX);
                        let retY = (cy + startY) + slope * (retinaX - innerLensX);
                        c.lineTo(retinaX, retY);
                        
                        // إكمال المسار الوهمي خلف الشبكية بشفافية
                        c.stroke();
                        c.globalAlpha = 0.2; c.setLineDash([4, 4]);
                        c.beginPath(); c.moveTo(retinaX, retY); c.lineTo(actualFocalX, cy); 
                        c.stroke(); 
                        c.globalAlpha = 1.0; c.setLineDash([12, 8]);
                        c.beginPath(); 
                    }
                }
            }
            c.strokeStyle = rayColor; c.shadowBlur = 10; c.shadowColor = rayColor;
            c.stroke(); c.shadowBlur = 0;
        };

        drawRay(-beamHeight);
        drawRay(beamHeight);
        
        c.beginPath(); c.moveTo(0, cy); c.lineTo(cond === 'cataract' ? innerLensX : Math.min(retinaX, actualFocalX), cy); c.stroke();
        c.setLineDash([]); 

        // ==========================================
        // 6. المؤشرات البصرية للتركيز
        // ==========================================
        if (cond !== 'cataract') {
            c.shadowBlur = 20; c.shadowColor = '#fff'; c.fillStyle = '#fff'; 
            c.beginPath(); c.arc(actualFocalX, cy, 4, 0, Math.PI*2); c.fill();

            // دائرة التشتت على الشبكية إذا كان التركيز خاطئاً
            if(actualFocalX !== retinaX) {
                let blurRadius = Math.abs(retinaX - actualFocalX) * (beamHeight / (Math.abs(actualFocalX - innerLensX)));
                c.fillStyle = 'rgba(255, 0, 60, 0.4)'; c.shadowBlur = 20; c.shadowColor = '#ff003c';
                c.beginPath(); c.ellipse(retinaX, cy, 5, Math.min(blurRadius, 70), 0, 0, Math.PI*2); c.fill();
            }
        }
    }
};
