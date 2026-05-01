// === MODULE: 3D AUTO-TRACKING ENGINE (X, Y, Z ALIGNMENT) ===
const simTracking = {
    initialized: false, 
    canvas: document.getElementById('trackingCanvas'), // تأكد أن عندك كانفاس بهذا الـ ID
    ctx: null, 
    isRunning: false, 
    animId: null,
    time: 0,
    
    isTracking: false, // الدالة السحرية اللي تشغل وتطفي التتبع
    
    // إحداثيات عين المريض الحقيقية (تتحرك عشوائياً)
    eyeX: 0, eyeY: 0, eyeZ: 12.0, 
    
    // إحداثيات عدسة الجهاز والمؤشر (تلحق العين)
    targetX: 0, targetY: 0, targetZ: 12.0, 

    init() { 
        if(!this.canvas) return; // إذا ماكو كانفاس لا تسوي شي
        this.ctx = this.canvas.getContext('2d'); 
        this.resize(); 
        window.addEventListener('resize', () => { if(this.isRunning) this.resize(); }); 
        this.initialized = true; 
    },
    
    start() { this.isRunning = true; this.animate(); },
    stop() { this.isRunning = false; cancelAnimationFrame(this.animId); },
    
    resize() { 
        if(this.canvas.parentElement) {
            this.canvas.width = this.canvas.parentElement.clientWidth; 
            this.canvas.height = this.canvas.parentElement.clientHeight; 
            this.targetX = this.canvas.width / 2;
            this.targetY = this.canvas.height / 2;
        }
    },
    
    // دالة الزر اللي راح تستدعيها من الـ HTML
    toggleTracking() {
        this.isTracking = !this.isTracking; // نعكس الحالة فقط، ما نوقف المحرك!
        
        const btn = document.getElementById('btn-tracking');
        if (btn) {
            if(this.isTracking) {
                btn.className = "w-full bg-green-900/50 hover:bg-green-800 border border-green-500 text-green-400 font-bold py-3 rounded-xl shadow-[0_0_15px_rgba(57,255,20,0.4)] transition-all";
                btn.innerHTML = "🎯 نظام التتبع: قفل آلي (LOCKED)";
            } else {
                btn.className = "w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 font-bold py-3 rounded-xl transition-all";
                btn.innerHTML = "🕹️ نظام التتبع: يدوي (MANUAL)";
            }
        }
    },

    animate() {
        if(!this.isRunning) return; // المحرك شغال دائمًا
        this.time += 0.05; 
        this.draw();
        this.animId = requestAnimationFrame(this.animate.bind(this));
    },

    draw() {
        const c = this.ctx; const w = this.canvas.width; const h = this.canvas.height;
        const cx = w / 2; const cy = h / 2;
        
        // 1. فيزياء حركة المريض (اهتزاز وتصحيح)
        // حركة X و Y (يمين/يسار وأعلى/أسفل)
        this.eyeX = cx + Math.sin(this.time * 0.7) * 40 + Math.cos(this.time * 1.3) * 20;
        this.eyeY = cy + Math.cos(this.time * 0.9) * 30 + Math.sin(this.time * 1.5) * 15;
        // حركة Z (اقتراب وابتعاد المريض عن الجهاز - Vertex Distance)
        this.eyeZ = 12 + Math.sin(this.time * 1.2) * 3; 

        // 2. منطق التتبع (The Tracking Logic)
        if (this.isTracking) {
            // الجهاز يلحق المريض بسرعة (Lerp smoothing)
            this.targetX += (this.eyeX - this.targetX) * 0.15;
            this.targetY += (this.eyeY - this.targetY) * 0.15;
            this.targetZ += (this.eyeZ - this.targetZ) * 0.15;
        } else {
            // الجهاز يرجع للسنتر (الوضع اليدوي)
            this.targetX += (cx - this.targetX) * 0.05;
            this.targetY += (cy - this.targetY) * 0.05;
            this.targetZ += (12 - this.targetZ) * 0.05;
        }

        // مسح الشاشة ورسم الخلفية
        c.fillStyle = '#02050f'; c.fillRect(0, 0, w, h);
        c.strokeStyle = 'rgba(255, 255, 255, 0.05)'; c.lineWidth = 1;
        c.beginPath(); c.moveTo(cx, 0); c.lineTo(cx, h); c.stroke();
        c.beginPath(); c.moveTo(0, cy); c.lineTo(w, cy); c.stroke();

        // 3. رسم بؤبؤ المريض (الهدف)
        c.fillStyle = '#0a0f1c'; c.strokeStyle = '#334155'; c.lineWidth = 4;
        c.beginPath(); c.arc(this.eyeX, this.eyeY, 40, 0, Math.PI*2); c.fill(); c.stroke();
        c.fillStyle = '#1e293b'; c.beginPath(); c.arc(this.eyeX, this.eyeY, 15, 0, Math.PI*2); c.fill(); // بؤبؤ أسود

        // 4. رسم مؤشر الجهاز (The Crosshair)
        // اللون أخضر إذا مقفول، أحمر إذا المريض بعيد والوضع يدوي
        let dx = Math.abs(this.eyeX - this.targetX);
        let dy = Math.abs(this.eyeY - this.targetY);
        let isLocked = dx < 5 && dy < 5 && this.isTracking;
        
        let color = isLocked ? '#39ff14' : (this.isTracking ? '#ffaa00' : '#ff003c');
        let crossSize = 30; // حجم المؤشر يعكس البعد البؤري (Z)

        c.strokeStyle = color; c.lineWidth = 2; c.shadowBlur = 10; c.shadowColor = color;
        
        // رسم المربع
        c.strokeRect(this.targetX - crossSize, this.targetY - crossSize, crossSize*2, crossSize*2);
        
        // رسم خطوط التصويب
        c.beginPath(); c.moveTo(this.targetX - crossSize - 10, this.targetY); c.lineTo(this.targetX - 5, this.targetY); c.stroke();
        c.beginPath(); c.moveTo(this.targetX + crossSize + 10, this.targetY); c.lineTo(this.targetX + 5, this.targetY); c.stroke();
        c.beginPath(); c.moveTo(this.targetX, this.targetY - crossSize - 10); c.lineTo(this.targetX, this.targetY - 5); c.stroke();
        c.beginPath(); c.moveTo(this.targetX, this.targetY + crossSize + 10); c.lineTo(this.targetX, this.targetY + 5); c.stroke();

        // 5. شاشة البيانات الحية (HUD)
        c.shadowBlur = 0; c.fillStyle = color; c.font = 'bold 12px monospace';
        c.fillText(`X-OFFSET: ${(this.eyeX - this.targetX).toFixed(1)} mm`, 10, 20);
        c.fillText(`Y-OFFSET: ${(this.eyeY - this.targetY).toFixed(1)} mm`, 10, 40);
        
        // مسافة الـ Vertex
        c.fillStyle = Math.abs(this.eyeZ - 12) < 0.5 ? '#39ff14' : '#ffaa00';
        c.fillText(`Z-VERTEX: ${this.eyeZ.toFixed(2)} mm (Target: 12.00)`, 10, 60);

        if (isLocked) {
            c.fillStyle = '#39ff14';
            c.fillText('ALIGNMENT PERFECT. READY TO FIRE.', cx - 120, h - 20);
        }
    }
};
