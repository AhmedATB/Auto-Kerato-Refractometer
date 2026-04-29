// === MODULE: AI AUTO-TRACKING SIMULATOR (PREMIUM UPGRADE) ===
const simAI = {
    initialized: false, 
    rawCanvas: document.getElementById('aiRawCanvas'), 
    procCanvas: document.getElementById('aiProcessedCanvas'),
    rawCtx: null, procCtx: null, 
    time: 0, animId: null, isRunning: false,
    
    // متغيرات التتبع والميكاترونكس
    isEngaged: false, 
    eyeX: 0, eyeY: 0, 
    trackX: 0, trackY: 0, 
    saccadeOffsetX: 0, saccadeOffsetY: 0,
    
    init() { 
        this.rawCtx = this.rawCanvas.getContext('2d'); 
        this.procCtx = this.procCanvas.getContext('2d'); 
        this.resize(); 
        window.addEventListener('resize', () => { if(this.isRunning) this.resize(); }); 
        this.initialized = true; 
    },
    
    start() { 
        this.isRunning = true; 
        this.resize(); 
        // توسيط مبدئي
        this.eyeX = this.rawCanvas.width / 2;
        this.eyeY = this.rawCanvas.height / 2;
        this.trackX = this.eyeX;
        this.trackY = this.eyeY;
        this.animate(); 
    },
    
    stop() { 
        this.isRunning = false; 
        cancelAnimationFrame(this.animId); 
    },
    
    resize() { 
        if(this.rawCanvas.parentElement) {
            this.rawCanvas.width = this.rawCanvas.parentElement.clientWidth; 
            this.rawCanvas.height = this.rawCanvas.parentElement.clientHeight; 
            this.procCanvas.width = this.procCanvas.parentElement.clientWidth; 
            this.procCanvas.height = this.procCanvas.parentElement.clientHeight; 
        }
    },
    
    // زر التفعيل (Engage Button)
    process() { 
        this.isEngaged = !this.isEngaged; 
        const log = document.getElementById('ai-log');
        const btn = document.querySelector('button[onclick="simAI.process()"]');
        
        if(this.isEngaged) {
            log.innerHTML = `<span class="text-cyan-400">> AUTO-TRACKING ENGAGED. INITIALIZING MOTORS...</span>`;
            btn.innerHTML = "إيقاف التتبع (STANDBY)";
            btn.className = "w-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 font-black text-base md:text-xl py-3 md:py-5 rounded-xl transition shadow-inner";
        } else {
            log.innerHTML = `> SYSTEM STANDBY. PRESS ENGAGE...`;
            btn.innerHTML = "تفعيل التتبع الآلي";
            btn.className = "w-full bg-cyan-600 hover:bg-cyan-500 text-black font-black text-base md:text-xl py-3 md:py-5 rounded-xl transition shadow-[0_0_20px_rgba(0,240,255,0.4)]";
        }
    },
    
    animate() {
        if(!this.isRunning) return;
        this.time += 0.05; 
        const w = this.rawCanvas.width; const h = this.rawCanvas.height; 
        const cx = w/2; const cy = h/2;
        
        // 1. محاكاة حركة عين المريض (Saccades & Micro-saccades)
        // حركة هادئة مستمرة
        let targetEyeX = cx + Math.sin(this.time * 0.6) * (w * 0.15) + Math.sin(this.time * 10) * 1.5; 
        let targetEyeY = cy + Math.cos(this.time * 0.4) * (h * 0.1) + Math.cos(this.time * 12) * 1.5;
        
        // حركة فجائية (رمشة أو حركة عين سريعة)
        if(Math.random() < 0.02) {
            this.saccadeOffsetX = (Math.random() - 0.5) * 40;
            this.saccadeOffsetY = (Math.random() - 0.5) * 40;
        }
        // تخميد الحركة الفجائية
        this.saccadeOffsetX *= 0.9;
        this.saccadeOffsetY *= 0.9;
        
        this.eyeX = targetEyeX + this.saccadeOffsetX;
        this.eyeY = targetEyeY + this.saccadeOffsetY;

        // ==========================================
        // الشاشة الأولى: الكاميرا الخام (RAW IR FEED)
        // ==========================================
        const cRaw = this.rawCtx; 
        cRaw.fillStyle = '#080808'; cRaw.fillRect(0, 0, w, h); // خلفية معتمة
        
        // رسم القزحية (Iris)
        const grd = cRaw.createRadialGradient(this.eyeX, this.eyeY, 10, this.eyeX, this.eyeY, 70);
        grd.addColorStop(0, '#1a1a1a'); 
        grd.addColorStop(0.6, '#111'); 
        grd.addColorStop(1, '#080808');
        cRaw.fillStyle = grd; cRaw.beginPath(); cRaw.arc(this.eyeX, this.eyeY, 70, 0, Math.PI*2); cRaw.fill();
        
        // رسم البؤبؤ (Pupil)
        cRaw.fillStyle = '#000'; cRaw.beginPath(); cRaw.arc(this.eyeX, this.eyeY, 22, 0, Math.PI*2); cRaw.fill();

        // انعكاسات الـ IR (Purkinje Reflections) - ضرورية للتتبع الآلي
        cRaw.fillStyle = 'rgba(255, 255, 255, 0.9)';
        cRaw.shadowBlur = 8; cRaw.shadowColor = 'rgba(255, 255, 255, 0.8)';
        cRaw.beginPath(); cRaw.arc(this.eyeX - 10, this.eyeY - 8, 2.5, 0, Math.PI*2); cRaw.fill();
        cRaw.beginPath(); cRaw.arc(this.eyeX + 12, this.eyeY + 6, 1.5, 0, Math.PI*2); cRaw.fill();
        cRaw.shadowBlur = 0;

        // ضوضاء الحساس (CCD Static Noise) لواقعية مذهلة
        cRaw.fillStyle = 'rgba(255,255,255,0.03)'; 
        for(let i=0; i<300; i++) cRaw.fillRect(Math.random()*w, Math.random()*h, 1.5, 1.5);


        // ==========================================
        // الشاشة الثانية: المعالجة الحاسوبية (PROCESSED FEED)
        // ==========================================
        const c = this.procCtx;
        
        if(!this.isEngaged) { 
            // وضع الاستعداد (Standby)
            c.clearRect(0, 0, w, h);
            c.fillStyle = 'rgba(0, 240, 255, 0.05)'; c.fillRect(0, 0, w, h);
            
            // شبكة الاستعداد
            c.strokeStyle = 'rgba(0, 240, 255, 0.1)'; c.lineWidth = 1;
            c.beginPath(); c.moveTo(cx, 0); c.lineTo(cx, h); c.stroke();
            c.beginPath(); c.moveTo(0, cy); c.lineTo(w, cy); c.stroke();
            c.beginPath(); c.arc(cx, cy, 40, 0, Math.PI*2); c.stroke();
            
        } 
        else {
            // رسم النسخة الخام أولاً (Copy Raw)
            c.drawImage(this.rawCanvas, 0, 0);
            
            // فلتر أزرق تقني
            c.fillStyle = 'rgba(0, 240, 255, 0.08)'; c.fillRect(0, 0, w, h);
            
            // خط المسح الراداري (Scanline)
            c.fillStyle = 'rgba(0, 240, 255, 0.15)'; 
            c.fillRect(0, (this.time * 60) % h, w, 3);

            // حسابات الميكاترونكس (اللحاق بالهدف)
            let dx = this.eyeX - this.trackX; 
            let dy = this.eyeY - this.trackY; 
            // 0.15 تمثل سرعة استجابة المحركات الحقيقية
            this.trackX += dx * 0.15; 
            this.trackY += dy * 0.15; 

            let dist = Math.sqrt(dx*dx + dy*dy); 
            let locked = dist < 4; // Tolerance threshold

            // تحديث السجل الحي (Live Log)
            const log = document.getElementById('ai-log');
            if(locked) { 
                log.innerHTML = `<span class="text-green-400 font-bold">> TARGET LOCKED. ALIGNMENT: 100%<br>> MOTORS STABILIZED. READY TO FIRE.</span>`; 
                c.strokeStyle = '#39ff14'; c.shadowColor = '#39ff14'; 
            } else { 
                log.innerHTML = `<span class="text-cyan-400">> TRACKING... OFFSET X:<span class="text-white">${Math.abs(dx).toFixed(1)}</span> Y:<span class="text-white">${Math.abs(dy).toFixed(1)}</span><br>> ADJUSTING MOTORS...</span>`; 
                c.strokeStyle = '#00f0ff'; c.shadowColor = '#00f0ff'; 
            }
            
            // رسم واجهة الـ HUD
            c.lineWidth = 2; c.shadowBlur = 12;
            let tx = this.trackX; let ty = this.trackY;

            // رسم أقواس التتبع (تصغر وتهتز أثناء التتبع، وتثبت عند الإغلاق)
            const b = locked ? 30 : 40 + Math.sin(this.time * 20) * 3; 
            const l = 12; // طول حافة القوس
            
            c.beginPath(); c.moveTo(tx-b, ty-b+l); c.lineTo(tx-b, ty-b); c.lineTo(tx-b+l, ty-b); c.stroke(); // Top Left
            c.beginPath(); c.moveTo(tx+b, ty-b+l); c.lineTo(tx+b, ty-b); c.lineTo(tx+b-l, ty-b); c.stroke(); // Top Right
            c.beginPath(); c.moveTo(tx-b, ty+b-l); c.lineTo(tx-b, ty+b); c.lineTo(tx-b+l, ty+b); c.stroke(); // Bottom Left
            c.beginPath(); c.moveTo(tx+b, ty+b-l); c.lineTo(tx+b, ty+b); c.lineTo(tx+b-l, ty+b); c.stroke(); // Bottom Right

            // رسم مؤشر التصويب (Crosshair)
            c.lineWidth = 1;
            c.beginPath(); c.moveTo(tx-6, ty); c.lineTo(tx+6, ty); c.stroke();
            c.beginPath(); c.moveTo(tx, ty-6); c.lineTo(tx, ty+6); c.stroke();

            // رسم دائرة تحديد البؤبؤ
            c.beginPath(); c.arc(tx, ty, 22, 0, Math.PI*2); c.stroke();
            
            // خط التوجيه من المركز (Targeting Vector)
            if(!locked) {
                c.strokeStyle = 'rgba(0, 240, 255, 0.4)';
                c.setLineDash([4, 4]);
                c.beginPath(); c.moveTo(cx, cy); c.lineTo(tx, ty); c.stroke();
                c.setLineDash([]);
            }
            
            c.shadowBlur = 0;
        }
        
        this.animId = requestAnimationFrame(this.animate.bind(this));
    }
};
