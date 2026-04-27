// === MODULE: ADVANCED OPTICS SIMULATOR ===
const simOptics = {
    initialized: false, 
    canvas: document.getElementById('opticsCanvas'), 
    ctx: null, 
    isRunning: false, 
    time: 0,
    slider: document.getElementById('refractSlider'), 
    condition: document.getElementById('patientCondition'),
    correctionOn: false, // حالة العدسة التصحيحية

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
        this.time += 0.15; // سرعة الأنيميشن
        this.draw();
        this.animId = requestAnimationFrame(this.animate.bind(this));
    },

    draw() {
        const c = this.ctx; const w = this.canvas.width; const h = this.canvas.height;
        const val = parseFloat(this.slider.value); // -8 (Myopia) to +8 (Hyperopia)
        const cond = this.condition.value;
        
        c.fillStyle = '#02040a'; c.fillRect(0, 0, w, h);
        
        // رسم شبكة خلفية هندسية
        c.strokeStyle = 'rgba(30, 41, 59, 0.3)'; c.lineWidth = 1; c.beginPath();
        for(let i=0; i<w; i+=30) { c.moveTo(i,0); c.lineTo(i,h); }
        for(let i=0; i<h; i+=30) { c.moveTo(0,i); c.lineTo(w,i); } c.stroke();

        // إعدادات الشاشة والموقع
        const cx = 180; // موضع القرنية
        const cy = h / 2 + (cond === 'shake' ? Math.sin(this.time * 3) * 4 : 0); // اهتزاز العين
        
        // ==========================================
        // 1. حسابات الفيزياء البصرية (Optical Physics)
        // ==========================================
        
        // فيزياء الطول المحوري: مقلة العين تطول أو تقصر بناءً على قصر/طول النظر
        // val < 0 (Myopia): Axial length increases
        // val > 0 (Hyperopia): Axial length decreases
        const baseAxialLength = 150;
        const currentAxialLength = baseAxialLength - (val * 8); 
        const retinaX = cx + currentAxialLength;
        
        // قوة عين الإنسان الطبيعية تكسر الضوء في مسافة 150 بكسل
        const naturalFocalX = cx + baseAxialLength; 
        
        // أين يقع الضوء الآن؟
        let actualFocalX = naturalFocalX;
        if(this.correctionOn) {
            // العدسة التصحيحية تعدل مسار الضوء ليقع بدقة على الشبكية الجديدة
            actualFocalX = retinaX;
        }

        // ==========================================
        // 2. تحديث لوحة التحكم (DSP Telemetry)
        // ==========================================
        let noise = 0; let readingColor = '#00f0ff'; let desc = ""; let indColor = "bg-cyan-500";
        let displayVal = val;

        if (this.correctionOn) {
            readingColor = '#39ff14'; indColor = "bg-green-500";
            desc = `CORRECTION APPLIED. LENS POWER: ${val > 0 ? '+':''}${-val.toFixed(2)}D. FOCUS RESTORED.`;
            displayVal = 0; // تم التصحيح
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
        // 3. رسم تشريح العين (Eye Anatomy)
        // ==========================================
        
        // رسم مقلة العين (Sclera) - يتغير طولها المحوري!
        c.lineWidth = 3; c.fillStyle = '#050a15'; c.strokeStyle = '#1e293b'; 
        c.beginPath(); 
        c.ellipse(cx + (currentAxialLength/2), cy, currentAxialLength/2, 110, 0, 0, Math.PI*2); 
        c.fill(); c.stroke();
        
        // رسم بقعة الإبصار (Fovea / Retina Glow)
        c.shadowBlur = 20; c.shadowColor = '#ff003c'; c.strokeStyle = '#ef4444'; c.lineWidth = 4; 
        c.beginPath(); 
        c.arc(retinaX - currentAxialLength/2, cy, currentAxialLength/2, Math.PI*-0.15, Math.PI*0.15, false); 
        c.stroke(); c.shadowBlur = 0;

        // رسم القرنية (Cornea) ثابتة الحجم والمكان
        c.strokeStyle = '#00f0ff'; c.lineWidth = 5; c.shadowBlur = 10; c.shadowColor = '#00f0ff'; 
        c.beginPath(); c.arc(cx, cy, 55, Math.PI*-0.35, Math.PI*0.35, false); c.stroke(); c.shadowBlur = 0;
        
        // رسم العدسة البلورية (Crystalline Lens)
        // إذا كان هناك مياه بيضاء (Cataract)، تتغير للون الغائم الأصفر
        if(cond === 'cataract') {
            const catGrd = c.createRadialGradient(cx + 40, cy, 5, cx + 40, cy, 25);
            catGrd.addColorStop(0, 'rgba(255, 240, 200, 0.9)');
            catGrd.addColorStop(1, 'rgba(200, 180, 150, 0.5)');
            c.fillStyle = catGrd;
            c.shadowBlur = 15; c.shadowColor = '#ffaa00';
        } else {
            c.fillStyle = 'rgba(255,255,255,0.08)'; c.shadowBlur = 0;
        }
        c.strokeStyle = '#64748b'; c.lineWidth = 2; 
        c.beginPath(); c.ellipse(cx + 40, cy, 18, 45, 0, 0, Math.PI*2); c.fill(); c.stroke(); c.shadowBlur = 0;

        // رسم العدسة التصحيحية (الخارجية) إذا كانت مفعلة
        const glassesX = cx - 60;
        if(this.correctionOn && val !== 0) {
            c.fillStyle = 'rgba(0, 240, 255, 0.1)'; c.strokeStyle = '#00f0ff'; c.lineWidth = 2;
            c.shadowBlur = 10; c.shadowColor = '#00f0ff';
            c.beginPath();
            if(val < 0) {
                // عدسة مقعرة (Concave) لقصر النظر
                c.moveTo(glassesX - 10, cy - 50); c.lineTo(glassesX + 10, cy - 50);
                c.quadraticCurveTo(glassesX - 5, cy, glassesX + 10, cy + 50);
                c.lineTo(glassesX - 10, cy + 50);
                c.quadraticCurveTo(glassesX - 25, cy, glassesX - 10, cy - 50);
            } else {
                // عدسة محدبة (Convex) لطول النظر
                c.ellipse(glassesX, cy, 12, 50, 0, 0, Math.PI*2);
            }
            c.fill(); c.stroke(); c.shadowBlur = 0;
            
            c.fillStyle = '#00f0ff'; c.font = '10px monospace';
            c.fillText(`LENS: ${val > 0 ? '+':''}${-val}D`, glassesX - 25, cy - 65);
        }

        // ==========================================
        // 4. تتبع الأشعة الديناميكي (Animated Ray Tracing)
        // ==========================================
        const beamHeight = 45;
        const rayColor = cond === 'cataract' ? 'rgba(255, 100, 100, 0.6)' : 'rgba(0, 240, 255, 0.8)';
        
        c.lineWidth = 2.5;
        // تأثير حركة الضوء (Marching Ants)
        c.setLineDash([15, 10]);
        c.lineDashOffset = -this.time * 25; 
        
        const drawRay = (startY) => {
            c.beginPath(); 
            // 1. مسار الضوء من الخارج
            c.moveTo(0, cy + startY); 
            
            if(this.correctionOn && val !== 0) {
                // يضرب العدسة التصحيحية وينكسر
                c.lineTo(glassesX, cy + startY);
                // ينكسر نحو القرنية
                let bend = val < 0 ? startY * 1.2 : startY * 0.8; // المقعرة تشتت، المحدبة تجمع
                c.lineTo(cx, cy + bend);
                // من القرنية ينكسر ليضرب الشبكية بدقة
                c.lineTo(actualFocalX, cy);
            } 
            else {
                // بدون تصحيح
                c.lineTo(cx, cy + startY); // يضرب القرنية
                
                if(cond === 'cataract') {
                    // تشتت عشوائي داخل العين بسبب العتامة
                    c.lineTo(cx + 40, cy + startY); // يصل للعدسة المعتمة
                    c.lineTo(retinaX, cy + startY + (Math.random()-0.5)*80); // يتشتت!
                } 
                else {
                    // مسار طبيعي نحو نقطة التركيز
                    if(actualFocalX < retinaX) { // قصر نظر (Focus in front)
                        c.lineTo(actualFocalX, cy); 
                        let slope = (cy - (cy + startY)) / (actualFocalX - cx); 
                        let extY = cy + slope * (retinaX - actualFocalX); 
                        c.lineTo(retinaX, extY); // يكمل مساره مشتتاً نحو الشبكية
                    } else {
                        // طول نظر أو مثالي (Focus behind or on retina)
                        // نرسم الخط فقط لحدود الشبكية ليظهر بشكل واقعي
                        let slope = (cy - (cy + startY)) / (actualFocalX - cx);
                        let retY = (cy + startY) + slope * (retinaX - cx);
                        c.lineTo(retinaX, retY);
                        
                        // رسم الجزء الوهمي خلف الشبكية بلون خافت
                        c.stroke();
                        c.globalAlpha = 0.2; c.beginPath(); c.moveTo(retinaX, retY); c.lineTo(actualFocalX, cy); c.stroke(); c.globalAlpha = 1.0;
                        c.beginPath(); // Reset path
                    }
                }
            }
            c.strokeStyle = rayColor; c.shadowBlur = 10; c.shadowColor = rayColor;
            c.stroke(); c.shadowBlur = 0;
        };

        drawRay(-beamHeight);
        drawRay(beamHeight);
        
        // الشعاع المركزي
        c.beginPath(); c.moveTo(0, cy); c.lineTo(cond === 'cataract' ? cx+40 : Math.min(retinaX, actualFocalX), cy); c.stroke();
        c.setLineDash([]); // Reset dash

        // ==========================================
        // 5. المؤشرات البصرية (Blur Disc & Focal Point)
        // ==========================================
        
        if (cond !== 'cataract') {
            // رسم نقطة التركيز (Focal Point)
            c.shadowBlur = 20; c.shadowColor = '#fff'; c.fillStyle = '#fff'; 
            c.beginPath(); c.arc(actualFocalX, cy, 4, 0, Math.PI*2); c.fill();

            // رسم دائرة التشويش على الشبكية (Blur Circle) إذا كان التركيز خاطئاً
            if(actualFocalX !== retinaX) {
                let blurRadius = Math.abs(retinaX - actualFocalX) * (beamHeight / (actualFocalX - cx));
                c.fillStyle = 'rgba(255, 0, 60, 0.4)'; c.shadowBlur = 20; c.shadowColor = '#ff003c';
                c.beginPath(); c.ellipse(retinaX, cy, 6, Math.min(blurRadius, 80), 0, 0, Math.PI*2); c.fill();
            }
        }
    }
};
