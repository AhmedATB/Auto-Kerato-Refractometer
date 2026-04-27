// === MODULE: KERATOMETRY & MIRES SIMULATOR ===
const simMires = {
    initialized: false, canvas: document.getElementById('miresCanvas'), ctx: null, time: 0, animId: null, isRunning: false,
    
    init() { 
        this.ctx = this.canvas.getContext('2d'); 
        this.resize(); 
        window.addEventListener('resize', () => { if(this.isRunning) this.resize(); });
        this.initialized = true; 
        this.update(); 
    },
    start() { this.isRunning = true; this.animate(); },
    stop() { this.isRunning = false; cancelAnimationFrame(this.animId); },
    resize() { 
        if(this.canvas.parentElement) {
            this.canvas.width = this.canvas.parentElement.clientWidth; 
            this.canvas.height = this.canvas.parentElement.clientHeight; 
        }
    },
    
    update() {
        const type = document.getElementById('corneaSelect').value; 
        const analysisBox = document.getElementById('mire-analysis');
        
        // ربط عناصر الـ HTML (HUD)
        const hudR1 = document.getElementById('hud-r1');
        const hudR2 = document.getElementById('hud-r2');
        const hudAx = document.getElementById('hud-ax');
        const hudWarn = document.getElementById('hud-warning');
        
        // تصفير التحذير
        hudWarn.classList.add('hidden');

        // تحديث القيم والشرح بناءً على الحالة
        if(type === 'normal') {
            hudR1.innerText = "43.00D"; hudR1.className = "text-green-400 font-bold";
            hudR2.innerText = "43.00D"; hudR2.className = "text-green-400 font-bold";
            hudAx.innerText = "---";    hudAx.className = "text-slate-500 font-bold";
            
            analysisBox.innerHTML = `
                <strong class="text-green-400 block mb-2">الحالة: قرنية كروية مثالية (Emmetropic Cornea)</strong>
                بما أن القرنية منتظمة تماماً كسطح الكرة، فإن الحلقات الضوئية تنعكس كـ <strong class="text-white">دوائر مثالية</strong>. المسافة بين الحلقات ($r$) متساوية في جميع المحاور (الأفقي والعمودي)، وبالتالي لا يوجد استجماتيزم ($0.00D$).
            `;
        }
        else if(type === 'astig_with') {
            hudR1.innerText = "42.00D"; hudR1.className = "text-green-400 font-bold";
            hudR2.innerText = "45.00D"; hudR2.className = "text-amber-400 font-bold";
            hudAx.innerText = "180°";   hudAx.className = "text-amber-400 font-bold";
            
            analysisBox.innerHTML = `
                <strong class="text-amber-400 block mb-2">الحالة: استجماتيزم مع القاعدة (WTR Astigmatism)</strong>
                القرنية مشوهة وتشبه (كرة الركبي)، حيث يكون المحور العمودي أكثر انحداراً (Steep) من المحور الأفقي (Flat). 
                <br><br><strong class="text-white">هندسياً:</strong> الحلقات تنعكس بشكل بيضوي، وتتقارب من بعضها في المحور العمودي. المعالج يطرح $R_2 - R_1$ ليحسب قوة الاستجماتيزم ($-3.00D$).
            `;
        }
        else if(type === 'astig_against') {
            hudR1.innerText = "42.00D"; hudR1.className = "text-green-400 font-bold";
            hudR2.innerText = "44.50D"; hudR2.className = "text-amber-400 font-bold";
            hudAx.innerText = "90°";    hudAx.className = "text-amber-400 font-bold";
            
            analysisBox.innerHTML = `
                <strong class="text-amber-400 block mb-2">الحالة: استجماتيزم ضد القاعدة (ATR Astigmatism)</strong>
                عكس الحالة السابقة، المحور الأفقي هنا هو الأكثر انحداراً. 
                <br><br><strong class="text-white">هندسياً:</strong> الحلقات تظهر بشكل بيضوي طولي. الخوارزمية ترسم خطوط التتبع (الخط الأحمر للانحدار والأزرق للتسطح) لتحديد زاوية الانحراف بدقة، وهي هنا تقارب $90$ درجة.
            `;
        }
        else if(type === 'keratoconus') {
            hudR1.innerText = "52.50D"; hudR1.className = "text-red-500 font-bold";
            hudR2.innerText = "58.00D"; hudR2.className = "text-red-500 font-bold";
            hudAx.innerText = "ERR";    hudAx.className = "text-red-500 font-bold animate-pulse";
            hudWarn.classList.remove('hidden'); // إظهار التحذير المنبثق
            
            analysisBox.innerHTML = `
                <strong class="text-red-500 block mb-2">الحالة: قرنية مخروطية (Keratoconus) - حالة خطرة!</strong>
                سطح القرنية يترقق وينبرز للأسفل بفعل الجاذبية، مشكلاً مخروطاً.
                <br><br><strong class="text-white">هندسياً:</strong> الحلقات تنضغط بشدة من الأسفل وتتشوه كلياً. خوارزميات الـ (Pattern Recognition) في الجهاز تكتشف هذا الشذوذ (Irregularity) وتتوقف عن إعطاء قراءة عادية، بل تنبه الطبيب لضرورة التصوير الطبوغرافي الشامل.
            `;
        }
        else if(type === 'dry_eye') {
            hudR1.innerText = "ERR"; hudR1.className = "text-amber-500 font-bold";
            hudR2.innerText = "ERR"; hudR2.className = "text-amber-500 font-bold";
            hudAx.innerText = "ERR"; hudAx.className = "text-amber-500 font-bold";
            
            analysisBox.innerHTML = `
                <strong class="text-amber-500 block mb-2">الحالة: جفاف العين وتكسر الدموع (Tear Film Breakup)</strong>
                الجهاز يعتمد على (طبقة الدموع) كمرآة عاكسة. في حالة الجفاف، تتبخر هذه الطبقة.
                <br><br><strong class="text-white">هندسياً:</strong> الحلقات تتقطع وتتشوه ديناميكياً. الكاميرا تفقد القدرة على تتبع الخطوط المستمرة (Signal Interruption)، مما قد يعطي قراءة "استجماتيزم كاذب". الحل السريري هو تقطير دموع اصطناعية وإعادة الفحص.
            `;
        }
    },
    
    animate() {
        if(!this.isRunning) return;
        const c = this.ctx; const w = this.canvas.width; const h = this.canvas.height; 
        const type = document.getElementById('corneaSelect').value;
        this.time += 0.05; 
        
        // اهتزاز مجهري للعين
        const cx = (w/2) + Math.sin(this.time)*1.5; 
        const cy = (h/2) + Math.cos(this.time)*1.5; 

        // 1. رسم الخلفية
        c.fillStyle = '#050505'; c.fillRect(0, 0, w, h);
        
        // 2. رسم خلفية العين (القزحية والبؤبؤ)
        c.fillStyle = '#0f172a'; c.beginPath(); c.arc(cx, cy, 120, 0, Math.PI*2); c.fill(); // Iris
        c.fillStyle = '#02040a'; c.beginPath(); c.arc(cx, cy, 30, 0, Math.PI*2); c.fill();  // Pupil
        
        // 3. رسم حلقات بلاسيدو (Placido Mires)
        c.lineWidth = 2.5; 
        c.shadowBlur = 10;
        
        for(let i=1; i<=5; i++) {
            let baseRadius = i * 22; 
            c.strokeStyle = `rgba(0, 240, 255, ${1 - (i*0.12)})`; 
            c.shadowColor = '#00f0ff'; 
            c.beginPath();
            
            for(let a=0; a<=Math.PI*2; a+=0.05) {
                let r = baseRadius; let cY = cy;
                
                if(type === 'astig_with') { r += (i*3) * Math.cos(2*a); } 
                else if(type === 'astig_against') { r += (i*3) * Math.sin(2*a); } 
                else if(type === 'keratoconus') { 
                    cY += i*8; // إزاحة المركز للأسفل
                    if(a>0 && a<Math.PI) r *= 1+0.2*Math.sin(a); // انتفاخ سفلي واضح
                    r += Math.sin(a*5 + this.time*2)*1.5; // تعرجات
                }
                
                let x = cx + r * Math.cos(a); 
                let y = cY + r * Math.sin(a);
                
                // فيزياء جفاف العين (تقطعات ديناميكية)
                if(type === 'dry_eye') {
                    let evaporation = Math.sin(a * 12 + this.time * 4) + Math.cos(a * 8 - this.time);
                    if(evaporation > 0.8) { c.moveTo(x, y); continue; }
                }
                
                if(a===0) c.moveTo(x,y); else c.lineTo(x,y);
            }
            c.stroke();
        }

        // ==========================================
        // 4. رسم محاور الاستجماتيزم (Meridians)
        // ==========================================
        c.shadowBlur = 0;
        
        if(type === 'astig_with' || type === 'astig_against') {
            c.setLineDash([5, 5]); c.lineWidth = 1.5;
            
            // Steep Axis (Red)
            c.strokeStyle = 'rgba(255, 0, 60, 0.7)';
            c.beginPath();
            if(type === 'astig_with') { c.moveTo(cx, cy-110); c.lineTo(cx, cy+110); } // Vertical
            else { c.moveTo(cx-110, cy); c.lineTo(cx+110, cy); } // Horizontal
            c.stroke();

            // Flat Axis (Blue)
            c.strokeStyle = 'rgba(0, 240, 255, 0.7)';
            c.beginPath();
            if(type === 'astig_with') { c.moveTo(cx-110, cy); c.lineTo(cx+110, cy); } // Horizontal
            else { c.moveTo(cx, cy-110); c.lineTo(cx, cy+110); } // Vertical
            c.stroke();
            
            c.setLineDash([]);
        }

        // رسم مؤشر التصويب (Crosshair)
        c.strokeStyle = 'rgba(255, 255, 255, 0.5)'; c.lineWidth = 1;
        c.beginPath(); c.moveTo(cx - 15, cy); c.lineTo(cx + 15, cy); c.stroke();
        c.beginPath(); c.moveTo(cx, cy - 15); c.lineTo(cx, cy + 15); c.stroke();

        this.animId = requestAnimationFrame(this.animate.bind(this));
    }
};
