// === MODULE: AUTO-FOGGING & RING PROJECTION SIMULATOR (V3.2 PREMIUM) ===

const simLight = {
    initialized: false, 
    canvas: document.getElementById('lightPathCanvas'), 
    ctx: null, 
    time: 0, animId: null, isRunning: false,
    
    foggingOn: false, 
    isFiring: false, 
    fireProgress: 0, // من 0 إلى 1 للتحكم بنبضة الحلقات
    
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
    
    toggleFogging() {
        this.foggingOn = !this.foggingOn;
        const btn = document.getElementById('btn-fogging');
        const physioStatus = document.getElementById('physio-status');
        
        if (this.foggingOn) {
            btn.innerText = "مفعّل (الهدف ضبابي)";
            btn.className = "text-green-400 font-bold drop-shadow-[0_0_8px_rgba(57,255,20,0.6)] transition-all";
            physioStatus.innerHTML = "<span class='text-green-400 font-bold'>عضلة العين مسترخية (Relaxed).</span><br>الهدف ابتعد وأصبح ضبابياً (Optical Infinity). الدماغ توقف عن محاولة التركيز، فتسطحت عدسة العين الداخلية استعداداً للقياس.";
        } else {
            btn.innerText = "مغلق (الهدف واضح)";
            btn.className = "text-red-400 font-bold drop-shadow-[0_0_8px_rgba(255,0,0,0.6)] transition-all";
            physioStatus.innerHTML = "<span class='text-red-400 font-bold'>عضلة العين متشنجة (Accommodation).</span><br>الهدف قريب وواضح، المريض يركز عليه لا إرادياً مما يؤدي لانتفاخ عدسة العين (قصر نظر كاذب).";
        }
    },
    
    fireLaser() {
        if(this.isFiring) return; 
        this.isFiring = true; 
        this.fireProgress = 0;
        this.currentReading = "PROJECTING IR RINGS...";
        
        const btn = document.querySelector('button[onclick="simLight.fireLaser()"]');
        btn.classList.add('bg-cyan-400', 'text-black', 'scale-95');
        setTimeout(() => btn.classList.remove('bg-cyan-400', 'text-black', 'scale-95'), 150);
        
        // إبطاء العملية لتكون واضحة علمياً (4 ثوانٍ بدل 2.5)
        setTimeout(() => { 
            this.isFiring = false; 
            this.fireProgress = 0;
            this.currentReading = this.foggingOn ? "TRUE REFRACTION: 0.00 D" : "FAKE MYOPIA: -2.50 D";
        }, 4000); 
    },
    
    animate() {
        if(!this.isRunning) return;
        const c = this.ctx; const w = this.canvas.width; const h = this.canvas.height;
        this.time += 0.05; 
        
        // مسح الشاشة ورسم الشبكة
        c.fillStyle = '#02050f'; c.fillRect(0, 0, w, h);
        c.strokeStyle = 'rgba(0, 240, 255, 0.05)'; c.lineWidth = 1;
        c.beginPath();
        for(let i=0; i<w; i+=40) { c.moveTo(i,0); c.lineTo(i,h); }
        for(let i=0; i<h; i+=40) { c.moveTo(0,i); c.lineTo(w,i); }
        c.stroke();
        
        // الإحداثيات المصححة (لتجنب التداخل)
        const cy = h/2; 
        const sldX = w*0.15; 
        const mirrorX = w*0.40; 
        const eyeX = w*0.85; 
        const ccdY = h*0.75; // رُفع قليلاً لتوفير مساحة للنص بالأسفل
        
        const targetLensX = this.foggingOn ? w*0.45 : w*0.58;
        if(this.lensCurrentX === 0) this.lensCurrentX = targetLensX;
        
        this.lensCurrentX += (targetLensX - this.lensCurrentX) * 0.05; 
        this.eyeLensThick += ((this.foggingOn ? 8 : 18) - this.eyeLensThick) * 0.05; 

        // ==========================================
        // أنيميشن حلقات الضوء (IR Ring Target Projection)
        // ==========================================
        if (this.isFiring) {
            this.fireProgress += 0.008; // تقدم بطيء للحلقات
            
            // دالة مساعدة لرسم حلقة متحركة
            const drawRing = (x, y, radiusY, color, isVertical=true) => {
                c.strokeStyle = color; c.lineWidth = 3; c.shadowBlur = 10; c.shadowColor = color;
                c.beginPath();
                if(isVertical) c.ellipse(x, y, 4, radiusY, 0, 0, Math.PI*2);
                else c.ellipse(x, y, radiusY, 4, 0, 0, Math.PI*2); // للنزول نحو الحساس
                c.stroke(); c.shadowBlur = 0;
            };

            const focalPointX = eyeX + 45 - (this.eyeLensThick === 8 ? 0 : 20); 

            // المرحلة 1: الحلقات تتجه من SLD إلى العين (أحمر)
            if (this.fireProgress > 0.05 && this.fireProgress < 0.5) {
                let p1 = (this.fireProgress - 0.05) / 0.45; // 0 to 1
                let headX = sldX + 25 + (eyeX - 35 - (sldX + 25)) * p1;
                
                // نرسم 3 حلقات متتابعة
                for(let i=0; i<3; i++) {
                    let ringX = headX - (i * 25);
                    if(ringX > sldX + 25 && ringX < eyeX - 35) {
                        drawRing(ringX, cy, 18, '#ff003c');
                    }
                }
            }
            
            // المرحلة 2: الانكسار والسقوط على الشبكية
            if (this.fireProgress > 0.4 && this.fireProgress < 0.6) {
                c.strokeStyle = 'rgba(255, 0, 60, 0.4)'; c.lineWidth = 2;
                c.beginPath(); c.moveTo(eyeX - 35, cy-18); c.lineTo(focalPointX, cy); c.stroke();
                c.beginPath(); c.moveTo(eyeX - 35, cy+18); c.lineTo(focalPointX, cy); c.stroke();
                
                c.fillStyle = this.foggingOn ? '#39ff14' : '#ff003c'; 
                c.beginPath(); c.ellipse(focalPointX, cy, 3, 10, 0, 0, Math.PI*2); c.fill();
            }

            // المرحلة 3: الحلقات ترتد من الشبكية للمرآة (أخضر - بيانات)
            if (this.fireProgress > 0.55 && this.fireProgress < 0.8) {
                let p3 = (this.fireProgress - 0.55) / 0.25;
                let headX = eyeX - 35 - (eyeX - 35 - mirrorX) * p3;
                
                for(let i=0; i<3; i++) {
                    let ringX = headX + (i * 20);
                    if(ringX < eyeX - 35 && ringX > mirrorX) {
                        // الحلقات المرتدة تكون أصغر لأنها انعكاس
                        drawRing(ringX, cy, 12, '#39ff14');
                    }
                }
            }

            // المرحلة 4: الحلقات تنزل من المرآة إلى الـ CCD
            if (this.fireProgress > 0.75 && this.fireProgress < 0.95) {
                let p4 = (this.fireProgress - 0.75) / 0.2;
                let headY = cy + (ccdY - 10 - cy) * p4;
                
                for(let i=0; i<2; i++) {
                    let ringY = headY - (i * 20);
                    if(ringY > cy && ringY < ccdY - 10) {
                        // حلقات أفقية للنزول
                        drawRing(mirrorX, ringY, 12, '#39ff14', false);
                    }
                }
                
                // وميض قراءة الحساس
                if(headY > ccdY - 20) {
                    c.fillStyle = 'rgba(57, 255, 20, 0.3)';
                    c.fillRect(mirrorX-40, ccdY-10, 80, 20);
                }
            }
        }

        // ==========================================
        // رسم العتاد الصلب (تم تصحيح التداخلات)
        // ==========================================
        
        // 1. SLD Source
        c.fillStyle = '#0a0f1c'; c.strokeStyle = '#ff003c'; c.lineWidth = 2; 
        if(this.isFiring && this.fireProgress < 0.4) { c.shadowBlur = 15; c.shadowColor = '#ff003c'; }
        c.fillRect(sldX-25, cy-25, 50, 50); c.strokeRect(sldX-25, cy-25, 50, 50);
        c.shadowBlur = 0; c.fillStyle = '#fff'; c.font = 'bold 10px monospace'; c.fillText('SLD', sldX - 10, cy+45);

        // 2. Beam Splitter (المرآة)
        c.shadowColor = '#00f0ff'; c.shadowBlur = 10; c.strokeStyle = '#00f0ff'; c.lineWidth = 3;
        c.beginPath(); c.moveTo(mirrorX-25, cy-25); c.lineTo(mirrorX+25, cy+25); c.stroke();
        c.fillStyle = 'rgba(0, 240, 255, 0.1)'; 
        c.beginPath(); c.moveTo(mirrorX-25, cy-25); c.lineTo(mirrorX+25, cy+25); c.lineTo(mirrorX+25, cy+15); c.lineTo(mirrorX-15, cy-25); c.fill();
        c.shadowBlur = 0; c.fillStyle = '#8ba4b5'; c.fillText('BEAM SPLITTER', mirrorX - 35, cy - 40);

        // 3. Fogging Lens
        c.shadowColor = 'rgba(255,255,255,0.5)'; c.shadowBlur = 10; 
        c.fillStyle = 'rgba(0, 240, 255, 0.1)'; c.strokeStyle = '#00f0ff'; c.lineWidth = 2;
        c.beginPath(); c.ellipse(this.lensCurrentX, cy, 6, 40, 0, 0, Math.PI*2); c.fill(); c.stroke(); 
        
        c.shadowBlur = 0; c.strokeStyle = '#334155'; c.lineWidth = 4; c.setLineDash([2, 4]);
        c.beginPath(); c.moveTo(w*0.40, cy + 50); c.lineTo(w*0.65, cy + 50); c.stroke(); c.setLineDash([]);
        c.fillStyle = '#8ba4b5'; c.fillText('AUTO-FOG LENS', this.lensCurrentX - 35, cy + 70);

        // 4. Target (المنطاد - تم إبعاده عن العين)
        c.save(); 
        if(this.foggingOn) { c.filter = 'blur(5px)'; c.globalAlpha = 0.5; } 
        let targetX = w * 0.70; // كان 0.75 فغيرناه حتى لا يلمس القرنية
        c.fillStyle = '#ef4444'; c.beginPath(); c.arc(targetX, cy - 15, 18, 0, Math.PI*2); c.fill(); 
        c.fillStyle = '#f59e0b'; c.beginPath(); c.moveTo(targetX, cy); c.lineTo(targetX+6, cy+12); c.lineTo(targetX-6, cy+12); c.fill(); 
        c.restore(); 
        c.fillStyle = '#8ba4b5'; c.fillText('TARGET', targetX - 18, cy + 30);

        // 5. CCD Sensor & Text (تم حل التداخل)
        c.shadowColor = '#39ff14'; c.shadowBlur = 10; 
        c.fillStyle = '#050a15'; c.strokeStyle = '#39ff14'; c.lineWidth = 2;
        c.fillRect(mirrorX-40, ccdY-10, 80, 20); c.strokeRect(mirrorX-40, ccdY-10, 80, 20); 
        c.shadowBlur = 0; 
        
        // النص بداخل/فوق الحساس
        c.fillStyle = '#39ff14'; c.font = 'bold 10px monospace';
        c.fillText('CCD SENSOR', mirrorX-28, ccdY+4);
        
        // شاشة القراءة (نزلت للأسفل لتكون واضحة)
        c.fillStyle = this.foggingOn ? '#39ff14' : '#ff003c';
        c.font = 'bold 14px monospace'; c.textAlign = "center";
        c.fillText(this.currentReading, mirrorX, ccdY + 35);
        c.textAlign = "left"; // إرجاع المحاذاة الافتراضية

        // ==========================================
        // رسم عين المريض 
        // ==========================================
        c.fillStyle = '#0f172a'; c.strokeStyle = '#475569'; c.lineWidth = 3; 
        c.beginPath(); c.arc(eyeX, cy, 50, Math.PI*-0.4, Math.PI*0.4, true); c.fill(); c.stroke();
        
        c.shadowBlur = 10; c.shadowColor = '#00f0ff'; c.strokeStyle = '#00f0ff'; c.lineWidth = 3;
        c.beginPath(); c.arc(eyeX-50, cy, 25, Math.PI*-0.35, Math.PI*0.35, false); c.stroke();
        
        c.shadowBlur = 0;
        c.fillStyle = this.foggingOn ? 'rgba(57,255,20,0.1)' : 'rgba(255,0,60,0.1)'; 
        c.strokeStyle = this.foggingOn ? '#39ff14' : '#ff003c'; c.lineWidth = 2;
        c.beginPath(); c.ellipse(eyeX-30, cy, this.eyeLensThick, 22, 0, 0, Math.PI*2); c.fill(); c.stroke();
        
        c.fillStyle = this.foggingOn ? '#39ff14' : '#ff003c';
        c.font = '10px monospace';
        c.fillText(this.foggingOn ? 'RELAXED LENS' : 'SPASM (ACCOMMODATION)', eyeX - 60, cy - 40);

        this.animId = requestAnimationFrame(this.animate.bind(this));
    }
};
