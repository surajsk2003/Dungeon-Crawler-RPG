// Game Analytics System
class GameAnalytics {
    constructor() {
        this.sessionStart = Date.now();
        this.events = [];
        this.isEnabled = true;
        this.maxEvents = 100; // Prevent memory issues
    }

    // Core tracking methods
    static trackEvent(eventName, parameters = {}) {
        if (!this.isEnabled) return;
        
        const event = {
            name: eventName,
            timestamp: Date.now(),
            parameters: {
                ...parameters,
                session_id: this.getSessionId(),
                user_agent: navigator.userAgent,
                screen_resolution: `${screen.width}x${screen.height}`,
                game_version: '1.0.0'
            }
        };
        
        // Store locally
        this.storeEvent(event);
        
        // Send to external analytics if available
        this.sendToExternalAnalytics(eventName, event.parameters);
        
        console.log('Analytics:', eventName, parameters);
    }

    // Game-specific tracking methods
    static trackGameStart() {
        this.trackEvent('game_start', {
            start_method: 'new_game'
        });
    }

    static trackGameLoad() {
        this.trackEvent('game_load', {
            start_method: 'load_game'
        });
    }

    static trackLevelComplete(level, timeSpent) {
        this.trackEvent('level_complete', {
            level_number: level,
            time_spent: Math.round(timeSpent / 1000), // seconds
            completion_method: 'stairs'
        });
    }

    static trackPlayerDeath(level, cause, enemyType = null) {
        this.trackEvent('player_death', {
            level_number: level,
            death_cause: cause,
            enemy_type: enemyType,
            survival_time: this.getSessionDuration()
        });
    }

    static trackItemFound(itemType, level) {
        this.trackEvent('item_found', {
            item_type: itemType,
            level_number: level,
            discovery_method: 'exploration'
        });
    }

    static trackCombatStart(enemyType, level) {
        this.trackEvent('combat_start', {
            enemy_type: enemyType,
            level_number: level,
            player_health: game.player?.stats?.health || 0
        });
    }

    static trackCombatEnd(result, enemyType, level) {
        this.trackEvent('combat_end', {
            result: result, // 'victory', 'defeat', 'flee'
            enemy_type: enemyType,
            level_number: level,
            player_health: game.player?.stats?.health || 0
        });
    }

    static trackSaveGame(method) {
        this.trackEvent('save_game', {
            save_method: method, // 'manual', 'auto', 'quick'
            level_number: game.dungeon?.currentLevel || 1,
            playtime: this.getSessionDuration()
        });
    }

    static trackPerformanceIssue(issueType, details) {
        this.trackEvent('performance_issue', {
            issue_type: issueType, // 'low_fps', 'memory_high', 'load_slow'
            details: details,
            browser: this.getBrowserInfo()
        });
    }

    static trackError(errorType, message, stack = null) {
        this.trackEvent('game_error', {
            error_type: errorType,
            error_message: message,
            stack_trace: stack ? stack.substring(0, 500) : null, // Limit size
            browser: this.getBrowserInfo()
        });
    }

    // Utility methods
    static getSessionId() {
        if (!this.sessionId) {
            this.sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
        return this.sessionId;
    }

    static getSessionDuration() {
        return Date.now() - this.sessionStart;
    }

    static getBrowserInfo() {
        const ua = navigator.userAgent;
        if (ua.includes('Chrome')) return 'Chrome';
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Safari')) return 'Safari';
        if (ua.includes('Edge')) return 'Edge';
        return 'Unknown';
    }

    static storeEvent(event) {
        try {
            let events = JSON.parse(localStorage.getItem('gameAnalytics') || '[]');
            events.push(event);
            
            // Keep only recent events
            if (events.length > this.maxEvents) {
                events = events.slice(-this.maxEvents);
            }
            
            localStorage.setItem('gameAnalytics', JSON.stringify(events));
        } catch (error) {
            console.warn('Failed to store analytics event:', error);
        }
    }

    static sendToExternalAnalytics(eventName, parameters) {
        // Google Analytics 4 integration
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, parameters);
        }
        
        // Custom analytics endpoint (if available)
        if (this.customEndpoint) {
            fetch(this.customEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ event: eventName, data: parameters })
            }).catch(error => {
                console.warn('Failed to send analytics:', error);
            });
        }
    }

    // Performance monitoring
    static startPerformanceMonitoring() {
        // Monitor FPS
        let frameCount = 0;
        let lastTime = performance.now();
        
        const checkFPS = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 5000) { // Check every 5 seconds
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                
                if (fps < 30) {
                    this.trackPerformanceIssue('low_fps', { fps: fps });
                }
                
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(checkFPS);
        };
        
        requestAnimationFrame(checkFPS);
        
        // Monitor memory usage
        if (performance.memory) {
            setInterval(() => {
                const memoryMB = performance.memory.usedJSHeapSize / (1024 * 1024);
                if (memoryMB > 150) { // Alert if over 150MB
                    this.trackPerformanceIssue('memory_high', { 
                        memory_mb: Math.round(memoryMB) 
                    });
                }
            }, 30000); // Check every 30 seconds
        }
    }

    // Generate analytics report
    static generateReport() {
        try {
            const events = JSON.parse(localStorage.getItem('gameAnalytics') || '[]');
            const report = {
                total_events: events.length,
                session_duration: this.getSessionDuration(),
                events_by_type: {},
                performance_issues: [],
                errors: []
            };
            
            events.forEach(event => {
                // Count events by type
                report.events_by_type[event.name] = (report.events_by_type[event.name] || 0) + 1;
                
                // Collect performance issues
                if (event.name === 'performance_issue') {
                    report.performance_issues.push(event);
                }
                
                // Collect errors
                if (event.name === 'game_error') {
                    report.errors.push(event);
                }
            });
            
            return report;
        } catch (error) {
            console.error('Failed to generate analytics report:', error);
            return null;
        }
    }

    // Export data for analysis
    static exportData() {
        try {
            const events = JSON.parse(localStorage.getItem('gameAnalytics') || '[]');
            const dataStr = JSON.stringify(events, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `game-analytics-${Date.now()}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to export analytics data:', error);
        }
    }

    // Clear stored data
    static clearData() {
        try {
            localStorage.removeItem('gameAnalytics');
            console.log('Analytics data cleared');
        } catch (error) {
            console.error('Failed to clear analytics data:', error);
        }
    }

    // Enable/disable analytics
    static setEnabled(enabled) {
        this.isEnabled = enabled;
        console.log('Analytics', enabled ? 'enabled' : 'disabled');
    }
}

// Initialize analytics
GameAnalytics.sessionStart = Date.now();
GameAnalytics.isEnabled = true;
GameAnalytics.maxEvents = 100;

// Start performance monitoring
GameAnalytics.startPerformanceMonitoring();

// Global error handler
window.addEventListener('error', (event) => {
    GameAnalytics.trackError('javascript_error', event.message, event.error?.stack);
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    GameAnalytics.trackError('promise_rejection', event.reason?.message || 'Unknown promise rejection');
});

// Export for global use
window.GameAnalytics = GameAnalytics;