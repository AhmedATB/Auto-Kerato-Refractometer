const simMires = {
    initialized: false, canvas: document.getElementById('miresCanvas'), ctx: null, time: 0, animId: null, isRunning: false,
    
    init() { this.ctx = this.canvas.getContext('2d'); this.initialized = true; this.update(); },
    start() { this.isRunning = true; this.animate(); },
    stop() { this.isRunning = false; cancelAnimationFrame(this.animId); },
    
    update() {
        const type = document.getElementById('corneaSelect').value; const log = document.getElementById('mire-analysis');
        let texts = {
            'normal': "القرنية سليمة.", 'astig_with': "استجماتيزم (Axis ≈ 180°).", 'astig_against': "استجماتيزم (Axis ≈ 90°).",
            'keratoconus': "ERR: قرنية مخروطية.", 'dry_eye': "ERR: طبقة الدموع متكسرة."
        };
        log.innerText = texts[type];
    },
    
    animate() {
        if(!this.isRunning) return;
        const c = this.ctx; const w = this.canvas.width; const h = this.canvas.height; const cx = w/2; const cy = h/2; const type = document.getElementById('corneaSelect').value;
        this.time += 0.05; c.fillStyle = '#000'; c.fillRect(0, 0, w, h);
        
        c.lineWidth = 2;
        for(let i=1; i<=5; i++) {
            let baseRadius = i * 28; c.strokeStyle = `rgba(0, 240, 255, ${1 - (i*0.15)})`; c.beginPath();
            for(let a=0; a<=Math.PI*2; a+=0.05) {
                let r = baseRadius; let cY = cy;
                if(type === 'astig_with') r += (i*3) * Math.cos(2*a); 
                else if(type === 'astig_against') r += (i*3) * Math.sin(2*a); 
                else if(type === 'keratoconus') { cY += i*8; if(a>0 && a<Math.PI) r *= 1+0.1*Math.sin(a); r += Math.sin(a*3+this.time)*2; }
                
                let x = cx + r * Math.cos(a); let y = cY + r * Math.sin(a);
                if(type === 'dry_eye' && Math.random() < 0.1) { c.moveTo(x, y); continue; }
                if(a===0) c.moveTo(x,y); else c.lineTo(x,y);
            }
            c.stroke();
        }
        this.animId = requestAnimationFrame(this.animate.bind(this));
    }
};
