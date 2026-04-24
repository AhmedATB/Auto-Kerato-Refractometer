const simMires = {
    initialized: false, canvas: document.getElementById('miresCanvas'), ctx: null, time: 0, animId: null, isRunning: false,
    
    // متغيرات لتخزين القراءات اللحظية لعرضها على الـ HUD
    k1: "43.00", k2: "43.00", axis: "---", statusColor: "#39ff14",

    init() { this.ctx = this.canvas.getContext('2d'); this.initialized = true; this.update(); },
    start() { this.isRunning = true; this.animate(); },
    stop() { this.isRunning = false; cancelAnimationFrame(this.animId); },
    
    update() {
        const type = document.getElementById('corneaSelect').value; 
        const log = document.getElementById('mire-analysis');
        
        // تحديث القيم الرياضية للـ HUD بناءً على الحالة
        if(type === 'normal') {
            this.k1 = "43.00"; this.k2 = "43.00"; this.axis = "---"; this.statusColor = "#39ff14";
            log.innerHTML = "STATUS: <span class='text-green-400'>OPTIMAL.</span><br>التحليل: حلقات دائرية مثالية. المسافة متساوية. (Astigmatism = 0.00D).";
        }
        else if(type === 'astig_with') {
            this.k1 = "42.00"; this.k2 = "45.00"; this.axis = "180°"; this.statusColor = "#ffaa00";
            log.innerHTML = "STATUS: <span class='text-amber-400'>WTR ASTIGMATISM DETECTED.</span><br>التحليل: المحور العمودي أكثر انحداراً من الأفقي. شكل بيضوي عرضي. Axis ≈ 180°.";
        }
        else if(type === 'astig_against') {
            this.k1 = "42.00"; this.k2 = "44.50"; this.axis = "90°"; this.statusColor = "#ffaa00";
            log.innerHTML = "STATUS: <span class='text-amber-400'>ATR ASTIGMATISM DETECTED.</span><br>التحليل: المحور الأفقي أكثر انحداراً. شكل بيضوي طولي. Axis ≈ 90°.";
        }
        else if(type === 'keratoconus') {
            this.k1 = "52.50"; this.k2 = "58.00"; this.axis = "ERR"; this.statusColor = "#ff003c";
            log.innerHTML = "STATUS: <span class='text-red-500 font-bold'>CRITICAL DEFORMATION!</span><br>التحليل: انحدار سفلي حاد غير متماثل. اشتباه قرنية مخروطية. يرجى تحويل المريض للتصوير الطبوغرافي.";
        }
        else if(type === 'dry_eye') {
            this.k1 = "ERR"; this.k2 = "ERR"; this.axis = "ERR"; this.statusColor = "#ffaa00";
            log.innerHTML = "STATUS: <span class='text-amber-500'>SIGNAL INTERRUPTED.</span><br>التحليل: تكسر في الانعكاس السطحي (TFBUT منخفض). يرجى تقطير دموع اصطناعية وإعادة الفحص.";
        }
    },
    
    animate() {
        if(!this.isRunning) return;
        const c = this.ctx; const w = this.canvas.width; const h = this.canvas.height; 
        const type = document.getElementById('corneaSelect').value;
        this.time += 0.05; 
        
        // اهتزاز مجهري للعين (Micro-movements)
        const cx = (w/2) + Math.sin(this.time)*1.5; 
        const cy = (h/2) + Math.cos(this.time)*1.5; 

        // 1. رسم الخلفية مع تأثير الكاميرا (CCD Noise)
        c.fillStyle = '#050505'; c.fillRect(0, 0, w, h);
        c.fillStyle = 'rgba(255,255,255,0.02)'; 
        for(let i=0; i<300; i++) c.fillRect(Math.random()*w, Math.random()*h, 2, 2);
        
        // 2. رسم خلفية العين (القزحية والبؤبؤ)
        c.fillStyle = '#0f172a'; c.beginPath(); c.arc(cx, cy, 140, 0, Math.PI*2); c.fill(); // Iris
        c.fillStyle = '#02040a'; c.beginPath(); c.arc(cx, cy, 35, 0, Math.PI*2); c.fill();  // Pupil
        
        // 3. رسم حلقات بلاسيدو (Placido Mires) بالرياضيات القطبية
        c.lineWidth = 2.5; 
        c.shadowBlur = 8;
        
        for(let i=1; i<=5; i++) {
            let baseRadius = i * 26; 
            c.strokeStyle = `rgba(0, 240, 255, ${1 - (i*0.12)})`; // تتلاشى الحلقات كلما ابتعدت عن المركز
            c.shadowColor = '#00f0ff'; 
            c.beginPath();
            
            for(let a=0; a<=Math.PI*2; a+=0.05) {
                let r = baseRadius; let cY = cy;
                
                if(type === 'astig_with') { r += (i*3.5) * Math.cos(2*a); } 
                else if(type === 'astig_against') { r += (i*3.5) * Math.sin(2*a); } 
                else if(type === 'keratoconus') { 
                    cY += i*8; // إزاحة المركز للأسفل
                    if(a>0 && a<Math.PI) r *= 1+0.15*Math.sin(a); // انتفاخ سفلي
                    r += Math.sin(a*4 + this.time*2)*1.5; // تعرجات مجهرية
                }
                
                let x = cx + r * Math.cos(a); 
                let y = cY + r * Math.sin(a);
                
                // فيزياء جفاف العين الديناميكية (Dynamic Tear Film Evaporation)
                if(type === 'dry_eye') {
                    // استخدام الموجات لإنشاء تشققات تتحرك وتتغير مع الوقت
                    let evaporation = Math.sin(a * 15 + this.time * 5);
                    if(evaporation > 0.6) { c.moveTo(x, y); continue; }
                }
                
                if(a===0) c.moveTo(x,y); else c.lineTo(x,y);
            }
            c.stroke();
        }

        // ==========================================
        // 4. رسم واجهة البيانات الطبية (Medical HUD Overlay)
        // ==========================================
        c.shadowBlur = 0;
        
        // رسم خطوط المحاور (Meridians) في حالة الاستجماتيزم
        if(type === 'astig_with' || type === 'astig_against') {
            c.setLineDash([5, 5]); c.lineWidth = 1;
            
            // Steep Axis (Red)
            c.strokeStyle = 'rgba(255, 0, 60, 0.6)';
            c.beginPath();
            if(type === 'astig_with') { c.moveTo(cx, cy-120); c.lineTo(cx, cy+120); } // Vertical
            else { c.moveTo(cx-120, cy); c.lineTo(cx+120, cy); } // Horizontal
            c.stroke();

            // Flat Axis (Blue)
            c.strokeStyle = 'rgba(0, 240, 255, 0.6)';
            c.beginPath();
            if(type === 'astig_with') { c.moveTo(cx-120, cy); c.lineTo(cx+120, cy); } // Horizontal
            else { c.moveTo(cx, cy-120); c.lineTo(cx, cy+120); } // Vertical
            c.stroke();
            
            c.setLineDash([]);
        }

        // رسم صندوق تحذير للقرنية المخروطية
        if(type === 'keratoconus') {
            c.strokeStyle = 'rgba(255, 0, 60, 0.8)'; c.lineWidth = 2; c.setLineDash([10, 5]);
            c.strokeRect(cx - 80, cy, 160, 130);
            c.fillStyle = '#ff003c'; c.font = '10px monospace';
            c.fillText("IRREGULARITY DETECTED", cx - 75, cy + 15);
            c.setLineDash([]);
        }

        // طباعة البيانات الحية (Live Telemetry) في زاوية الشاشة
        c.fillStyle = 'rgba(15, 23, 42, 0.8)';
        c.fillRect(10, 10, 120, 70); // خلفية البيانات
        c.strokeStyle = this.statusColor; c.lineWidth = 1;
        c.strokeRect(10, 10, 120, 70);
        
        c.fillStyle = this.statusColor;
        c.font = 'bold 12px monospace';
        c.fillText(`R1: ${this.k1} D`, 18, 30);
        c.fillText(`R2: ${this.k2} D`, 18, 50);
        c.fillText(`AX: ${this.axis}`, 18, 70);

        // مؤشر التصويب المركزي (Center Crosshair)
        c.strokeStyle = 'rgba(255, 255, 255, 0.5)'; c.lineWidth = 1.5;
        c.beginPath(); c.moveTo(cx - 10, cy); c.lineTo(cx + 10, cy); c.stroke();
        c.beginPath(); c.moveTo(cx, cy - 10); c.lineTo(cx, cy + 10); c.stroke();

        this.animId = requestAnimationFrame(this.animate.bind(this));
    }
};
