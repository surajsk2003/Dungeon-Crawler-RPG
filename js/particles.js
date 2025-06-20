class Particle {
    constructor(x, y, lifetime = 1000) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.lifetime = lifetime;
        this.age = 0;
        this.alpha = 1;
        this.scale = 1;
        this.color = '#ffffff';
        this.dead = false;
    }

    update(deltaTime) {
        this.age += deltaTime;
        this.x += this.vx * (deltaTime / 1000);
        this.y += this.vy * (deltaTime / 1000);
        
        // Fade out over lifetime
        this.alpha = Math.max(0, 1 - (this.age / this.lifetime));
        
        if (this.age >= this.lifetime) {
            this.dead = true;
        }
    }

    render(ctx) {
        if (this.dead || this.alpha <= 0) return;
        
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.scale(this.scale, this.scale);
        
        this.draw(ctx);
        
        ctx.restore();
    }

    draw(ctx) {
        // Override in subclasses
        ctx.fillStyle = this.color;
        ctx.fillRect(-2, -2, 4, 4);
    }

    isDead() {
        return this.dead;
    }
}

class DamageNumber extends Particle {
    constructor(x, y, damage, color = '#ff4444') {
        super(x, y, 1500);
        this.damage = damage;
        this.color = color;
        this.vy = -60; // Float upward
        this.scale = 1.5;
        this.font = '16px monospace';
    }

    update(deltaTime) {
        super.update(deltaTime);
        // Scale down over time
        this.scale = 1.5 * (1 - this.age / this.lifetime * 0.5);
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.font = `bold ${this.font}`;
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeText(this.damage.toString(), 0, 0);
        ctx.fillText(this.damage.toString(), 0, 0);
    }
}

class HealParticle extends DamageNumber {
    constructor(x, y, amount) {
        super(x, y, amount, '#00ff00');
        this.damage = `+${amount}`;
    }
}

class ManaParticle extends DamageNumber {
    constructor(x, y, amount) {
        super(x, y, amount, '#0080ff');
        this.damage = `+${amount}`;
    }
}

class BloodParticle extends Particle {
    constructor(x, y) {
        super(x, y);
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4 - 1;
        this.color = '#cc0000';
        this.size = 2 + Math.random() * 2;
        this.gravity = 0.2;
        this.life = 800 + Math.random() * 400;
        this.maxLife = this.life;
    }
}

class FireParticle extends Particle {
    constructor(x, y) {
        super(x, y);
        this.vx = (Math.random() - 0.5) * 3;
        this.vy = (Math.random() - 0.5) * 3 - 2;
        this.colors = ['#ff4400', '#ff6600', '#ff8800', '#ffaa00'];
        this.colorIndex = 0;
        this.size = 3 + Math.random() * 4;
        this.life = 600 + Math.random() * 400;
        this.maxLife = this.life;
        this.gravity = -0.1;
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.colorIndex = Math.floor((1 - this.alpha) * this.colors.length);
        this.color = this.colors[Math.min(this.colorIndex, this.colors.length - 1)];
        this.size *= 0.99;
    }

    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class LightningParticle extends Particle {
    constructor(startX, startY, endX, endY) {
        super(startX, startY);
        this.endX = endX;
        this.endY = endY;
        this.segments = [];
        this.life = 200;
        this.maxLife = 200;
        this.generateLightning();
    }

    generateLightning() {
        const segments = 8;
        const dx = (this.endX - this.x) / segments;
        const dy = (this.endY - this.y) / segments;
        
        this.segments = [{ x: this.x, y: this.y }];
        
        for (let i = 1; i < segments; i++) {
            const x = this.x + dx * i + (Math.random() - 0.5) * 20;
            const y = this.y + dy * i + (Math.random() - 0.5) * 20;
            this.segments.push({ x, y });
        }
        
        this.segments.push({ x: this.endX, y: this.endY });
    }

    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.strokeStyle = '#00aaff';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#00aaff';
        ctx.shadowBlur = 10;
        
        ctx.beginPath();
        ctx.moveTo(this.segments[0].x, this.segments[0].y);
        
        for (let i = 1; i < this.segments.length; i++) {
            ctx.lineTo(this.segments[i].x, this.segments[i].y);
        }
        
        ctx.stroke();
        ctx.restore();
    }
}

class LevelUpParticle extends Particle {
    constructor(x, y) {
        super(x, y);
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = -Math.random() * 3 - 1;
        this.color = '#ffff00';
        this.size = 2 + Math.random() * 2;
        this.life = 2000;
        this.maxLife = 2000;
        this.sparkle = true;
    }

    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 8;
        
        // Draw star shape
        const spikes = 5;
        const outerRadius = this.size;
        const innerRadius = this.size / 2;
        
        ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / spikes;
            const x = this.x + Math.cos(angle) * radius;
            const y = this.y + Math.sin(angle) * radius;
            
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}

class ShieldParticle extends Particle {
    constructor(x, y) {
        super(x, y);
        this.radius = 20;
        this.maxRadius = 40;
        this.color = '#00aaff';
        this.life = 1000;
        this.maxLife = 1000;
        this.pulseSpeed = 0.05;
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.radius = this.maxRadius * (0.5 + 0.5 * Math.sin(Date.now() * this.pulseSpeed));
    }

    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha * 0.3;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
}

class TeleportParticle extends Particle {
    constructor(x, y) {
        super(x, y);
        this.particles = [];
        this.life = 800;
        this.maxLife = 800;
        
        // Create swirl particles
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const radius = 20;
            this.particles.push({
                x: x + Math.cos(angle) * radius,
                y: y + Math.sin(angle) * radius,
                angle: angle,
                radius: radius
            });
        }
    }

    update(deltaTime) {
        super.update(deltaTime);
        
        this.particles.forEach(p => {
            p.angle += 0.2;
            p.radius *= 0.95;
            p.x = this.x + Math.cos(p.angle) * p.radius;
            p.y = this.y + Math.sin(p.angle) * p.radius;
        });
    }

    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = '#aa00ff';
        ctx.shadowColor = '#aa00ff';
        ctx.shadowBlur = 8;
        
        this.particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.restore();
    }
}

// Particle system manager
class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    addParticle(particle) {
        this.particles.push(particle);
    }

    update(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update(deltaTime);
            
            if (particle.isDead()) {
                this.particles.splice(i, 1);
            }
        }
    }

    render(ctx) {
        this.particles.forEach(particle => {
            particle.render(ctx);
        });
    }

    clear() {
        this.particles = [];
    }

    getParticleCount() {
        return this.particles.length;
    }
}

window.Particle = Particle;
window.DamageNumber = DamageNumber;
window.HealParticle = HealParticle;
window.ManaParticle = ManaParticle;
window.BloodParticle = BloodParticle;
window.FireParticle = FireParticle;
window.LightningParticle = LightningParticle;
window.LevelUpParticle = LevelUpParticle;
window.ShieldParticle = ShieldParticle;
window.TeleportParticle = TeleportParticle;
window.ParticleSystem = ParticleSystem;