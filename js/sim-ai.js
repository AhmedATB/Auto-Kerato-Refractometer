const simAI = {
    initialized: false, rawCanvas: document.getElementById('aiRawCanvas'), procCanvas: document.getElementById('aiProcessedCanvas'),
    rawCtx: null, procCtx: null, time: 0, animId: null, trackingActive: false, eyeX: 0, eyeY: 0, trackX: 0, trackY: 0, isRunning: false,
    
    init() { 
        this.rawCtx = this.rawCanvas.getContext('2d'); 
        this.procCtx = this.procCanvas.getContext('2d'); 
        this.resize(); 
        window.addEventListener('resize', () => { if(this.isRunning) this.resize(); }); 
        this.initialized = true; 
    },
    start() { this.isRunning = true; this.resize(); this.animate(); },
    stop() { this.isRunning = false; cancelAnimationFrame(this.animId); },
    
    resize() { 
        if(this.rawCanvas.parentElement) {
            this.rawCanvas.width = this.rawCanvas.parentElement.clientWidth; this.rawCanvas.height = 250; 
            this.procCanvas.width = this.procCanvas.parentElement.clientWidth; this.procCanvas.height = 250; 
        }
    },
    
    process() { 
        this.trackingActive = true; 
        document.getElementById('ai-log').innerText = "> AUTO-TRACKING ENGAGED..."; 
    },
    
    animate() {
        if(!this.isRunning) return;
        this.time += 0.05; 
        const w = this.rawCanvas.width; const h = this.rawCanvas.height; const cx = w/2; const cy = h/2;
        
        // محاكاة حركة عين المريض (حركة واسعة + اهتزاز مجهري)
        this.eyeX = cx + Math.sin(this.time * 0.8) * 50 + Math.sin(this.time * 15) * 2; 
        this.eyeY = cy + Math.cos(this.time * 0.6) * 30 + Math.cos(this.time * 12) * 2;

        // ==========================================
        // 1. رسم الكاميرا الخام (RAW FEED)
        // ==========================================
        const cRaw = this.rawCtx; 
        cRaw.fillStyle = '#050505'; cRaw.fillRect(0, 0, w, h);
        
        // رسم القزحية (Iris)
        const grd = cRaw.createRadialGradient(this.eyeX, this.eyeY, 10, this.eyeX, this.eyeY, 80);
        grd.addColorStop(0, '#111'); grd.addColorStop(0.5, '#1a1a1a'); grd.addColorStop(1, '#050505');
        cRaw.fillStyle = grd; cRaw.beginPath(); cRaw.arc(this.eyeX, this.eyeY, 80, 0, Math.PI*2); cRaw.fill();
        
        // رسم البؤبؤ (Pupil)
        cRaw.fillStyle = '#000'; cRaw.beginPath(); cRaw.arc(this.eyeX, this.eyeY, 25, 0, Math.PI*2); cRaw.fill();

        // انعكاسات الـ IR (Purkinje Reflections) - ضرورية للتتبع الآلي
        cRaw.fillStyle = 'rgba(255, 255, 255, 0.8)';
        cRaw.shadowBlur = 5; cRaw.shadowColor = '#fff';
        cRaw.beginPath(); cRaw.arc(this.eyeX - 12, this.eyeY - 8, 3, 0, Math.PI*2); cRaw.fill();
        cRaw.beginPath(); cRaw.arc(this.eyeX + 15, this.eyeY + 5, 2, 0, Math.PI*2); cRaw.fill();
        cRaw.shadowBlur = 0;

        // ضوضاء الحساس (CCD Noise)
        cRaw.fillStyle = 'rgba(255,255,255,0.04)'; 
        for(let i=0; i<350; i++) cRaw.fillRect(Math.random()*w, Math.random()*h, 2, 2);

        // ==========================================
        // 2. رسم المعالجة الحاسوبية (PROCESSED FEED)
        // ==========================================
        const c = this.procCtx;
        if(!this.trackingActive) { 
            c.fillStyle = '#000'; c.fillRect(0, 0, w, h); 
            c.fillStyle = '#1e293b'; c.font = "bold 14px monospace"; c.textAlign = "center"; 
            c.fillText("SYSTEM STANDBY. PRESS ENGAGE.", cx, cy); 
        } 
        else {
            const log = document.getElementById('ai-log');
            c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(0, 0, w, h); // تأثير التلاشي (Trails)
            
            // خط المسح الراداري (Scanline)
            c.fillStyle = 'rgba(0, 240, 255, 0.15)'; 
            c.fillRect(0, (this.time * 50) % h, w, 4);

            // حسابات الميكاترونكس (اللحاق بالهدف)
            let dx = this.eyeX - this.trackX; 
            let dy = this.eyeY - this.trackY; 
            this.trackX += dx * 0.15; // Motor speed simulation
            this.trackY += dy * 0.15; 

            let dist = Math.sqrt(dx*dx + dy*dy); 
            let locked = dist < 5; 

            // تحديث السجل الحي (Live Log)
            if(locked) { 
                log.innerHTML = "> TARGET LOCKED. ALIGNMENT: 100%<br>> MOTORS STABILIZED. READY TO FIRE."; 
                c.strokeStyle = '#ff003c'; c.shadowColor = '#ff003c'; 
            } else { 
                log.innerHTML = `> TRACKING... OFFSET X:${Math.abs(dx).toFixed(1)} Y:${Math.abs(dy).toFixed(1)}<br>> ADJUSTING MOTORS...`; 
                c.strokeStyle = '#39ff14'; c.shadowColor = '#39ff14'; 
            }
            
            c.lineWidth = 2; c.shadowBlur = 10;
            let tx = this.trackX; let ty = this.trackY;

            // رسم أقواس التتبع (تصغر عند الإغلاق Locked)
            const b = locked ? 35 : 45; 
            const l = 15;
            c.beginPath(); c.moveTo(tx-b, ty-b+l); c.lineTo(tx-b, ty-b); c.lineTo(tx-b+l, ty-b); c.stroke(); // Top Left
            c.beginPath(); c.moveTo(tx+b, ty-b+l); c.lineTo(tx+b, ty-b); c.lineTo(tx+b-l, ty-b); c.stroke(); // Top Right
            c.beginPath(); c.moveTo(tx-b, ty+b-l); c.lineTo(tx-b, ty+b); c.lineTo(tx-b+l, ty+b); c.stroke(); // Bottom Left
            c.beginPath(); c.moveTo(tx+b, ty+b-l); c.lineTo(tx+b, ty+b); c.lineTo(tx+b-l, ty+b); c.stroke(); // Bottom Right

            // رسم مؤشر التصويب (Crosshair)
            c.beginPath(); c.moveTo(tx-8, ty); c.lineTo(tx+8, ty); c.stroke();
            c.beginPath(); c.moveTo(tx, ty-8); c.lineTo(tx, ty+8); c.stroke();

            // رسم دائرة تحديد البؤبؤ
            c.beginPath(); c.arc(tx, ty, 25, 0, Math.PI*2); c.stroke();
            
            c.shadowBlur = 0;
        }
        
        this.animId = requestAnimationFrame(this.animate.bind(this));
    }
};
