class Particle {
    constructor(x, y, vx, vy, color, glow) { this.x = x; this.y = y; this.vx = vx; this.vy = vy; this.color = color; this.glow = glow; this.life = 1.0; }
    update() { this.x += this.vx; this.y += this.vy; this.life -= 0.005; }
    draw(c) { if(this.life <= 0) return; c.globalAlpha = this.life; c.shadowBlur = this.glow; c.shadowColor = this.color; c.fillStyle = this.color; c.beginPath(); c.arc(this.x, this.y, 3, 0, Math.PI*2); c.fill(); c.globalAlpha = 1.0; c.shadowBlur = 0; }
}

const simLight = {
    initialized: false, canvas: document.getElementById('lightPathCanvas'), ctx: null, time: 0, animId: null, foggingOn: false, firing: false, particles: [], lensCurrentX: 0, eyeLensThick: 18, isRunning: false,
    
    init() { this.ctx = this.canvas.getContext('2d'); this.resize(); window.addEventListener('resize', () => { if(this.isRunning) this.resize(); }); this.initialized = true; },
    start() { this.isRunning = true; this.animate(); },
    stop() { this.isRunning = false; cancelAnimationFrame(this.animId); },
    resize() { this.canvas.width = this.canvas.parentElement.clientWidth; this.canvas.height = this.canvas.parentElement.clientHeight; },
    
    toggleFogging() {
        this.foggingOn = !this.foggingOn;
        document.getElementById('btn-fogging').innerText = this.foggingOn ? "مفعّل (تشويش)" : "مغلق (واضح)";
        document.getElementById('btn-fogging').className = this.foggingOn ? "text-green-400 font-bold" : "text-red-400 font-bold";
        const pBox = document.getElementById('fogging-explanation'); const pText = document.getElementById('physio-status');
        
        if(this.foggingOn) {
            pBox.className = "mt-6 p-4 border-2 border-green-500/30 rounded-lg bg-green-950/20";
            pText.innerHTML = "<span class='text-green-400'>مسترخية (Relaxed).</span> قراءة دقيقة.";
        } else {
            pBox.className = "mt-6 p-4 border-2 border-amber-500/30 rounded-lg bg-amber-950/20";
            pText.innerHTML = "<span class='text-red-400'>متشنجة (Accommodation).</span> قراءة خاطئة!";
        }
    },
    
    fireLaser() {
        if(this.firing) return; this.firing = true; 
        let sldY = this.canvas.height/2; let sldX = this.canvas.width * 0.1;
        for(let i=0; i<15; i++) { setTimeout(() => { this.particles.push(new Particle(sldX+20, sldY, 8, 0, '#ff003c', 15)); }, i*50); }
        setTimeout(() => { this.firing = false; }, 2500); 
    },
    
    animate() {
        if(!this.isRunning) return;
        const c = this.ctx; const w = this.canvas.width; const h = this.canvas.height;
        this.time += 0.05; c.fillStyle = 'rgba(0, 0, 0, 0.4)'; c.fillRect(0, 0, w, h);
        const cy = h/2; const sldX = w*0.1; const mirrorX = w*0.4; const eyeX = w*0.85; const ccdY = h*0.85;
        
        const targetLensX = this.foggingOn ? w*0.45 : w*0.65;
        if(this.lensCurrentX === 0) this.lensCurrentX = targetLensX;
        this.lensCurrentX += (targetLensX - this.lensCurrentX) * 0.05;
        this.eyeLensThick += ((this.foggingOn ? 8 : 18) - this.eyeLensThick) * 0.05;

        for(let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i]; p.update();
            if(p.vx > 0 && p.x >= eyeX - 55) { p.vx *= -0.8; p.vy += (Math.random()-0.5)*2; p.color = '#39ff14'; p.glow = 15; }
            if(p.vx < 0 && p.x <= mirrorX && p.y < cy+10) { p.vx = 0; p.vy = 8; }
            p.draw(c); if(p.life <= 0 || p.y > h) this.particles.splice(i, 1);
        }

        c.fillStyle = '#111'; c.strokeStyle = '#9d00ff'; c.lineWidth = 3; c.fillRect(sldX-20, cy-30, 40, 60); c.strokeRect(sldX-20, cy-30, 40, 60);
        c.strokeStyle = '#00f0ff'; c.beginPath(); c.moveTo(mirrorX-30, cy-30); c.lineTo(mirrorX+30, cy+30); c.stroke();
        c.strokeStyle = '#fff'; c.beginPath(); c.ellipse(this.lensCurrentX, cy, 10, 45, 0, 0, Math.PI*2); c.stroke();
        c.fillStyle = '#222'; c.strokeStyle = '#ffaa00'; c.fillRect(mirrorX-40, ccdY-15, 80, 30); c.strokeRect(mirrorX-40, ccdY-15, 80, 30);
        
        c.fillStyle = '#0f172a'; c.strokeStyle = '#334155'; c.beginPath(); c.arc(eyeX, cy, 60, 0, Math.PI*2); c.fill(); c.stroke();
        c.strokeStyle = '#00f0ff'; c.beginPath(); c.arc(eyeX-60, cy, 25, Math.PI*-0.4, Math.PI*0.4, false); c.stroke();
        c.fillStyle = this.foggingOn ? 'rgba(57,255,20,0.2)' : 'rgba(255,0,60,0.2)'; c.beginPath(); c.ellipse(eyeX-35, cy, this.eyeLensThick, 22, 0, 0, Math.PI*2); c.fill();

        this.animId = requestAnimationFrame(this.animate.bind(this));
    }
};
