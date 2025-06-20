class ParticleSystem {
    constructor() {
        this.particles = [];
        this.maxParticles = 200;
    }

    addParticle(particle) {
        if (this.particles.length < this.maxParticles) {
            this.particles.push(particle);
        }
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

    render(ctx, camera) {
        this.particles.forEach(particle => {
            if (camera.isVisible(particle.x, particle.y, 10, 10)) {
                particle.render(ctx);
            }
        });
    }

    clear() {
        this.particles = [];
    }

    getParticleCount() {
        return this.particles.length;
    }
}

class Particle {
    constructor(x, y, vx, vy, color = '#ffffff', life = 1000) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.life = life;
        this.maxLife = life;
        this.size = 2;
    }

    update(deltaTime) {
        this.x += this.vx * (deltaTime / 1000);
        this.y += this.vy * (deltaTime / 1000);
        this.life -= deltaTime;
    }

    render(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.fillStyle = this.color;
        ctx.globalAlpha = alpha;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.globalAlpha = 1;
    }

    isDead() {
        return this.life <= 0;
    }
}

window.ParticleSystem = ParticleSystem;
window.Particle = Particle;