// Utility functions
const Utils = {
    clamp: (value, min, max) => Math.max(min, Math.min(max, value)),
    
    lerp: (start, end, factor) => start + (end - start) * factor,
    
    distance: (x1, y1, x2, y2) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2),
    
    random: (min, max) => Math.random() * (max - min) + min,
    
    randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    
    choose: (array) => array[Math.floor(Math.random() * array.length)],
    
    degToRad: (degrees) => degrees * Math.PI / 180,
    
    radToDeg: (radians) => radians * 180 / Math.PI,
    
    normalize: (x, y) => {
        const length = Math.sqrt(x * x + y * y);
        return length > 0 ? { x: x / length, y: y / length } : { x: 0, y: 0 };
    }
};

window.Utils = Utils;