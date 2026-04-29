// === MODULE: AUTO-FOGGING & LIGHT PATH SIMULATOR (PREMIUM UPGRADE) ===

const simLight = {
    initialized: false, 
    canvas: document.getElementById('lightPathCanvas'), 
    ctx: null, 
    time: 0, animId: null, isRunning: false,
    
    // متغيرات الحالة
    foggingOn: false, 
    isFiring: false, 
    fireProgress: 0, // من 0 إلى 1 للتحكم بنبضة الليزر
    
    // متغيرات الحركة الميكانيكية
    lensCurrentX: 0, 
    eyeLensThick: 18, 
    currentReading: "SYSTEM STANDBY",

    init() { 
        this.ctx = this.canvas.getContext('2d'); 
        this.resize(); 
        window.addEventListener('resize', () => { if(this.isRunning) this.resize(); }); 
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
    
    // دالة زر التضبيب
    toggleFogging() {
        this.foggingOn = !this.foggingOn;
        const btn = document.getElementById('btn-fogging');
        const physioStatus = document.getElementById('physio-status');
        
        if (this.foggingOn) {
            btn.innerText = "مفعّل (الهدف ضبابي)";
            btn.className = "text-green-400 font-bold drop-shadow-[0_0_8px_rgba(57,255,20,0.6)]";
            physioStatus.innerHTML = "<span class='text-green-400 font-bold'>عضلة العين مسترخية (Relaxed).</span><br>الهدف ابتعد وأصبح ضبابياً (Optical Infinity). الدماغ توقف عن محاولة التركيز، فتسطحت عدسة العين الداخلية استعداداً للقياس الحقيقي.";
        } else {
            btn.innerText = "مغلق (الهدف واضح)";
            btn.className = "text-red-400 font-bold drop-shadow-[0_0_8px_rgba(255,0,0,0.6)]";
            physioStatus.innerHTML = "<span class='text-red-400 font-bold'>عضلة العين متشنجة (Accommodation).</span><br>الهدف قريب وواضح، المريض يركز عليه لا إرادياً مما يؤدي لانتفاخ عدسة العين (قصر نظر كاذب).";
        }
    },
    
    // دالة إطلاق إشعاع القياس
    fireLaser() {
        if(this.isFiring) return; 
        this.isFiring = true; 
        this.fireProgress = 0;
        this.currentReading = "CALCULATING DSP MATRIX...";
        
        // تأثير الزر
        const btn = document.querySelector('button[onclick="simLight.fireLaser()"]');
        btn.classList.add('bg-cyan-400', 'text-black', 'scale-95');
        setTimeout(() => btn.classList.remove('bg-cyan-400', 'text-black', 'scale-95'), 150);
        
        // إنهاء النبضة بعد 2.5 ثانية
        setTimeout(() => { 
            this.isFiring = false; 
            this.fireProgress = 0;
            this.currentReading = this.foggingOn ? "TRUE REFRACTION: 0.00 D" : "FAKE MYOPIA: -2.50 D";
        }, 2500); 
    },
    
    animate() {
        if(!this.isRunning) return;
        const c = this.ctx; const w = this.canvas.width; const h = this.canvas.height;
        this.time += 0.05; 
        
        // 1. مسح الشاشة ورسم الخلفية التقنية
        c.fillStyle = '#02050f'; c.fillRect(0, 0, w, h);
        
        // رسم شبكة (Grid)
        c.strokeStyle = 'rgba(0, 240, 255, 0.05)'; c.lineWidth = 1;
        c.beginPath();
        for(let i=0; i<w; i+=40) { c.moveTo(i,0); c.lineTo(i,h); }
        for(let i=0; i<h; i+=40) { c.moveTo(0,i); c.lineTo(w,i); }
        c.stroke();
        
        // إحداثيات القطع الهندسية
        const cy = h/2; 
        const sldX = w*0.1; 
        const mirrorX = w*0.35; 
        const eyeX = w*0.85; 
        const ccdY = h*0.85;
        
        // ديناميكية الحركة الميكانيكية والفسيولوجية
        const targetLensX = this.foggingOn ? w*0.55 : w*0.45;
        if(this.lensCurrentX === 0) this.lensCurrentX = targetLensX;
        
        // معادلات الانسيابية (Lerp)
        this.lensCurrentX += (targetLensX - this.lensCurrentX) * 0.08; // حركة عدسة الجهاز
        this.eyeLensThick += ((this.foggingOn ? 8 : 18) - this.eyeLensThick) * 0.08; // سمك عدسة العين

        // ==========================================
        // 2. مسار إشعاع الليزر (The Laser Pulse Beam)
        // ==========================================
        if (this.isFiring) {
            this.fireProgress += 0.015; // سرعة تقدم الشعاع
            c.lineWidth = 3;
            c.lineCap = 'round';
            
            // المرحلة الأولى: الانطلاق من SLD إلى العين (لون أحمر IR)
            if (this.fireProgress > 0.1 && this.fireProgress < 0.6) {
                let beamEnd = sldX + (eyeX - sldX) * ((this.fireProgress - 0.1) * 2);
                if (beamEnd > eyeX) beamEnd = eyeX;
                
                c.shadowBlur = 15; c.shadowColor = '#ff003c'; c.strokeStyle = '#ff003c';
                c.beginPath(); c.moveTo(sldX + 25, cy); c.lineTo(beamEnd, cy); c.stroke();
                
                // أشعة متوازية علوية وسفلية
                c.lineWidth = 1; c.strokeStyle = 'rgba(255, 0, 60, 0.5)';
                c.beginPath(); c.moveTo(sldX + 25, cy-15); c.lineTo(beamEnd, cy-15); c.stroke();
                c.beginPath(); c.moveTo(sldX + 25, cy+15); c.lineTo(beamEnd, cy+15); c.stroke();
            }
            
            // الفيزياء: أين تقع البؤرة؟
            // إذا تشنجت العين (Thick) البؤرة تسقط قبل الشبكية بمقدار 20px
            // إذا استرخت العين (Thin) البؤرة تسقط على الشبكية تماماً
            const focalPointX = eyeX + 45 - (this.eyeLensThick === 8 ? 0 : 20); 
            
            // انكسار الضوء داخل العين
            if (this.fireProgress > 0.4 && this.fireProgress < 0.7) {
                c.strokeStyle = '#ff003c'; c.lineWidth = 2; c.shadowBlur = 10;
                c.beginPath(); c.moveTo(eyeX - 35, cy-15); c.lineTo(focalPointX, cy); c.stroke();
                c.beginPath(); c.moveTo(eyeX - 35, cy+15); c.lineTo(focalPointX, cy); c.stroke();
                
                // رسم نقطة البؤرة (Focus Point)
                c.fillStyle = this.foggingOn ? '#39ff14' : '#ff003c'; // خضراء إذا صح، حمراء إذا خطأ
                c.beginPath(); c.arc(focalPointX, cy, 4, 0, Math.PI*2); c.fill();
            }

            // المرحلة الثانية: الارتداد من الشبكية إلى الـ CCD (لون أخضر Data)
            if (this.fireProgress > 0.6) {
                let returnProgress = (this.fireProgress - 0.6) * 2.5;
                if (returnProgress > 1) returnProgress = 1;
                
                c.shadowBlur = 15; c.shadowColor = '#39ff14'; c.strokeStyle = '#39ff14'; c.lineWidth = 2;
                
                // من العين للمرآة
                let retEnd = eyeX - (eyeX - mirrorX) * returnProgress;
                c.beginPath(); c.moveTo(eyeX, cy); c.lineTo(retEnd, cy); c.stroke();
                
                // من المرآة للأسفل (CCD)
                if (returnProgress > 0.8) {
                    let downProgress = (returnProgress - 0.8) * 5;
                    let ccdEnd = cy + (ccdY - cy) * downProgress;
                    c.beginPath(); c.moveTo(mirrorX, cy); c.lineTo(mirrorX, ccdEnd); c.stroke();
                    
                    // وميض الحساس عند استلام البيانات
                    if(downProgress > 0.9) {
                        c.fillStyle = 'rgba(57, 255, 20, 0.4)';
                        c.fillRect(mirrorX-40, ccdY-10, 80, 20);
                    }
                }
            }
            c.shadowBlur = 0;
        }

        // ==========================================
        // 3. رسم العتاد الصلب (Hardware Components)
        // ==========================================
        
        // --- 1. SLD Source ---
        c.fillStyle = '#0a0f1c'; c.strokeStyle = '#ff003c'; c.lineWidth = 2; 
        if(this.isFiring && this.fireProgress < 0.6) { c.shadowBlur = 20; c.shadowColor = '#ff003c'; c.fillStyle = '#3a000b'; }
        c.fillRect(sldX-25, cy-25, 50, 50); c.strokeRect(sldX-25, cy-25, 50, 50);
        c.shadowBlur = 0; c.fillStyle = '#fff'; c.font = 'bold 10px monospace'; c.fillText('SLD', sldX - 10, cy+45);

        // --- 2. Beam Splitter (المرآة) ---
        c.shadowColor = '#00f0ff'; c.shadowBlur = 15; c.strokeStyle = '#00f0ff'; c.lineWidth = 3;
        c.beginPath(); c.moveTo(mirrorX-25, cy-25); c.lineTo(mirrorX+25, cy+25); c.stroke();
        c.fillStyle = 'rgba(0, 240, 255, 0.1)'; 
        c.beginPath(); c.moveTo(mirrorX-25, cy-25); c.lineTo(mirrorX+25, cy+25); c.lineTo(mirrorX+25, cy+15); c.lineTo(mirrorX-15, cy-25); c.fill();
        c.shadowBlur = 0; c.fillStyle = '#8ba4b5'; c.fillText('BEAM SPLITTER', mirrorX - 35, cy - 40);

        // --- 3. Fogging Lens (عدسة التضبيب المتحركة) ---
        c.shadowColor = 'rgba(255,255,255,0.5)'; c.shadowBlur = 10; 
        c.fillStyle = 'rgba(0, 240, 255, 0.1)'; c.strokeStyle = '#00f0ff'; c.lineWidth = 2;
        c.beginPath(); c.ellipse(this.lensCurrentX, cy, 6, 45, 0, 0, Math.PI*2); c.fill(); c.stroke(); 
        
        // سكة حركة العدسة (Rail)
        c.shadowBlur = 0; c.strokeStyle = '#334155'; c.lineWidth = 4; c.setLineDash([2, 4]);
        c.beginPath(); c.moveTo(w*0.45, cy + 55); c.lineTo(w*0.65, cy + 55); c.stroke(); c.setLineDash([]);
        c.fillStyle = '#8ba4b5'; c.fillText('AUTO-FOG LENS', this.lensCurrentX - 35, cy + 75);

        // --- 4. Target (المنطاد) ---
        c.save(); 
        // التغويش الحقيقي بناءً على وضع التضبيب
        if(this.foggingOn) { c.filter = 'blur(6px)'; c.globalAlpha = 0.6; } 
        let targetX = w * 0.75;
        // رسم المنطاد
        c.fillStyle = '#ef4444'; c.beginPath(); c.arc(targetX, cy - 15, 18, 0, Math.PI*2); c.fill(); 
        c.fillStyle = '#f59e0b'; c.beginPath(); c.moveTo(targetX, cy); c.lineTo(targetX+6, cy+12); c.lineTo(targetX-6, cy+12); c.fill(); 
        c.restore(); 
        c.fillStyle = '#8ba4b5'; c.fillText('TARGET', targetX - 18, cy + 30);

        // --- 5. CCD Sensor & HUD ---
        c.shadowColor = '#39ff14'; c.shadowBlur = 10; 
        c.fillStyle = '#050a15'; c.strokeStyle = '#39ff14'; c.lineWidth = 2;
        c.fillRect(mirrorX-40, ccdY-10, 80, 20); c.strokeRect(mirrorX-40, ccdY-10, 80, 20); 
        c.shadowBlur = 0; c.fillStyle = '#39ff14'; c.fillText('CCD SENSOR', mirrorX-30, ccdY+25);
        
        // شاشة القراءة الحية (Live Readout) بجانب الـ CCD
        c.fillStyle = this.foggingOn ? '#39ff14' : '#ff003c';
        c.font = 'bold 14px monospace';
        c.fillText(this.currentReading, mirrorX + 60, ccdY);

        // ==========================================
        // 4. رسم عين المريض (Physiology)
        // ==========================================
        // Sclera/Retina
        c.fillStyle = '#0f172a'; c.strokeStyle = '#475569'; c.lineWidth = 3; 
        c.beginPath(); c.arc(eyeX, cy, 50, Math.PI*-0.4, Math.PI*0.4, true); c.fill(); c.stroke();
        
        // Cornea
        c.shadowBlur = 10; c.shadowColor = '#00f0ff'; c.strokeStyle = '#00f0ff'; c.lineWidth = 3;
        c.beginPath(); c.arc(eyeX-50, cy, 25, Math.PI*-0.35, Math.PI*0.35, false); c.stroke();
        
        // Crystalline Lens (عدسة العين الداخلية - Accommodation Physics)
        c.shadowBlur = 0;
        c.fillStyle = this.foggingOn ? 'rgba(57,255,20,0.1)' : 'rgba(255,0,60,0.1)'; 
        c.strokeStyle = this.foggingOn ? '#39ff14' : '#ff003c'; c.lineWidth = 2;
        c.beginPath(); c.ellipse(eyeX-30, cy, this.eyeLensThick, 22, 0, 0, Math.PI*2); c.fill(); c.stroke();
        
        // نصوص طبية توضيحية فوق العين
        c.fillStyle = this.foggingOn ? '#39ff14' : '#ff003c';
        c.font = '10px monospace';
        c.fillText(this.foggingOn ? 'RELAXED LENS' : 'SPASM (ACCOMMODATION)', eyeX - 60, cy - 40);

        this.animId = requestAnimationFrame(this.animate.bind(this));
    }
};
