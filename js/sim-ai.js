// ==========================================
// محاكي التتبع الآلي 3D (AI Auto-Tracking)
// ==========================================

const simAI = {
    rawCanvas: null,
    rawCtx: null,
    procCanvas: null,
    procCtx: null,
    
    isTracking: false,
    animationId: null,
    time: 0,
    
    // إحداثيات العين العشوائية
    eyeX: 0,
    eyeY: 0,

    init() {
        this.rawCanvas = document.getElementById('aiRawCanvas');
        this.procCanvas = document.getElementById('aiProcessedCanvas');
        
        if (!this.rawCanvas || !this.procCanvas) return;

        this.rawCtx = this.rawCanvas.getContext('2d');
        this.procCtx = this.procCanvas.getContext('2d');

        this.resize();
        window.addEventListener('resize', () => this.resize());

        // بدء الحركة المستمرة
        this.animate();
    },

    resize() {
        // ضبط الأبعاد
        const rawRect = this.rawCanvas.parentElement.getBoundingClientRect();
        this.rawCanvas.width = rawRect.width;
        this.rawCanvas.height = rawRect.height;

        const procRect = this.procCanvas.parentElement.getBoundingClientRect();
        this.procCanvas.width = procRect.width;
        this.procCanvas.height = procRect.height;
    },

    toggleTracking() {
        this.isTracking = !this.isTracking;
        const btn = document.getElementById('btn-track'); // تأكد ان زر التتبع بالـ HTML عنده هذا الـ ID
        
        // إذا الزر ما عنده ID 'btn-track'، راح يحاول يبحث عنه بالكلاس
        if(!btn) return;

        if (this.isTracking) {
            btn.innerHTML = 'إلغاء التتبع ⏹';
            btn.className = 'w-full bg-cyan-600 text-black font-black text-xl md:text-3xl py-4 md:py-6 rounded-2xl transition-all shadow-[0_0_30px_rgba(0,240,255,0.4)] border-2 border-cyan-400';
        } else {
            btn.innerHTML = 'تفعيل التتبع الآلي (Auto-Tracking)';
            btn.className = 'w-full bg-slate-800 text-slate-300 font-black text-xl md:text-3xl py-4 md:py-6 rounded-2xl border-2 border-slate-600 transition-all hover:border-cyan-500';
        }
    },

    drawEye(ctx, x, y, alpha = 1) {
        ctx.globalAlpha = alpha;
        
        // القزحية (داكنة)
        ctx.beginPath();
        ctx.arc(x, y, 40, 0, Math.PI * 2);
        ctx.fillStyle = '#0f172a';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#1e293b';
        ctx.stroke();

        // البؤبؤ (أسود)
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fillStyle = '#000000';
        ctx.fill();

        // لمعة العين 
        ctx.beginPath();
        ctx.arc(x + 5, y - 5, 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();
        
        ctx.globalAlpha = 1;
    },

    animate() {
        if (!this.rawCanvas || !this.procCanvas) return;

        const rw = this.rawCanvas.width;
        const rh = this.rawCanvas.height;
        const pw = this.procCanvas.width;
        const ph = this.procCanvas.height;

        this.rawCtx.clearRect(0, 0, rw, rh);
        this.procCtx.clearRect(0, 0, pw, ph);

        // حركة العين مستمرة ولا تتوقف أبداً
        this.time += 0.04;
        const centerX = rw / 2;
        const centerY = rh / 2;
        
        const offsetX = Math.sin(this.time) * (rw * 0.25) + Math.cos(this.time * 3.5) * 5;
        const offsetY = Math.cos(this.time * 0.8) * (rh * 0.2) + Math.sin(this.time * 4.2) * 5;
        
        this.eyeX = centerX + offsetX;
        this.eyeY = centerY + offsetY;

        /* ================================================= */
        /* الشاشة 1 (اليسار): الكاميرا الخام المستمرة        */
        /* ================================================= */
        
        // العين ترسم دائماً وتتحرك
        this.drawEye(this.rawCtx, this.eyeX, this.eyeY);

        if (this.isTracking) {
            // المربع السماوي يلاحق العين أينما ذهبت
            this.rawCtx.strokeStyle = '#00f0ff';
            this.rawCtx.lineWidth = 2;
            this.rawCtx.strokeRect(this.eyeX - 50, this.eyeY - 50, 100, 100);
            
            // علامة الاستهداف
            this.rawCtx.beginPath();
            this.rawCtx.moveTo(this.eyeX - 10, this.eyeY);
            this.rawCtx.lineTo(this.eyeX + 10, this.eyeY);
            this.rawCtx.moveTo(this.eyeX, this.eyeY - 10);
            this.rawCtx.lineTo(this.eyeX, this.eyeY + 10);
            this.rawCtx.stroke();
        }

        /* ================================================= */
        /* الشاشة 2 (اليمين): الشاشة المعالجة               */
        /* ================================================= */
        const pCenterX = pw / 2;
        const pCenterY = ph / 2;

        if (this.isTracking) {
            // عندما يتفعل التتبع، تظهر العين ثابتة في المنتصف
            this.drawEye(this.procCtx, pCenterX, pCenterY);
            
            this.procCtx.strokeStyle = '#22c55e'; // أخضر
            this.procCtx.lineWidth = 1.5;
            this.procCtx.beginPath();
            this.procCtx.arc(pCenterX, pCenterY, 60, 0, Math.PI * 2);
            this.procCtx.stroke();
            this.procCtx.beginPath();
            this.procCtx.arc(pCenterX, pCenterY, 70, 0, Math.PI * 2);
            this.procCtx.stroke();

            this.procCtx.fillStyle = '#22c55e';
            this.procCtx.font = 'bold 16px monospace';
            this.procCtx.fillText('LOCKED', 20, 30);
            this.procCtx.font = '12px monospace';
            this.procCtx.fillText('DSP ALIGNMENT: 100%', 20, 50);

        } else {
            // الشاشة فارغة (نص خفيف يوضح انه لا توجد إشارة)
            this.procCtx.fillStyle = '#334155';
            this.procCtx.font = 'bold 16px monospace';
            this.procCtx.fillText('NO SIGNAL', pCenterX - 45, pCenterY);
            this.procCtx.font = '12px monospace';
            this.procCtx.fillText('AWAITING AI TRACKING...', pCenterX - 75, pCenterY + 20);
        }

        this.animationId = requestAnimationFrame(() => this.animate());
    }
};

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => { simAI.init(); }, 500);
});
