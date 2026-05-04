// === MODULE: ADVANCED CORNEAL TOPOGRAPHY & MIRES SIMULATOR ===
// BME Premium Edition - True Placido Physics
// Fixed: HUD Updates, Physics Axis, and Dynamic Analysis

const simMires = {
    initialized: false, 
    canvas: document.getElementById('miresCanvas'), 
    ctx: null, 
    time: 0, animId: null, isRunning: false,
    showHeatmap: false, 
    
    init() { 
        if(!this.canvas) return;
        this.ctx = this.canvas.getContext('2d'); 
        this.resize(); 
        
        // ربط مستمع الأحداث لضمان تحديث الشرح والأرقام فور تغيير النوع
        const selector = document.getElementById('corneaSelect');
        if(selector) {
            selector.addEventListener('change', () => this.update());
        }

        window.addEventListener('resize', () => { if(this.isRunning) this.resize(); });
        this.initialized = true; 
        this.update(); // تحديث أولي عند التشغيل
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
        if(this.canvas && this.canvas.parentElement) {
            this.canvas.width = this.canvas.parentElement.clientWidth; 
            this.canvas.height = this.canvas.parentElement.clientHeight; 
        }
    },
    
    // دالة التبديل بين الحلقات والخريطة (Premium UI Buttons)
    toggleHeatmap(state) {
        this.showHeatmap = state;
        const btnRings = document.getElementById('btn-rings');
        const btnHeat = document.getElementById('btn-heat');
        const heatScale = document.getElementById('heat-scale');
        
        if(state) {
            btnHeat.className = "bg-gradient-to-r from-amber-500 to-orange-500 text-black px-3 py-1 rounded text-xs md:text-sm font-bold font-mono transition shadow-[0_0_15px_rgba(245,158,11,0.6)]";
            btnRings.className = "bg-slate-800/80 text-slate-400 px-3 py-1 rounded text-xs md:text-sm font-bold font-mono border border-slate-600 transition hover:text-white";
            if(heatScale) heatScale.classList.remove('hidden');
        } else {
            btnRings.className = "bg-gradient-to-r from-cyan-400 to-blue-500 text-black px-3 py-1 rounded text-xs md:text-sm font-bold font-mono transition shadow-[0_0_15px_rgba(0,240,255,0.6)]";
            btnHeat.className = "bg-slate-800/80 text-slate-400 px-3 py-1 rounded text-xs md:text-sm font-bold font-mono border border-slate-600 transition hover:text-white";
            if(heatScale) heatScale.classList.add('hidden');
        }
    },

   // تحديث البيانات السريرية (HUD & Side Analysis)
    update() {
        const selectElement = document.getElementById('corneaSelect');
        if(!selectElement) return;
        
        const type = selectElement.value; 
        const analysisBox = document.getElementById('mire-analysis');
        const hudR1 = document.getElementById('hud-r1'); 
        const hudR2 = document.getElementById('hud-r2');
        const hudWarn = document.getElementById('hud-warning');
        
        if(!analysisBox || !hudR1 || !hudR2) return;

        hudWarn.classList.add('hidden');

        // نصوص التحليل مبرمجة لتتغير ديناميكياً مع كل حالة
        if(type === 'normal') {
            hudR1.innerText = "43.00D"; hudR1.className = "text-green-400";
            hudR2.innerText = "43.00D"; hudR2.className = "text-green-400";
            analysisBox.innerHTML = `
                <span class="text-green-400 font-bold text-lg block mb-3 border-b border-slate-700 pb-2">قرنية كروية (Normal)</span>
                <span class="text-cyan-300 font-mono text-xs tracking-widest block mb-1">PHYSICS ANALYSIS:</span>
                الحلقات المنعكسة دائرية تماماً وبمسافات متساوية. السطح الكاسر منتظم.<br><br>
                <span class="text-amber-300 font-mono text-xs tracking-widest block mb-1">HEATMAP RESULT:</span>
                تظهر بلون أخضر متجانس مما يعني أن التحدب طبيعي وموحد في كل المحاور.`;
        }
        else if(type === 'astig_with') {
            hudR1.innerText = "42.00D"; hudR1.className = "text-green-400";
            hudR2.innerText = "46.50D"; hudR2.className = "text-amber-400";
            analysisBox.innerHTML = `
                <span class="text-amber-400 font-bold text-lg block mb-3 border-b border-slate-700 pb-2">استجماتيزم مع القاعدة (WTR)</span>
                <span class="text-cyan-300 font-mono text-xs tracking-widest block mb-1">PHYSICS ANALYSIS:</span>
                المحور العمودي (90°) أكثر تحدباً، لذا تنضغط الحلقات عمودياً وتظهر بشكل بيضوي "واقف".<br><br>
                <span class="text-amber-300 font-mono text-xs tracking-widest block mb-1">HEATMAP RESULT:</span>
                تشكل نمط "ربطة العنق" (Bowtie) العمودية باللونين الأحمر والأصفر لتركيز القوة الكاسرة.`;
        }
        else if(type === 'astig_against') {
            hudR1.innerText = "46.50D"; hudR1.className = "text-amber-400";
            hudR2.innerText = "42.00D"; hudR2.className = "text-green-400";
            analysisBox.innerHTML = `
                <span class="text-amber-400 font-bold text-lg block mb-3 border-b border-slate-700 pb-2">استجماتيزم ضد القاعدة (ATR)</span>
                <span class="text-cyan-300 font-mono text-xs tracking-widest block mb-1">PHYSICS ANALYSIS:</span>
                المحور الأفقي (180°) هو الأكثر تحدباً، فتنضغط الحلقات من الجوانب وتتوسع عمودياً.<br><br>
                <span class="text-amber-300 font-mono text-xs tracking-widest block mb-1">HEATMAP RESULT:</span>
                نمط "ربطة العنق" (Bowtie) يظهر أفقياً نتيجة توزيع القوة غير المتماثل.`;
        }
        else if(type === 'keratoconus') {
            hudR1.innerText = "54.50D"; hudR1.className = "text-red-500 font-bold animate-pulse";
            hudR2.innerText = "61.00D"; hudR2.className = "text-red-500 font-bold animate-pulse"; 
            hudWarn.classList.remove('hidden');
            analysisBox.innerHTML = `
                <span class="text-red-500 font-bold text-lg block mb-3 border-b border-slate-700 pb-2">القرنية المخروطية (Keratoconus)</span>
                <span class="text-cyan-300 font-mono text-xs tracking-widest block mb-1">PHYSICS ANALYSIS:</span>
                تشوه شديد وتقارب كثيف للحلقات في الجزء السفلي نتيجة بروز القرنية بشكل مخروطي.<br><br>
                <span class="text-amber-300 font-mono text-xs tracking-widest block mb-1">HEATMAP RESULT:</span>
                بقعة حمراء شديدة الانحدار (Apex) منزاحة للأسفل، وهو الدليل السريري القاطع.`;
        }
        else if(type === 'dry_eye') {
            hudR1.innerText = "ERR"; hudR1.className = "text-amber-500";
            hudR2.innerText = "ERR"; hudR2.className = "text-amber-500";
            analysisBox.innerHTML = `
                <span class="text-amber-500 font-bold text-lg block mb-3 border-b border-slate-700 pb-2">جفاف العين (TFBUT)</span>
                <span class="text-cyan-300 font-mono text-xs tracking-widest block mb-1">PHYSICS ANALYSIS:</span>
                تبخر الفيلم الدمعي يدمر السطح الأملس فتتكسر الحلقات هندسياً وتفشل المحاذاة.<br><br>
                <span class="text-amber-300 font-mono text-xs tracking-widest block mb-1">HEATMAP RESULT:</span>
                ظهور بقع عشوائية (Islands) تمنع نظام الـ DSP من معالجة البيانات بشكل دقيق.`;
        }
    },
    
    animate() {
        if(!this.isRunning) return;
        const c = this.ctx; const w = this.canvas.width; const h = this.canvas.height; 
        const type = document.getElementById('corneaSelect').value;
        this.time += 0.03; 
        
        // حركة طفيفة للعين لزيادة الواقعية
        const cx = (w/2) + Math.sin(this.time * 2) * 2; 
        const cy = (h/2) + Math.cos(this.time * 1.5) * 2; 

        // 1. مسح الشاشة ورسم الخلفية العميقة
        c.fillStyle = '#02050f'; c.fillRect(0, 0, w, h);
        
        // 2. رسم شبكة بولار (Polar Grid) للواجهة التقنية
        c.strokeStyle = 'rgba(0, 240, 255, 0.05)'; c.lineWidth = 1;
        c.beginPath(); c.moveTo(cx, 0); c.lineTo(cx, h); c.stroke();
        c.beginPath(); c.moveTo(0, cy); c.lineTo(w, cy); c.stroke();
        for(let r=40; r<=200; r+=40) { c.beginPath(); c.arc(cx, cy, r, 0, Math.PI*2); c.stroke(); }
        
        // مسح راداري دائري (Radar Sweep)
        c.save();
        c.translate(cx, cy);
        c.rotate(this.time * 2);
        let sweepGrad = c.createLinearGradient(0, 0, 200, 0);
        sweepGrad.addColorStop(0, 'rgba(0, 240, 255, 0)');
        sweepGrad.addColorStop(1, 'rgba(0, 240, 255, 0.1)');
        c.fillStyle = sweepGrad;
        c.beginPath(); c.moveTo(0,0); c.arc(0, 0, 200, 0, 0.4); c.closePath(); c.fill();
        c.restore();

        // 3. رسم الخريطة الحرارية الطبية (Medical Topography Heatmap)
        if (this.showHeatmap) {
            c.globalCompositeOperation = "screen";
            let grd;
            
            // قاعدة خضراء طبيعية
            grd = c.createRadialGradient(cx, cy, 0, cx, cy, 140);
            grd.addColorStop(0, "rgba(57, 255, 20, 0.4)"); 
            grd.addColorStop(0.6, "rgba(0, 240, 255, 0.3)"); 
            grd.addColorStop(1, "rgba(0, 0, 255, 0.1)");     
            c.fillStyle = grd; c.beginPath(); c.arc(cx, cy, 140, 0, Math.PI*2); c.fill();
            
            if (type === 'astig_with' || type === 'astig_against') {
                c.save();
                c.translate(cx, cy);
                // تدوير الخريطة بناءً على نوع الاستجماتيزم
                if (type === 'astig_against') c.rotate(Math.PI / 2);
                
                let bowGrd = c.createRadialGradient(0, 0, 0, 0, 0, 120);
                bowGrd.addColorStop(0, "rgba(255, 0, 0, 0.8)");      
                bowGrd.addColorStop(0.4, "rgba(255, 170, 0, 0.7)");  
                bowGrd.addColorStop(0.8, "rgba(255, 255, 0, 0.4)");  
                bowGrd.addColorStop(1, "rgba(0, 0, 0, 0)");
                
                c.scale(0.35, 1.2); 
                c.fillStyle = bowGrd; c.beginPath(); c.arc(0, 0, 120, 0, Math.PI*2); c.fill();
                c.restore();
            }
            else if (type === 'keratoconus') {
                let coneGrd = c.createRadialGradient(cx, cy + 45, 0, cx, cy + 45, 70);
                coneGrd.addColorStop(0, "rgba(255, 0, 0, 0.95)");     
                coneGrd.addColorStop(0.3, "rgba(255, 100, 0, 0.8)");  
                coneGrd.addColorStop(0.6, "rgba(255, 255, 0, 0.5)");  
                coneGrd.addColorStop(1, "rgba(0, 0, 0, 0)");
                c.fillStyle = coneGrd; c.beginPath(); c.arc(cx, cy + 45, 80, 0, Math.PI*2); c.fill();
            }
            else if (type === 'dry_eye') {
                c.fillStyle = 'rgba(255, 50, 0, 0.3)';
                for(let i=0; i<10; i++) {
                    let bx = cx + (Math.random()-0.5)*150;
                    let by = cy + (Math.random()-0.5)*150;
                    c.beginPath(); c.arc(bx, by, Math.random()*20+10, 0, Math.PI*2); c.fill();
                }
            }
            c.globalCompositeOperation = "source-over";
        } 
        
        // 4. رسم حلقات بلاسيدو (Placido Rings) - فيزياء حقيقية
        if(!this.showHeatmap || type === 'dry_eye') {
            c.shadowBlur = 8; c.shadowColor = '#00f0ff';
            
            for(let i=1; i<=7; i++) {
                let baseRadius = i * 18; 
                c.strokeStyle = `rgba(0, 240, 255, ${1 - (i*0.1)})`; 
                c.lineWidth = 3 - (i*0.2); 
                c.beginPath();
                
                for(let a=0; a<=Math.PI*2; a+=0.05) {
                    let r = baseRadius; 
                    let drawY = cy;
                    let drawX = cx;
                    
                    // الفيزياء: التحدب العالي = حلقات أقرب للمركز (r أصغر)
                    if(type === 'astig_with') { 
                        // With-the-rule: المحور العمودي حاد، الحلقات تنضغط عمودياً
                        // نستخدم -cos لتقليل r عند زاوية 90 و 270
                        r = baseRadius * (1 - 0.15 * Math.abs(Math.sin(a))); 
                    } 
                    else if(type === 'astig_against') { 
                        // Against-the-rule: المحور الأفقي حاد، الحلقات تنضغط أفقياً
                        r = baseRadius * (1 - 0.15 * Math.abs(Math.cos(a))); 
                    } 
                    else if(type === 'keratoconus') { 
                        drawY += i * 5; 
                        if (a > 0 && a < Math.PI) { r *= (1 - 0.2 * Math.sin(a)); } 
                        r += Math.sin(a * 4 + this.time * 5) * 1.5; 
                    }
                    
                    let px = drawX + r * Math.cos(a); 
                    let py = drawY + r * Math.sin(a);
                    
                    if(type === 'dry_eye') {
                        let noise = Math.sin(a * 15 + this.time * 8) + Math.cos(a * 10 - this.time * 3);
                        if(noise > 0.6) { c.moveTo(px, py); continue; }
                    }
                    
                    if(a===0) c.moveTo(px, py); else c.lineTo(px, py);
                }
                c.stroke();
            }
            c.shadowBlur = 0;
        }

        // رسم البؤبؤ المركزي للتوجيه (Pupil Alignment Marker)
        c.strokeStyle = 'rgba(255, 255, 255, 0.4)'; c.lineWidth = 1;
        c.beginPath(); c.arc(cx, cy, 15, 0, Math.PI*2); c.stroke();
        c.beginPath(); c.moveTo(cx - 5, cy); c.lineTo(cx + 5, cy); c.stroke();
        c.beginPath(); c.moveTo(cx, cy - 5); c.lineTo(cx, cy + 5); c.stroke();

        this.animId = requestAnimationFrame(this.animate.bind(this));
    }
};
