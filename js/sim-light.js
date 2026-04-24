class Particle {
    constructor(x, y, vx, vy, color, glow) { 
        this.x = x; this.y = y; this.vx = vx; this.vy = vy; 
        this.color = color; this.glow = glow; this.life = 1.0; 
        this.state = 'outgoing'; // 'outgoing', 'inside_eye', 'returning', 'to_sensor'
    }
    update() { 
        this.x += this.vx; 
        this.y += this.vy; 
        this.life -= 0.003; // عمر أطول للجسيمات
    }
    draw(c) { 
        if(this.life <= 0) return; 
        c.globalAlpha = this.life; 
        c.shadowBlur = this.glow; c.shadowColor = this.color; 
        c.fillStyle = this.color; 
        c.beginPath(); c.arc(this.x, this.y, 2.5, 0, Math.PI*2); c.fill(); 
        c.globalAlpha = 1.0; c.shadowBlur = 0; 
    }
}

const simLight = {
    initialized: false, canvas: document.getElementById('lightPathCanvas'), ctx: null, 
    time: 0, animId: null, foggingOn: false, firing: false, particles: [], 
    lensCurrentX: 0, eyeLensThick: 18, isRunning: false, currentReading: "STANDBY",

    init() { 
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
        }
    },
    
    toggleFogging() {
        this.foggingOn = !this.foggingOn;
        document.getElementById('btn-fogging').innerText = this.foggingOn ? "مفعّل (تشويش الهدف)" : "مغلق (الهدف واضح)";
        document.getElementById('btn-fogging').className = this.foggingOn ? "text-green-400 font-bold" : "text-red-400 font-bold";
        
        const physioBox = document.getElementById('fogging-explanation'); 
        const physioText = document.getElementById('physio-status');
        
        if(this.foggingOn) {
            physioBox.className = "mt-6 p-4 border-2 border-green-500/30 rounded-lg bg-green-950/20 transition-all duration-500";
            physioText.innerHTML = "<span class='text-green-400 font-bold'>عضلة العين مسترخية تماماً (Relaxed).</span><br><br>العدسة ابتعدت عن العين، المنطاد أصبح ضبابياً. الدماغ يئس من التوضيح فأرخى العضلات. <br><span class='text-xs text-cyan-300 font-mono'>*لاحظ تسطح عدسة العين الداخلية*</span>";
        } else {
            physioBox.className = "mt-6 p-4 border-2 border-amber-500/30 rounded-lg bg-amber-950/20 transition-all duration-500";
            physioText.innerHTML = "<span class='text-red-400 font-bold'>عضلة العين متشنجة (Accommodation).</span><br><br>العدسة اقتربت، المريض يرى المنطاد بوضوح، مما يجبر عينه على التركيز. <br><span class='text-xs text-amber-300 font-mono'>*لاحظ انتفاخ عدسة العين الداخلية*</span>";
        }
    },
    
    fireLaser() {
        if(this.firing) return; 
        this.firing = true; 
        this.currentReading = "CALCULATING...";
        
        let sldY = this.canvas.height / 2; 
        let sldX = this.canvas.width * 0.1;
        
        // إطلاق نبضة مكثفة
        for(let i=0; i<25; i++) { 
            setTimeout(() => { 
                let spread = (Math.random() - 0.5) * 8; // تشتت بسيط للواقعية
                this.particles.push(new Particle(sldX + 20, sldY + spread, 8, 0, '#ff003c', 20)); 
            }, i * 40); 
        }
        
        // استقرار القراءة النهائية
        setTimeout(() => { 
            this.firing = false; 
            this.currentReading = this.foggingOn ? "0.00 D (TRUE SPH)" : "-2.50 D (FAKE SPH)";
        }, 2200); 
    },
    
    animate() {
        if(!this.isRunning) return;
        const c = this.ctx; const w = this.canvas.width; const h = this.canvas.height;
        this.time += 0.05; 
        
        // تأثير التلاشي للجسيمات
        c.fillStyle = 'rgba(0, 0, 0, 0.35)'; c.fillRect(0, 0, w, h);
        
        // رسم شبكة القياس الهندسية
        c.strokeStyle = 'rgba(30, 41, 59, 0.5)'; c.lineWidth = 1; c.beginPath();
        for(let i=0; i<w; i+=40) { c.moveTo(i,0); c.lineTo(i,h); }
        for(let i=0; i<h; i+=40) { c.moveTo(0,i); c.lineTo(w,i); } c.stroke();
        
        const cy = h/2; 
        const sldX = w*0.1; 
        const mirrorX = w*0.4; 
        const eyeX = w*0.85; 
        const ccdY = h*0.85;
        
        // حسابات الحركة الميكانيكية للعدسة وتشنج العين
        const targetLensX = this.foggingOn ? w*0.45 : w*0.65;
        if(this.lensCurrentX === 0) this.lensCurrentX = targetLensX;
        this.lensCurrentX += (targetLensX - this.lensCurrentX) * 0.08;
        this.eyeLensThick += ((this.foggingOn ? 8 : 18) - this.eyeLensThick) * 0.08;

        // ==========================================
        // خطوط المسار البصري النظري (Optical Path Rails)
        // ==========================================
        c.setLineDash([5, 5]); c.strokeStyle = this.firing ? 'rgba(255, 0, 60, 0.3)' : 'rgba(51, 65, 85, 0.5)';
        c.beginPath(); c.moveTo(sldX, cy); c.lineTo(eyeX - 60, cy); c.stroke(); // من المصدر للعين
        c.strokeStyle = this.firing ? 'rgba(57, 255, 20, 0.3)' : 'rgba(51, 65, 85, 0.5)';
        c.beginPath(); c.moveTo(mirrorX, cy); c.lineTo(mirrorX, ccdY); c.stroke(); // من المرآة للحساس
        c.setLineDash([]);

        // ==========================================
        // فيزياء الجزيئات (Particle Physics Engine)
        // ==========================================
        for(let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i]; 
            p.update();
            
            // 1. اختراق القرنية والانكسار نحو الشبكية
            if(p.state === 'outgoing' && p.x >= eyeX - 60 && p.x < eyeX) { 
                p.state = 'inside_eye';
                p.vx = 4; // تبطئ داخل السائل الزجاجي
                // الانكسار يتأثر بسمك العدسة (Accommodation)
                let refractionAngle = (p.y - cy) * (this.eyeLensThick / 50);
                p.vy = -refractionAngle;
            }
            // 2. الاصطدام بالشبكية والارتداد
            else if(p.state === 'inside_eye' && p.x >= eyeX) {
                p.state = 'returning';
                p.vx = -6; // ارتداد سريع
                p.vy = 0; // تعود بشكل أفقي تقريباً
                p.color = '#39ff14'; // تتحول لأخضر (بيانات مقروءة)
                p.glow = 15;
            }
            // 3. الاصطدام بالمرآة النصف شفافة والنزول للحساس
            else if(p.state === 'returning' && p.x <= mirrorX + 5 && p.y < cy + 15) { 
                p.state = 'to_sensor';
                p.vx = 0; 
                p.vy = 8; // تنحرف للأسفل 90 درجة
            }
            
            // تحديث القراءة الحية بشكل جنوني أثناء سقوط البيانات على الحساس
            if(p.state === 'to_sensor' && p.y >= ccdY - 20) {
                let liveNoise = (Math.random() * -3.0).toFixed(2);
                this.currentReading = `DSP: ${liveNoise} D`;
            }

            p.draw(c); 
            if(p.life <= 0 || p.y > h) this.particles.splice(i, 1);
        }

        // ==========================================
        // رسم العتاد الصلب (Hardware Components)
        // ==========================================
        // 1. SLD Source
        c.shadowBlur = 15; c.shadowColor = '#ff003c'; 
        c.fillStyle = '#0f172a'; c.strokeStyle = '#ff003c'; c.lineWidth = 2; 
        c.fillRect(sldX-25, cy-25, 50, 50); c.strokeRect(sldX-25, cy-25, 50, 50);
        c.shadowBlur = 0; c.fillStyle = '#fff'; c.font = 'bold 12px monospace'; c.fillText('SLD', sldX - 10, cy+45);

        // 2. Beam Splitter (المرآة)
        c.shadowColor = '#00f0ff'; c.shadowBlur = 10; c.strokeStyle = '#00f0ff'; c.lineWidth = 3;
        c.beginPath(); c.moveTo(mirrorX-25, cy-25); c.lineTo(mirrorX+25, cy+25); c.stroke();
        c.fillStyle = 'rgba(0, 240, 255, 0.15)'; 
        c.beginPath(); c.moveTo(mirrorX-25, cy-25); c.lineTo(mirrorX+25, cy+25); c.lineTo(mirrorX+25, cy+15); c.lineTo(mirrorX-15, cy-25); c.fill();
        
        // 3. Fogging Lens
        c.shadowColor = '#fff'; c.shadowBlur = 8; c.fillStyle = 'rgba(255, 255, 255, 0.2)'; c.strokeStyle = '#fff'; c.lineWidth = 2;
        c.beginPath(); c.ellipse(this.lensCurrentX, cy, 8, 45, 0, 0, Math.PI*2); c.fill(); c.stroke(); 
        c.shadowBlur = 0; c.fillStyle = '#94a3b8'; c.fillText('FOG LENS', this.lensCurrentX - 25, cy + 65);

        // 4. CCD Sensor
        c.shadowColor = '#39ff14'; c.shadowBlur = 15; 
        c.fillStyle = '#050a15'; c.strokeStyle = '#39ff14'; 
        c.fillRect(mirrorX-45, ccdY-10, 90, 20); c.strokeRect(mirrorX-45, ccdY-10, 90, 20); 
        c.shadowBlur = 0; c.fillStyle = '#39ff14'; c.fillText('CCD SENSOR', mirrorX-35, ccdY+25);
        
        // Live Sensor Readout
        c.fillStyle = this.foggingOn ? '#00f0ff' : '#ffaa00';
        c.fillText(this.currentReading, mirrorX-40, ccdY - 20);

        // 5. Target (Balloon)
        c.save(); 
        if(this.foggingOn) { c.filter = 'blur(5px)'; } // التغويش الحقيقي
        let targetX = eyeX - 110;
        c.fillStyle = '#ef4444'; c.beginPath(); c.arc(targetX, cy - 15, 15, 0, Math.PI*2); c.fill(); // Balloon
        c.fillStyle = '#f59e0b'; c.beginPath(); c.moveTo(targetX, cy); c.lineTo(targetX+5, cy+10); c.lineTo(targetX-5, cy+10); c.fill(); // Basket
        c.restore(); 
        c.fillStyle = '#64748b'; c.fillText('TARGET', targetX - 18, cy + 25);

        // ==========================================
        // رسم عين المريض (Patient Eye)
        // ==========================================
        // Sclera/Retina
        c.fillStyle = '#0f172a'; c.strokeStyle = '#475569'; c.lineWidth = 3; 
        c.beginPath(); c.arc(eyeX, cy, 60, 0, Math.PI*2); c.fill(); c.stroke();
        
        // Cornea
        c.shadowBlur = 10; c.shadowColor = '#00f0ff'; c.strokeStyle = '#00f0ff'; c.lineWidth = 4;
        c.beginPath(); c.arc(eyeX-60, cy, 25, Math.PI*-0.4, Math.PI*0.4, false); c.stroke();
        
        // Crystalline Lens (Accommodation Physics)
        c.shadowBlur = 0;
        c.fillStyle = this.foggingOn ? 'rgba(57,255,20,0.15)' : 'rgba(255,0,60,0.15)'; 
        c.strokeStyle = this.foggingOn ? '#39ff14' : '#ff003c'; c.lineWidth = 2;
        c.beginPath(); c.ellipse(eyeX-35, cy, this.eyeLensThick, 24, 0, 0, Math.PI*2); c.fill(); c.stroke();

        this.animId = requestAnimationFrame(this.animate.bind(this));
    }
};
