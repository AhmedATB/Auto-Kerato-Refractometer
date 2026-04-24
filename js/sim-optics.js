const simOptics = {
    initialized: false, canvas: document.getElementById('opticsCanvas'), ctx: null, isRunning: false, time: 0,
    slider: document.getElementById('refractSlider'), condition: document.getElementById('patientCondition'),
    
    init() { this.ctx = this.canvas.getContext('2d'); this.resize(); window.addEventListener('resize', () => { if(this.isRunning) this.resize(); }); this.initialized = true; },
    start() { this.isRunning = true; this.animate(); },
    stop() { this.isRunning = false; cancelAnimationFrame(this.animId); },
    resize() { this.canvas.width = this.canvas.parentElement.clientWidth; this.canvas.height = this.canvas.parentElement.clientHeight; },
    
    animate() {
        if(!this.isRunning) return;
        const c = this.ctx; const w = this.canvas.width; const h = this.canvas.height;
        this.time += 0.1;
        c.fillStyle = '#000'; c.fillRect(0, 0, w, h);
        
        const val = parseFloat(this.slider.value); 
        const cond = this.condition.value;
        const cx = w/2 + 50; const cy = h/2;

        let noise = 0; let readingColor = '#39ff14'; let desc = "إشارة نقية.";
        if(cond === 'shake') { noise = (Math.random() - 0.5) * 1.5; readingColor = '#ffaa00'; desc = "ERR: حركة عالية، قراءة غير مستقرة."; }
        if(cond === 'cataract') { noise = (Math.random() - 0.5) * 0.5; readingColor = '#ff003c'; desc = "ERR: إشارة ضعيفة جداً (Media Opacity)."; }
        
        let finalReading = (val + noise).toFixed(2);
        document.getElementById('optics-result').innerText = `SPH: ${finalReading > 0 ? '+':''}${finalReading} D`;
        document.getElementById('optics-result').style.color = readingColor;
        document.getElementById('optics-desc').innerText = desc;

        let drawCy = cy + (cond === 'shake' ? Math.sin(this.time)*5 : 0); 
        c.lineWidth = 3; c.fillStyle = '#050a15'; c.strokeStyle = '#1e293b'; c.beginPath(); c.ellipse(cx, drawCy, 140, 110, 0, 0, Math.PI*2); c.fill(); c.stroke();
        c.strokeStyle = '#00f0ff'; c.beginPath(); c.arc(cx - 140, drawCy, 55, Math.PI*-0.35, Math.PI*0.35, false); c.stroke();
        
        c.fillStyle = cond === 'cataract' ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.1)'; 
        c.beginPath(); c.ellipse(cx - 90, drawCy, 15, 45, 0, 0, Math.PI*2); c.fill();

        const retinaX = cx + 140; const focalX = retinaX + (val * 15); const lensX = cx - 90;
        c.strokeStyle = cond === 'cataract' ? 'rgba(255,0,0,0.2)' : 'rgba(0, 240, 255, 0.8)';
        c.lineWidth = 2;
        [-40, 0, 40].forEach(startY => {
            c.beginPath(); c.moveTo(0, cy + startY); c.lineTo(lensX, drawCy + startY); 
            if(cond !== 'cataract') {
                if(focalX < retinaX) { c.lineTo(focalX, drawCy); let slope = (drawCy - (drawCy + startY)) / (focalX - lensX); c.lineTo(retinaX, drawCy + slope*(retinaX-focalX)); } 
                else c.lineTo(focalX, drawCy);
            } else {
                c.lineTo(lensX + 50, drawCy + startY + (Math.random()-0.5)*100);
            }
            c.stroke();
        });

        this.animId = requestAnimationFrame(this.animate.bind(this));
    }
};
