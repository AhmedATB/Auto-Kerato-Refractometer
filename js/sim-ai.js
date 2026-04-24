const simAI = {
    initialized: false, rawCanvas: document.getElementById('aiRawCanvas'), procCanvas: document.getElementById('aiProcessedCanvas'),
    rawCtx: null, procCtx: null, time: 0, animId: null, trackingActive: false, eyeX: 0, eyeY: 0, trackX: 0, trackY: 0, isRunning: false,
    
    init() { this.rawCtx = this.rawCanvas.getContext('2d'); this.procCtx = this.procCanvas.getContext('2d'); this.resize(); window.addEventListener('resize', () => { if(this.isRunning) this.resize(); }); this.initialized = true; },
    start() { this.isRunning = true; this.resize(); this.animate(); },
    stop() { this.isRunning = false; cancelAnimationFrame(this.animId); },
    
    resize() { 
        if(this.rawCanvas.parentElement) {
            this.rawCanvas.width = this.rawCanvas.parentElement.clientWidth; this.rawCanvas.height = 250; 
            this.procCanvas.width = this.procCanvas.parentElement.clientWidth; this.procCanvas.height = 250; 
        }
    },
    
    process() { this.trackingActive = true; document.getElementById('ai-log').innerText = "> AUTO-TRACKING ENGAGED..."; },
    
    animate() {
        if(!this.isRunning) return;
        this.time += 0.05; const w = this.rawCanvas.width; const h = this.rawCanvas.height; const cx = w/2; const cy = h/2;
        
        this.eyeX = cx + Math.sin(this.time*0.8)*50 + Math.sin(this.time*15)*2; 
        this.eyeY = cy + Math.cos(this.time*0.6)*30 + Math.cos(this.time*12)*2;

        const cRaw = this.rawCtx; cRaw.fillStyle = '#050505'; cRaw.fillRect(0,0,w,h);
        cRaw.fillStyle = '#111'; cRaw.beginPath(); cRaw.arc(this.eyeX, this.eyeY, 80, 0, Math.PI*2); cRaw.fill();
        cRaw.fillStyle = 'rgba(255,255,255,0.05)'; for(let i=0; i<300; i++) cRaw.fillRect(Math.random()*w, Math.random()*h, 2, 2);

        const c = this.procCtx;
        if(!this.trackingActive) { c.fillStyle = '#000'; c.fillRect(0,0,w,h); c.fillStyle = '#fff'; c.fillText("STANDBY", cx, cy); } 
        else {
            c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(0,0,w,h); 
            let dx = this.eyeX - this.trackX; let dy = this.eyeY - this.trackY; 
            this.trackX += dx * 0.15; this.trackY += dy * 0.15; 

            if(Math.sqrt(dx*dx + dy*dy) < 5) c.strokeStyle = '#ff003c'; else c.strokeStyle = '#39ff14';
            
            c.lineWidth = 2; let tx = this.trackX; let ty = this.trackY;
            c.strokeRect(tx-45, ty-45, 90, 90);
            c.beginPath(); c.arc(tx, ty, 30, 0, Math.PI*2); c.stroke();
        }
        this.animId = requestAnimationFrame(this.animate.bind(this));
    }
};
