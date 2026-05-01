// === MODULE: ADVANCED OPTICS & RAY TRACING ENGINE (V4.0 AGING & STRAIN) ===
const simOptics = {
    initialized: false, 
    canvas: document.getElementById('opticsCanvas'), 
    ctx: null, 
    isRunning: false, 
    time: 0, animId: null,
    
    slider: document.getElementById('refractSlider'), 
    condition: document.getElementById('patientCondition'),
    correctionOn: false,

    init() { 
        this.ctx = this.canvas.getContext('2d'); 
        this.resize(); 
        window.addEventListener('resize', () => { if(this.isRunning) this.resize(); }); 
        
        this.slider.addEventListener('input', () => {
            if(this.correctionOn) this.toggleCorrection();
        }); 
        this.condition.addEventListener('change', () => {
            if(this.correctionOn) this.toggleCorrection();
        });
        
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
            btn.className = "w-full relative group overflow-hidden bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 font-bold py-3 md:py-3.5 rounded-xl border border-cyan-500/50 shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all flex items-center justify-center gap-2 md:gap-3 mb-5 md:mb-6 z-10 text-sm md:text-base";
            btn.innerHTML = `<span class="text-xl drop-shadow-[0_0_8px_rgba(0,240,255,0.8)] animate-pulse">✨</span> <span class="tracking-wide">إزالة العدسة التصحيحية</span>`;
        } else {
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
        const val = parseFloat(this.slider.value); 
        const cond = this.condition.value;
        
        c.clearRect(0, 0, w, h);
        
        // شبكة هندسية خلفية
        c.strokeStyle = 'rgba(0, 240, 255, 0.03)'; c.lineWidth = 1; c.beginPath();
        for(let i=0; i<w; i+=25) { c.moveTo(i,0); c.lineTo(i,h); }
        for(let i=0; i<h; i+=25) { c.moveTo(0,i); c.lineTo(w,i); } c.stroke();

        const cx = w * 0.35; 
        const cy = h / 2 + (cond === 'shake' ? Math.sin(this.time * 20) * 2.5 + Math.cos(this.time * 15) * 1.5 : 0); 
        
        // هندسة الطول المحوري
        const baseAxialLength = w * 0.35; 
        const currentAxialLength = baseAxialLength - (val * (w * 0.015)); 
        
        const retinaX = cx + currentAxialLength;
        const focalX_natural = cx + baseAxialLength; 
        
        let actualFocalX = focalX_natural;
        
        // === الفيزياء الجديدة: إجهاد الشاشات ===
        if (cond === 'phone_strain') actualFocalX -= 25; // تشنج العضلة يسحب البؤرة للأمام
        
        if(this.correctionOn && val !== 0 && cond !== 'phone_strain') {
            actualFocalX = retinaX; 
        }

        // ==========================================
        // تحديث شاشة الـ DSP التلسكوبية (HUD)
        // ==========================================
        let noise = 0; let readingColor = '#00f0ff'; let desc = ""; let indColor = "bg-cyan-500";
        let displayVal = val;
        let baseMessage = "";

        if (this.correctionOn && val !== 0) {
            displayVal = 0; 
            baseMessage = `[LENS: ${val > 0 ? '+':''}${val.toFixed(2)}D] `;
        }

        if (cond === 'shake') { 
            noise = (Math.random() - 0.5) * 1.5; 
            readingColor = '#ffaa00'; indColor = "bg-amber-500";
            desc = baseMessage + "ERR: TREMOR DETECTED. SIGNAL UNSTABLE."; 
        }
        else if (cond === 'cataract') { 
            noise = (Math.random() - 0.5) * 0.8; 
            readingColor = '#ef4444'; indColor = "bg-red-500";
            desc = baseMessage + "ERR: MEDIA OPACITY. SEVERE SCATTERING."; 
        }
        else if (cond === 'phone_strain') {
            displayVal = -2.50; // قراءة وهمية (قصر نظر كاذب)
            readingColor = '#ff003c'; indColor = "bg-red-500";
            desc = "SPASM DETECTED! FALSE MYOPIA DUE TO SCREEN STRAIN. FOGGING REQUIRED.";
        }
        else if (cond === 'presbyopia') {
            readingColor = '#a855f7'; indColor = "bg-purple-500";
            desc = baseMessage + "LENS SCLEROSIS (AGING). NO ACCOMMODATION. DISTANCE VISION ONLY.";
        }
        else {
            if (displayVal === 0) { 
                readingColor = '#39ff14'; indColor = "bg-green-500";
                desc = baseMessage + "SYSTEM NOMINAL. PERFECT FOCUS."; 
            }
            else if (val < 0) { 
                readingColor = '#ef4444'; indColor = "bg-red-500"; 
                desc = `MYOPIA DETECTED. FOCUS IN FRONT OF RETINA.`; 
            }
            else { 
                readingColor = '#ef4444'; indColor = "bg-red-500"; 
                desc = `HYPEROPIA DETECTED. FOCUS BEHIND RETINA.`; 
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
        // رسم تشريح العين مع تأثيرات العمر والتليفون
        // ==========================================
        c.lineWidth = 3; c.fillStyle = '#050a15'; c.strokeStyle = '#1e293b'; 
        c.beginPath(); c.ellipse(cx + (currentAxialLength/2), cy, currentAxialLength/2, w*0.12, 0, 0, Math.PI*2); c.fill(); c.stroke();
        
        c.shadowBlur = 20; c.shadowColor = '#ff003c'; c.strokeStyle = '#ef4444'; c.lineWidth = 4; 
        c.beginPath(); c.arc(cx + (currentAxialLength/2), cy, currentAxialLength/2, -0.25, 0.25, false); c.stroke(); c.shadowBlur = 0;

        c.strokeStyle = '#00f0ff'; c.lineWidth = 4; c.shadowBlur = 10; c.shadowColor = '#00f0ff'; 
        c.beginPath(); c.arc(cx + 25, cy, 30, Math.PI - 0.9, Math.PI + 0.9, false); c.stroke(); c.shadowBlur = 0;
        
        // === رسم العدسة البلورية الداخلية (تتغير فسيولوجياً) ===
        const innerLensX = cx + 20;
        let lensThickness = 8; // الوضع الطبيعي
        
        if (cond === 'cataract') {
            const catGrd = c.createRadialGradient(innerLensX, cy, 0, innerLensX, cy, 25);
            catGrd.addColorStop(0, 'rgba(255, 240, 150, 0.95)'); catGrd.addColorStop(1, 'rgba(200, 150, 100, 0.6)');
            c.fillStyle = catGrd; c.shadowBlur = 20; c.shadowColor = '#ffaa00';
        } else if (cond === 'phone_strain') {
            // العدسة منتفخة جداً بسبب إجهاد التليفون
            c.fillStyle = 'rgba(255, 0, 60, 0.2)'; 
            c.strokeStyle = '#ff003c';
            lensThickness = 14; 
        } else if (cond === 'presbyopia') {
            // العدسة متصلبة ومسطحة بسبب الشيخوخة
            c.fillStyle = 'rgba(168, 85, 247, 0.3)'; 
            c.strokeStyle = '#a855f7';
            lensThickness = 5; 
        } else {
            c.fillStyle = 'rgba(0, 240, 255, 0.05)'; c.shadowBlur = 0; c.strokeStyle = '#64748b';
        }
        
        c.lineWidth = 2; c.beginPath(); c.ellipse(innerLensX, cy, lensThickness, 25, 0, 0, Math.PI*2); c.fill(); c.stroke(); c.shadowBlur = 0;

        // رسم العدسة التصحيحية
        const glassesX = cx - (w*0.15);
        if(this.correctionOn && val !== 0 && cond !== 'phone_strain') {
            c.fillStyle = 'rgba(0, 240, 255, 0.1)'; c.strokeStyle = '#00f0ff'; c.lineWidth = 3;
            c.shadowBlur = 15; c.shadowColor = '#00f0ff'; c.beginPath();
            if(val < 0) {
                c.moveTo(glassesX - 5, cy - 35); c.lineTo(glassesX + 5, cy - 35);
                c.quadraticCurveTo(glassesX + 1, cy, glassesX + 5, cy + 35);
                c.lineTo(glassesX - 5, cy + 35); c.quadraticCurveTo(glassesX - 12, cy, glassesX - 5, cy - 35);
            } else {
                c.ellipse(glassesX, cy, 8, 35, 0, 0, Math.PI*2);
            }
            c.fill(); c.stroke(); c.shadowBlur = 0;
            c.fillStyle = '#00f0ff'; c.font = 'bold 12px monospace';
            c.fillText(`LENS: ${val > 0 ? '+':''}${val}D`, glassesX - 25, cy - 50);
        }

        // تتبع الأشعة
        const beamHeight = 20;
        const rayColor = cond === 'cataract' ? 'rgba(255, 100, 100, 0.6)' : cond === 'presbyopia' ? 'rgba(168, 85, 247, 0.8)' : 'rgba(0, 240, 255, 0.8)';
        c.lineWidth = 2; c.setLineDash([15, 10]); c.lineDashOffset = -this.time * 25; 
        
        const drawRay = (startY) => {
            c.beginPath(); c.moveTo(0, cy + startY); 
            if(this.correctionOn && val !== 0 && cond !== 'phone_strain') {
                c.lineTo(glassesX, cy + startY);
                let bend = val < 0 ? startY * 1.3 : startY * 0.6; 
                c.lineTo(innerLensX, cy + bend); c.lineTo(actualFocalX, cy);
            } else {
                c.lineTo(innerLensX, cy + startY);
                if(cond === 'cataract') {
                    c.lineTo(retinaX, cy + startY + (Math.random()-0.5)*100); 
                } else {
                    if(actualFocalX < retinaX) { 
                        c.lineTo(actualFocalX, cy); 
                        let slope = (cy - (cy + startY)) / (actualFocalX - innerLensX); 
                        let extY = cy + slope * (retinaX - actualFocalX); c.lineTo(retinaX, extY); 
                    } else { 
                        let slope = (cy - (cy + startY)) / (actualFocalX - innerLensX);
                        let retY = (cy + startY) + slope * (retinaX - innerLensX); c.lineTo(retinaX, retY);
                        c.stroke(); c.globalAlpha = 0.2; c.setLineDash([4, 4]);
                        c.beginPath(); c.moveTo(retinaX, retY); c.lineTo(actualFocalX, cy); c.stroke(); 
                        c.globalAlpha = 1.0; c.setLineDash([15, 10]); c.beginPath(); 
                    }
                }
            }
            c.strokeStyle = rayColor; c.shadowBlur = 10; c.shadowColor = rayColor; c.stroke(); c.shadowBlur = 0;
        };

        drawRay(-beamHeight); drawRay(beamHeight);
        c.beginPath(); c.moveTo(0, cy); c.lineTo(cond === 'cataract' ? innerLensX : Math.min(retinaX, actualFocalX), cy); c.stroke(); c.setLineDash([]); 

        // المؤشرات السريرية
        if (cond !== 'cataract') {
            c.shadowBlur = 20; c.shadowColor = '#fff'; c.fillStyle = '#fff'; 
            c.beginPath(); c.arc(actualFocalX, cy, 4, 0, Math.PI*2); c.fill();

            if(actualFocalX !== retinaX) {
                let blurRadius = Math.abs(retinaX - actualFocalX) * (beamHeight / (Math.abs(actualFocalX - innerLensX)));
                c.fillStyle = cond === 'phone_strain' ? 'rgba(255, 0, 60, 0.6)' : cond === 'presbyopia' ? 'rgba(168, 85, 247, 0.4)' : 'rgba(255, 0, 60, 0.5)'; 
                c.shadowBlur = 25; c.shadowColor = cond === 'phone_strain' ? '#ff003c' : cond === 'presbyopia' ? '#a855f7' : '#ff003c';
                c.beginPath(); c.ellipse(retinaX, cy, 4, Math.min(blurRadius, w*0.15), 0, 0, Math.PI*2); c.fill();
            }
        }
    }
};
