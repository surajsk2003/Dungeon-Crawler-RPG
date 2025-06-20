// Combat system utilities and calculations
class Combat {
    static calculateDamage(attacker, defender) {
        const baseDamage = attacker.stats?.damage || attacker.damage || 10;
        const defense = defender.stats?.defense || 0;
        
        // Apply variance (±20%)
        const variance = 0.8 + Math.random() * 0.4;
        const damage = Math.max(1, Math.floor((baseDamage - defense) * variance));
        
        return damage;
    }

    static calculateCritical(attacker) {
        const critChance = attacker.stats?.critChance || 0.05;
        return Math.random() < critChance;
    }

    static calculateHitChance(attacker, defender) {
        const baseHit = 0.85;
        const attackerDex = attacker.stats?.dexterity || 10;
        const defenderDex = defender.stats?.dexterity || 10;
        
        const hitChance = baseHit + (attackerDex - defenderDex) * 0.02;
        return Math.max(0.1, Math.min(0.95, hitChance));
    }

    static processAttack(attacker, defender) {
        const hitChance = this.calculateHitChance(attacker, defender);
        
        if (Math.random() > hitChance) {
            return { hit: false, damage: 0, critical: false };
        }
        
        const critical = this.calculateCritical(attacker);
        let damage = this.calculateDamage(attacker, defender);
        
        if (critical) {
            damage = Math.floor(damage * 1.5);
        }
        
        return { hit: true, damage, critical };
    }
}

window.Combat = Combat;