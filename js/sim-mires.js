// === MODULE: KERATOMETRY & MIRES SIMULATOR (WITH HEATMAP UPGRADE) ===
const simMires = {
    initialized: false, canvas: document.getElementById('miresCanvas'), ctx: null, time: 0, animId: null, isRunning: false,
    showHeatmap: false, // المتغير الجديد للخريطة اللونية
    
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
    
    // دالة التبديل بين الحلقات والخريطة
    toggleHeatmap(state) {
        this.showHeatmap = state;
        const btnRings = document.getElementById('btn-rings');
        const btnHeat = document.getElementById('btn-heat');
        const heatScale = document.getElementById('heat-scale');
        
        if(state) {
            btnHeat.className = "bg-amber-500 text-black px-3 py-1 rounded text-xs font-bold font-mono transition shadow-[0_0_15px_rgba(255,170,0,0.6)]";
            btnRings.className = "bg-slate-800 text-slate-400 px-3 py-1 rounded text-xs font-bold font-mono border border-slate-600 transition hover:text-white";
            heatScale.classList.remove('hidden');
        } else {
            btnRings.className = "bg-cyan-600 text-black px-3 py-1 rounded text-xs font-bold font-mono transition shadow-[0_0_10px_rgba(0,240,255,0.4)]";
            btnHeat.className = "bg-slate-800 text-slate-400 px-3 py-1 rounded text-xs font-bold font-mono border border-slate-600 transition hover:text-white";
            heatScale.classList.add('hidden');
        }
    },

    update() {
        const type = document.getElementById('corneaSelect').value; 
        const analysisBox = document.getElementById('mire-analysis');
        const hudR1 = document.getElementById('hud-r1'); const hudR2 = document.getElementById('hud-r2');
        const hudAx = document.getElementById('hud-ax'); const hudWarn = document.getElementById('hud-warning');
        
        hudWarn.classList.add('hidden');

        if(type === 'normal') {
            hudR1.innerText = "43.00D"; hudR1.className = "text-green-400 font-bold";
            hudR2.innerText = "43.00D"; hudR2.className = "text-green-400 font-bold"; hudAx.innerText = "---";
            analysisBox.innerHTML = `<strong class="text-green-400 block mb-2">قرنية كروية (Normal)</strong>الحلقات دائرية تمامًا، والخريطة اللونية تظهر بلون أخضر متجانس (التحدب طبيعي وموحد).`;
        }
        else if(type === 'astig_with') {
            hudR1.innerText = "42.00D"; hudR1.className = "text-green-400 font-bold";
            hudR2.innerText = "45.00D"; hudR2.className = "text-amber-400 font-bold"; hudAx.innerText = "180°";
            analysisBox.innerHTML = `<strong class="text-amber-400 block mb-2">استجماتيزم مع القاعدة (WTR)</strong>في وضع الـ Heatmap، ستلاحظ شكل "ربطة العنق" (Bowtie) العمودية الحمراء، دلالة على الانحدار الشديد في هذا المحور.`;
        }
        else if(type === 'astig_against') {
            hudR1.innerText = "42.00D"; hudR1.className = "text-green-400 font-bold";
            hudR2.innerText = "44.50D"; hudR2.className = "text-amber-400 font-bold"; hudAx.innerText = "90°";
            analysisBox.innerHTML = `<strong class="text-amber-400 block mb-2">استجماتيزم ضد القاعدة (ATR)</strong>شكل "ربطة العنق" (Bowtie) أصبح أفقيًا الآن. المحور الأفقي هو الأكثر تحدبًا (أحمر).`;
        }
        else if(type === 'keratoconus') {
            hudR1.innerText = "52.50D"; hudR1.className = "text-red-500 font-bold";
            hudR2.innerText = "58.00D"; hudR2.className = "text-red-500 font-bold"; hudAx.innerText = "ERR";
            hudWarn.classList.remove('hidden');
            analysisBox.innerHTML = `<strong class="text-red-500 block mb-2">القرنية المخروطية (Keratoconus)</strong>في وضع الـ Heatmap، تظهر بقعة حمراء شديدة الانحدار ومنزاحة للأسفل، وهو الدليل السريري القاطع للمرض.`;
        }
        else if(type === 'dry_eye') {
            hudR1.innerText = "ERR"; hudR1.className = "text-amber-500 font-bold";
            hudR2.innerText = "ERR"; hudR2.className = "text-amber-500 font-bold"; hudAx.innerText = "ERR";
            analysisBox.innerHTML = `<strong class="text-amber-500 block mb-2">جفاف العين (Dry Eye)</strong>تكسر الحلقات يؤدي إلى ظهور بقع ألوان عشوائية ومتقطعة في الخريطة، مما يعيق القراءة الدقيقة.`;
        }
    },
    
    animate() {
        if(!this.isRunning) return;
        const c = this.ctx; const w = this.canvas.width; const h = this.canvas.height; 
        const type = document.getElementById('corneaSelect').value;
        this.time += 0.05; 
        
        const cx = (w/2) + Math.sin(this.time)*1.5; 
        const cy = (h/2) + Math.cos(this.time)*1.5; 

        // 1. رسم الخلفية
        c.fillStyle = '#050505'; c.fillRect(0, 0, w, h);
        c.fillStyle = '#0f172a'; c.beginPath(); c.arc(cx, cy, 150, 0, Math.PI*2); c.fill(); // Iris
        c.fillStyle = '#02040a'; c.beginPath(); c.arc(cx, cy, 30, 0, Math.PI*2); c.fill();  // Pupil
        
        // 2. إذا كان وضع الخريطة اللونية مفعلًا (Heatmap Mode)
        if (this.showHeatmap) {
            c.globalCompositeOperation = "screen";
            let grd;
            
            if (type === 'normal') {
                grd = c.createRadialGradient(cx, cy, 0, cx, cy, 120);
                grd.addColorStop(0, "rgba(0, 255, 0, 0.7)"); // أخضر طبيعي
                grd.addColorStop(1, "rgba(0, 150, 255, 0.4)");
                c.fillStyle = grd; c.beginPath(); c.arc(cx, cy, 120, 0, Math.PI*2); c.fill();
            } 
            else if (type === 'astig_with' || type === 'astig_against') {
                // رسم شكل "ربطة العنق" (Bowtie Pattern)
                c.save();
                c.translate(cx, cy);
                if (type === 'astig_against') c.rotate(Math.PI / 2);
                
                grd = c.createRadialGradient(0, 0, 0, 0, 0, 120);
                grd.addColorStop(0, "rgba(255, 0, 0, 0.8)"); // أحمر شديد بالمركز
                grd.addColorStop(0.3, "rgba(255, 255, 0, 0.6)");
                grd.addColorStop(1, "rgba(0, 0, 255, 0.2)");
                
                // مط الخريطة لتكوين الاستجماتيزم
                c.scale(0.5, 1.2);
                c.fillStyle = grd; c.beginPath(); c.arc(0, 0, 120, 0, Math.PI*2); c.fill();
                c.restore();
            }
            else if (type === 'keratoconus') {
                // مخروط متمركز للأسفل (Inferior Cone)
                grd = c.createRadialGradient(cx, cy + 40, 0, cx, cy + 40, 80);
                grd.addColorStop(0, "rgba(255, 0, 0, 0.9)"); // أحمر قاني للبروز
                grd.addColorStop(0.4, "rgba(255, 255, 0, 0.7)");
                grd.addColorStop(1, "rgba(0, 255, 0, 0.1)");
                c.fillStyle = grd; c.beginPath(); c.arc(cx, cy + 40, 100, 0, Math.PI*2); c.fill();
            }
            c.globalCompositeOperation = "source-over";
        } 
        
        // 3. رسم الحلقات (إذا كان وضع الـ Rings مفعلًا، أو كطبقة خفيفة فوق الـ Heatmap)
        if(!this.showHeatmap || type === 'dry_eye') {
            c.lineWidth = 2.5; 
            c.shadowBlur = 10;
            
            for(let i=1; i<=6; i++) {
                let baseRadius = i * 20; 
                c.strokeStyle = `rgba(0, 240, 255, ${1 - (i*0.1)})`; 
                c.shadowColor = '#00f0ff'; 
                c.beginPath();
                
                for(let a=0; a<=Math.PI*2; a+=0.05) {
                    let r = baseRadius; let cY = cy;
                    
                    if(type === 'astig_with') { r += (i*2.5) * Math.cos(2*a); } 
                    else if(type === 'astig_against') { r += (i*2.5) * Math.sin(2*a); } 
                    else if(type === 'keratoconus') { 
                        cY += i*6; 
                        if(a>0 && a<Math.PI) r *= 1+0.15*Math.sin(a); 
                        r += Math.sin(a*5 + this.time*2)*1.2; 
                    }
                    
                    let x = cx + r * Math.cos(a); 
                    let y = cY + r * Math.sin(a);
                    
                    if(type === 'dry_eye') {
                        let evaporation = Math.sin(a * 15 + this.time * 5) + Math.cos(a * 10 - this.time);
                        if(evaporation > 0.8) { c.moveTo(x, y); continue; }
                        // إضافة ألوان حمراء متقطعة لمحاكاة الجفاف بالخريطة
                        if(this.showHeatmap && evaporation > 0.4) {
                            c.fillStyle = 'rgba(255,0,0,0.2)';
                            c.fillRect(x-2, y-2, 4, 4);
                        }
                    }
                    
                    if(a===0) c.moveTo(x,y); else c.lineTo(x,y);
                }
                c.stroke();
            }
        }

        // رسم مؤشر التصويب
        c.shadowBlur = 0;
        c.strokeStyle = 'rgba(255, 255, 255, 0.5)'; c.lineWidth = 1;
        c.beginPath(); c.moveTo(cx - 15, cy); c.lineTo(cx + 15, cy); c.stroke();
        c.beginPath(); c.moveTo(cx, cy - 15); c.lineTo(cx, cy + 15); c.stroke();

        this.animId = requestAnimationFrame(this.animate.bind(this));
    }
};
